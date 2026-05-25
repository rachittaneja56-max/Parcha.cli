import { eq } from "@repo/database";
import type { db } from "@repo/database";
import { usersTable, tokensTable } from "@repo/database/schema";
import { env } from "../env";
import { googleOAuth2Client } from "../clients/google-oauth";
import { GetAuthenticationMethodOutputSchema } from "../user/model";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { TRPCError } from "@trpc/server";
import { AuthError } from "./errors";

class AuthService {
  constructor(private readonly dbInstance: typeof db) { }
  private async sendEmail(to: string, subject: string, text: string) {
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return;
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT || 587,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
    try {
      await transporter.sendMail({
        from: env.SMTP_FROM || env.SMTP_USER,
        to,
        subject,
        text,
      });
    } catch (error) {
      console.error("[AUTH] Failed to send email:", error);
    }
  }

  public async getAuthenticationMethods(): Promise<ReadonlyArray<GetAuthenticationMethodOutputSchema>> {
    const supportedAuthenticationProviders: GetAuthenticationMethodOutputSchema[] = [];
    const isGoogleConfigured = !!(env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET);
    if (isGoogleConfigured) {
      const url = googleOAuth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
      });
      supportedAuthenticationProviders.push({
        provider: "GOOGLE_OAUTH",
        displayName: "Google",
        displayText: "Signin with Google",
        authUrl: url,
      });
    }
    return supportedAuthenticationProviders;
  }

  public async handleGoogleCallback(code: string) {
    const { tokens } = await googleOAuth2Client.getToken(code);
    if (!tokens.id_token) throw new AuthError("INTERNAL_SERVER_ERROR", "No ID token returned by Google OAuth");
    const ticket = await googleOAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_OAUTH_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) throw new AuthError("INTERNAL_SERVER_ERROR", "Invalid Google token payload");
    let user = await this.dbInstance.query.usersTable.findFirst({
      where: eq(usersTable.email, payload.email),
    });
    if (!user) {
      const [newUser] = await this.dbInstance.insert(usersTable).values({
        fullName: payload.name || "Google User",
        email: payload.email,
        emailVerified: true,
        profileImageUrl: payload.picture || null,
      }).returning();
      user = newUser;
    } else if (!user.emailVerified) {
      const [updatedUser] = await this.dbInstance.update(usersTable).set({
        emailVerified: true,
      }).where(eq(usersTable.id, user.id)).returning();
      user = updatedUser;
    }
    if (!user) throw new AuthError("INTERNAL_SERVER_ERROR", "Failed to resolve or create user");
    const sessionTokens = this.createTokens(user.id);
    return { user, ...sessionTokens };
  }

  public async verifySession(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string, type?: string };
      if (decoded.type && decoded.type !== "access") throw new AuthError("UNAUTHORIZED", "Invalid token type");
      const user = await this.dbInstance.query.usersTable.findFirst({
        where: eq(usersTable.id, decoded.userId),
      });
      if (!user) throw new AuthError("UNAUTHORIZED", "User not found");
      return user;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("UNAUTHORIZED", "Invalid or expired session");
    }
  }

  public createTokens(userId: string) {
    const accessToken = jwt.sign({ userId, type: "access" }, env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId, type: "refresh" }, env.JWT_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
  }

  public async refreshSession(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as { userId: string, type: string };
      if (decoded.type !== "refresh") throw new AuthError("UNAUTHORIZED", "Invalid token type");
      const user = await this.dbInstance.query.usersTable.findFirst({
        where: eq(usersTable.id, decoded.userId),
      });
      if (!user) throw new AuthError("UNAUTHORIZED", "User not found");
      return { user, tokens: this.createTokens(user.id) };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("UNAUTHORIZED", "Invalid or expired refresh token");
    }
  }

  public async registerNative(email: string, passwordHashRaw: string, fullName: string) {
    const existing = await this.dbInstance.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });
    const passwordHash = await bcrypt.hash(passwordHashRaw, 10);
    let user;
    if (existing) {
      const [updated] = await this.dbInstance.update(usersTable).set({ passwordHash }).where(eq(usersTable.email, email)).returning();
      user = updated;
    } else {
      const [inserted] = await this.dbInstance.insert(usersTable).values({
        email,
        fullName,
        passwordHash,
        emailVerified: false,
      }).returning();
      user = inserted;
    }
    const token = crypto.randomBytes(32).toString("hex");
    await this.dbInstance.insert(tokensTable).values({
      token,
      email,
      type: "verification",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });
    const verificationUrl = `${env.BASE_URL}/api/authentication/verify?token=${token}`;
    console.log(`\n[AUTH] Verification URL for ${email}: ${verificationUrl}\n`);
    await this.sendEmail(
      email,
      "Verify your email",
      `Click the following link to verify your email:\n\n${verificationUrl}`
    );
    if (!user) throw new AuthError("INTERNAL_SERVER_ERROR", "Failed to create user");
    return user;
  }

  public async loginNative(email: string, passwordRaw: string) {
    const user = await this.dbInstance.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });
    if (!user || !user.passwordHash) throw new AuthError("UNAUTHORIZED", "Invalid credentials");
    const isValid = await bcrypt.compare(passwordRaw, user.passwordHash);
    if (!isValid) throw new AuthError("UNAUTHORIZED", "Invalid credentials");
    const tokens = this.createTokens(user.id);
    return { user, ...tokens };
  }

  public async verifyEmail(token: string) {
    const tokenRecord = await this.dbInstance.query.tokensTable.findFirst({
      where: eq(tokensTable.token, token),
    });
    if (!tokenRecord || tokenRecord.type !== "verification" || tokenRecord.expiresAt < new Date()) {
      throw new AuthError("BAD_REQUEST", "Invalid or expired token");
    }
    await this.dbInstance.update(usersTable).set({ emailVerified: true }).where(eq(usersTable.email, tokenRecord.email));
    await this.dbInstance.delete(tokensTable).where(eq(tokensTable.token, token));
    return true;
  }

  public async forgotPassword(email: string) {
    const user = await this.dbInstance.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });
    if (!user) return true;
    const token = crypto.randomBytes(32).toString("hex");
    await this.dbInstance.insert(tokensTable).values({
      token,
      email,
      type: "password_reset",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });
    await this.sendEmail(email, "Password Reset", `Use this token to reset password: ${token}`);
    return true;
  }

  public async resetPassword(token: string, newPasswordRaw: string) {
    const tokenRecord = await this.dbInstance.query.tokensTable.findFirst({
      where: eq(tokensTable.token, token),
    });
    if (!tokenRecord || tokenRecord.type !== "password_reset" || tokenRecord.expiresAt < new Date()) {
      throw new AuthError("BAD_REQUEST", "Invalid or expired token");
    }
    const passwordHash = await bcrypt.hash(newPasswordRaw, 10);
    await this.dbInstance.update(usersTable).set({ passwordHash }).where(eq(usersTable.email, tokenRecord.email));
    await this.dbInstance.delete(tokensTable).where(eq(tokensTable.token, token));
    return true;
  }
}

export default AuthService;

import { db, eq } from "@repo/database";
import { usersTable, tokensTable } from "@repo/database/schema";
import { env } from "../env";
import { googleOAuth2Client } from "../clients/google-oauth";
import { GetAuthenticationMethodOutputSchema } from "../user/model";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { AuthError } from "./errors";

class AuthService {
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
    await transporter.sendMail({
      from: env.SMTP_USER,
      to,
      subject,
      text,
    });
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
    let user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, payload.email),
    });
    if (!user) {
      const [newUser] = await db.insert(usersTable).values({
        fullName: payload.name || "Google User",
        email: payload.email,
        emailVerified: payload.email_verified || false,
        profileImageUrl: payload.picture || null,
      }).returning();
      user = newUser;
    }
    if (!user) throw new AuthError("INTERNAL_SERVER_ERROR", "Failed to resolve or create user");
    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: "7d" });
    return { user, token };
  }

  public async verifySession(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, decoded.userId),
      });
      if (!user) throw new AuthError("UNAUTHORIZED", "User not found");
      return user;
    } catch (error) {
      throw new AuthError("UNAUTHORIZED", "Invalid or expired session");
    }
  }

  public async registerNative(email: string, passwordHashRaw: string, fullName: string) {
    const existing = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });
    const passwordHash = await bcrypt.hash(passwordHashRaw, 10);
    let user;
    if (existing) {
      const [updated] = await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.email, email)).returning();
      user = updated;
    } else {
      const [inserted] = await db.insert(usersTable).values({
        email,
        fullName,
        passwordHash,
        emailVerified: false,
      }).returning();
      user = inserted;
    }
    const token = crypto.randomBytes(32).toString("hex");
    await db.insert(tokensTable).values({
      token,
      email,
      type: "verification",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });
    await this.sendEmail(email, "Verify your email", `Use this token to verify: ${token}`);
    return user;
  }

  public async loginNative(email: string, passwordRaw: string) {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });
    if (!user || !user.passwordHash) throw new AuthError("UNAUTHORIZED", "Invalid credentials");
    const isValid = await bcrypt.compare(passwordRaw, user.passwordHash);
    if (!isValid) throw new AuthError("UNAUTHORIZED", "Invalid credentials");
    if (!user.emailVerified) throw new AuthError("UNAUTHORIZED", "Email not verified");
    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: "7d" });
    return { user, token };
  }

  public async verifyEmail(token: string) {
    const tokenRecord = await db.query.tokensTable.findFirst({
      where: eq(tokensTable.token, token),
    });
    if (!tokenRecord || tokenRecord.type !== "verification" || tokenRecord.expiresAt < new Date()) {
      throw new AuthError("BAD_REQUEST", "Invalid or expired token");
    }
    await db.update(usersTable).set({ emailVerified: true }).where(eq(usersTable.email, tokenRecord.email));
    await db.delete(tokensTable).where(eq(tokensTable.token, token));
    return true;
  }

  public async forgotPassword(email: string) {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });
    if (!user) return true;
    const token = crypto.randomBytes(32).toString("hex");
    await db.insert(tokensTable).values({
      token,
      email,
      type: "password_reset",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });
    await this.sendEmail(email, "Password Reset", `Use this token to reset password: ${token}`);
    return true;
  }

  public async resetPassword(token: string, newPasswordRaw: string) {
    const tokenRecord = await db.query.tokensTable.findFirst({
      where: eq(tokensTable.token, token),
    });
    if (!tokenRecord || tokenRecord.type !== "password_reset" || tokenRecord.expiresAt < new Date()) {
      throw new AuthError("BAD_REQUEST", "Invalid or expired token");
    }
    const passwordHash = await bcrypt.hash(newPasswordRaw, 10);
    await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.email, tokenRecord.email));
    await db.delete(tokensTable).where(eq(tokensTable.token, token));
    return true;
  }
}

export default AuthService;

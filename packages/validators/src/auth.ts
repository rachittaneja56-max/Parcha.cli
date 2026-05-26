import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  fullName: z.string().min(2),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const VerifyEmailSchema = z.object({
  token: z.string(),
});
export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const GoogleCallbackSchema = z.object({
  code: z.string(),
  state: z.string().optional(),
});
export type GoogleCallbackInput = z.infer<typeof GoogleCallbackSchema>;

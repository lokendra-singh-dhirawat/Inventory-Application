// src/schemas/authSchema.ts
import { z } from "zod";

// Schema for user registration (POST /auth/register)
export const registerSchema = z.object({
  email: z
    .string()
    .email("Invalid email address.")
    .min(1, "Email is required."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
    .regex(/[a-z]/, "Password must include at least one lowercase letter.")
    .regex(/[0-9]/, "Password must include at least one number."),
  // .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must include at least one special character."), // Optional: add if needed
  name: z.string().optional(), // Name is optional
});

// Schema for user login (POST /auth/login)
export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address.")
    .min(1, "Email is required."),
  password: z.string().min(1, "Password is required."), // Password needs to be present
});

// Schema for changing password (POST /auth/change-password)
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password is required."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long.")
      .regex(
        /[A-Z]/,
        "New password must include at least one uppercase letter."
      )
      .regex(
        /[a-z]/,
        "New password must include at least one lowercase letter."
      )
      .regex(/[0-9]/, "New password must include at least one number."),
    // .regex(/[!@#$%^&*(),.?":{}|<>]/, "New password must include at least one special character."),
    confirmNewPassword: z.string().min(1, "Confirm new password is required."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match.",
    path: ["confirmNewPassword"], // Zod will add error to this path if passwords don't match
  });

// Schema for requesting password reset link (POST /auth/forgot-password)
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Invalid email address.")
    .min(1, "Email is required."),
});

// Schema for resetting password with token (POST /auth/reset-password)
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required."), // The token received in the email link
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long.")
      .regex(
        /[A-Z]/,
        "New password must include at least one uppercase letter."
      )
      .regex(
        /[a-z]/,
        "New password must include at least one lowercase letter."
      )
      .regex(/[0-9]/, "New password must include at least one number."),
    // .regex(/[!@#$%^&*(),.?":{}|<>]/, "New password must include at least one special character."),
    confirmNewPassword: z.string().min(1, "Confirm new password is required."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match.",
    path: ["confirmNewPassword"],
  });

// Schema for refreshing access token (POST /auth/refresh-token)
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required."),
});

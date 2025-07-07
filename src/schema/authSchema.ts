import { z } from "zod";

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

  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address.")
    .min(1, "Email is required."),
  password: z.string().min(1, "Password is required."),
});

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

    confirmNewPassword: z.string().min(1, "Confirm new password is required."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match.",
    path: ["confirmNewPassword"],
  });

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required."),
});

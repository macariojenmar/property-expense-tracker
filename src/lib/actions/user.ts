"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ActionState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
} | null;

export async function updateProfile(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return { message: "Not authenticated" };
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return { message: "User ID not found in session" };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    const validatedFields = profileSchema.safeParse({ name, email });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findFirst({
        where: { 
          email: email,
          id: { not: userId }
        },
      });

      if (existingUser) {
        return { errors: { email: ["Email is already in use"] } };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });

    revalidatePath("/settings");
    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Update profile error detailed:", error);
    return { message: "Internal server error: " + (error instanceof Error ? error.message : String(error)) };
  }
}

export async function updatePassword(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return { message: "Not authenticated" };
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return { message: "User ID not found in session" };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const validatedFields = passwordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      return { message: "User not found or password not set" };
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordCorrect) {
      return { errors: { currentPassword: ["Incorrect current password"] } };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    console.error("Update password error detailed:", error);
    return { message: "Internal server error: " + (error instanceof Error ? error.message : String(error)) };
  }
}

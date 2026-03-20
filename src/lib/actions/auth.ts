"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getPlatformSettings } from "@/lib/limits";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignUpState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    message?: string[];
  };
  success?: boolean;
} | null;

export async function signUp(prevState: SignUpState, formData: FormData): Promise<SignUpState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = signUpSchema.safeParse({
    name,
    email,
    password,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { errors: { email: ["User already exists"] } };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const settings = await getPlatformSettings();
    const trialDays = settings?.trialPeriodDays || 7;
    
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + trialDays);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        accountType: "TRIAL",
        expiredAt,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Sign up error:", error);
    return { errors: { message: ["Internal server error"] } };
  }
}

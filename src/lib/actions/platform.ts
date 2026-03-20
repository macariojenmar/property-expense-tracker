"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

// Workaround for Prisma types if they are not exported/found
type UserRole = "USER" | "DEVELOPER";
type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "DELETED";
type AccountType = "TRIAL" | "STANDARD" | "PRO";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getPlatformSettings } from "@/lib/limits";

export type PlatformActionState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
  data?: any;
} | null;

const checkDeveloperAccess = async () => {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "DEVELOPER") {
    throw new Error("Unauthorized access");
  }
};

export async function getUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  accountType?: AccountType;
} = {}) {
  try {
    await checkDeveloperAccess();

    const {
      page = 1,
      limit = 10,
      search,
      role = "all" as any,
      status = "all" as any,
      accountType = "all" as any,
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role && role !== ("all" as any)) {
      where.role = role;
    }

    if (status && status !== ("all" as any)) {
      where.status = status;
    }

    if (accountType && accountType !== ("all" as any)) {
      where.accountType = accountType;
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          accountType: true,
          expiredAt: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: {
        users,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    console.error("Fetch users error:", error);
    return { success: false, message: "Failed to fetch users" };
  }
}

export async function getUser(userId: string) {
  try {
    await checkDeveloperAccess();
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        accountType: true,
        expiredAt: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      return { success: false, message: "User not found" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Fetch user error:", error);
    return { success: false, message: "Failed to fetch user" };
  }
}

export async function updateUserAccess(
  userId: string,
  data: { role?: string; status?: string; accountType?: string }
): Promise<PlatformActionState> {
  try {
    await checkDeveloperAccess();

    const updateData: any = {
      ...(data.role && { role: data.role as import("@prisma/client").UserRole }),
      ...(data.status && { status: data.status as import("@prisma/client").UserStatus }),
      ...(data.accountType && { accountType: data.accountType as import("@prisma/client").AccountType }),
    };

    if (data.accountType === "TRIAL") {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      });
      if (user) {
        const settings = await getPlatformSettings();
        const trialDays = settings?.trialPeriodDays || 7;
        const expiredAt = new Date(user.createdAt);
        expiredAt.setDate(expiredAt.getDate() + trialDays);
        updateData.expiredAt = expiredAt;
      }
    } else if (data.accountType && data.accountType !== "TRIAL") {
      updateData.expiredAt = null;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    revalidatePath("/platform/users");
    return { success: true, message: "User updated successfully" };
  } catch (error) {
    console.error("Update user error:", error);
    return { success: false, message: "Failed to update user" };
  }
}

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["USER", "DEVELOPER"]),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "DELETED"]),
  accountType: z.enum(["TRIAL", "STANDARD", "PRO"]),
});

export async function createUser(
  prevState: PlatformActionState,
  formData: FormData
): Promise<PlatformActionState> {
  try {
    await checkDeveloperAccess();

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as UserRole,
      status: formData.get("status") as UserStatus,
      accountType: formData.get("accountType") as AccountType,
    };

    const validatedFields = createUserSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors as any,
      };
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        errors: { email: ["Email is already in use"] },
      };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    let expiredAt: Date | null = null;
    if (data.accountType === "TRIAL") {
      const settings = await getPlatformSettings();
      const trialDays = settings?.trialPeriodDays || 7;
      expiredAt = new Date();
      expiredAt.setDate(expiredAt.getDate() + trialDays);
    }

    await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        expiredAt,
      },
    });

    revalidatePath("/platform/users");
    return { success: true, message: "User created successfully" };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, message: "Failed to create user" };
  }
}

export async function expireUserTrial(userId: string): Promise<PlatformActionState> {
  try {
    await checkDeveloperAccess();

    await prisma.user.update({
      where: { id: userId },
      data: {
        expiredAt: new Date(),
      },
    });

    revalidatePath("/platform/users");
    return { success: true, message: "User trial expired successfully" };
  } catch (error) {
    console.error("Expire user trial error:", error);
    return { success: false, message: "Failed to expire user trial" };
  }
}

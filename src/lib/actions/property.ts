"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getProperties() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const properties = await prisma.property.findMany({
    where: { userId: session.user.id },
    include: {
      expenses: {
        where: { status: { not: "DELETED" } },
        include: { pendingTo: true },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      },
      payouts: {
        where: { status: { not: "DELETED" } },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      },
      recurringExpenses: { include: { pendingTo: true } },
      waivedRecurringExpenses: true,
    },
    orderBy: { createdAt: "desc" },
  });

  interface PayoutQueryResult {
    amount: number;
    refundAmount: number | null;
  }

  interface ExpenseQueryResult {
    amount: number;
  }

  // Calculate fields that were mock in the frontend
  return properties.map((property) => {
    const totalPayouts = property.payouts.reduce(
      (sum: number, p: PayoutQueryResult) => sum + (p.amount - (p.refundAmount || 0)),
      0
    );
    const totalExpenses = property.expenses.reduce(
      (sum: number, e: ExpenseQueryResult) => sum + e.amount,
      0
    );
    const profit = totalPayouts - totalExpenses;

    return {
      ...property,
      profit,
      funds: (property.initialFunds || 0) + profit,
      currentExpense: totalExpenses,
    };
  });
}

export async function getProperty(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
    include: {
      expenses: {
        where: { status: { not: "DELETED" } },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        include: { pendingTo: true }
      },
      payouts: {
        where: { status: { not: "DELETED" } },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }]
      },
      recurringExpenses: { include: { pendingTo: true } },
      waivedRecurringExpenses: true,
    },
  });

  if (!property) return null;

  const totalPayouts = property.payouts.reduce(
    (sum: number, p: { amount: number; refundAmount: number | null }) => 
      sum + (p.amount - (p.refundAmount || 0)),
    0
  );
  const totalExpenses = property.expenses.reduce(
    (sum: number, e: { amount: number }) => sum + e.amount,
    0
  );
  const profit = totalPayouts - totalExpenses;

  return {
    ...property,
    profit,
    funds: (property.initialFunds || 0) + profit,
    currentExpense: totalExpenses,
  };
}

export async function createProperty(data: {
  name: string;
  location?: string;
  price?: number;
  initialFunds: number;
  recurringExpenses: { name: string; amount: number; day: number; pendingToId?: string }[];
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { checkUserLimit } = await import("@/lib/limits");
  const limitCheck = await checkUserLimit(session.user.id, "property");
  if (limitCheck.reached) {
    throw new Error(limitCheck.expired ? "ACCOUNT_EXPIRED" : "LIMIT_REACHED");
  }

  const property = await prisma.property.create({
    data: {
      name: data.name,
      location: data.location,
      price: data.price || 0,
      initialFunds: data.initialFunds,
      userId: session.user.id,
      recurringExpenses: {
        create: data.recurringExpenses,
      },
    },
  });

  revalidatePath("/properties");
  return property;
}

export async function deleteProperty(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.property.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/properties");
}

export async function updateProperty(
  id: string,
  data: {
    name: string;
    location?: string;
    price?: number;
    initialFunds: number;
    recurringExpenses: { id?: string; name: string; amount: number; day: number; pendingToId?: string }[];
  }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get current recurring expenses to identify what to delete
  const currentProperty = await prisma.property.findUnique({
    where: { id, userId: session.user.id },
    include: { recurringExpenses: true },
  });

  if (!currentProperty) {
    throw new Error("Property not found");
  }

  const currentExpenseIds = currentProperty.recurringExpenses.map((re: { id: string }) => re.id);
  const updatedExpenseIds = data.recurringExpenses
    .map((re: { id?: string }) => re.id)
    .filter(Boolean) as string[];

  const expenseIdsToDelete = currentExpenseIds.filter(
    (id: string) => !updatedExpenseIds.includes(id)
  );

  const property = await prisma.property.update({
    where: { id, userId: session.user.id },
    data: {
      name: data.name,
      location: data.location,
      price: data.price || 0,
      initialFunds: data.initialFunds,
      recurringExpenses: {
        deleteMany: {
          id: { in: expenseIdsToDelete },
        },
        upsert: data.recurringExpenses.map((exp) => ({
          where: { id: exp.id || "new-expense" },
          update: {
            name: exp.name,
            amount: exp.amount,
            day: exp.day,
            pendingToId: exp.pendingToId,
          },
          create: {
            name: exp.name,
            amount: exp.amount,
            day: exp.day,
            pendingToId: exp.pendingToId,
          },
        })),
      },
    },
  });

  revalidatePath("/properties");
  revalidatePath(`/properties/${id}`);
  return property;
}

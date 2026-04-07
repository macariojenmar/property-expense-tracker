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
      recurringExpenses: { include: { pendingTo: true } },
      waivedRecurringExpenses: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const propertyIds = properties.map((p) => p.id);

  const payoutsGrouped = await prisma.payout.groupBy({
    by: ["propertyId"],
    where: { propertyId: { in: propertyIds }, status: { not: "DELETED" } },
    _sum: { amount: true, refundAmount: true },
  });

  const expensesGrouped = await prisma.expense.groupBy({
    by: ["propertyId"],
    where: { propertyId: { in: propertyIds }, status: { not: "DELETED" } },
    _sum: { amount: true },
  });

  return properties.map((property) => {
    const payoutSum = payoutsGrouped.find((p) => p.propertyId === property.id)?._sum;
    const expenseSum = expensesGrouped.find((e) => e.propertyId === property.id)?._sum;

    const totalPayouts = (payoutSum?.amount || 0) - (payoutSum?.refundAmount || 0);
    const totalExpenses = expenseSum?.amount || 0;
    const profit = totalPayouts - totalExpenses;

    return {
      ...property,
      expenses: [],
      payouts: [],
      profit,
      funds: (property.initialFunds || 0) + profit,
      currentExpense: totalExpenses,
    };
  });
}

export async function getProperty(id: string, filter?: { start: string; end: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
    include: {
      recurringExpenses: { include: { pendingTo: true } },
      waivedRecurringExpenses: true,
    },
  });

  if (!property) return null;

  const expenses = await prisma.expense.findMany({
    where: {
      propertyId: id,
      status: { not: "DELETED" },
      ...(filter?.start && filter?.end ? { date: { gte: new Date(filter.start), lte: new Date(filter.end) } } : {})
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: { pendingTo: true }
  });

  const payouts = await prisma.payout.findMany({
    where: {
      propertyId: id,
      status: { not: "DELETED" },
      ...(filter?.start && filter?.end ? { date: { gte: new Date(filter.start), lte: new Date(filter.end) } } : {})
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }]
  });

  const allTimePayoutsAgg = await prisma.payout.aggregate({
    where: { propertyId: id, status: { not: "DELETED" } },
    _sum: { amount: true, refundAmount: true }
  });
  const allTimeExpensesAgg = await prisma.expense.aggregate({
    where: { propertyId: id, status: { not: "DELETED" } },
    _sum: { amount: true }
  });
  
  const totalPayouts = (allTimePayoutsAgg._sum.amount || 0) - (allTimePayoutsAgg._sum.refundAmount || 0);
  const totalExpenses = allTimeExpensesAgg._sum.amount || 0;
  const profit = totalPayouts - totalExpenses;

  // Calculate cumulative stats up to end date (if provided, else same as all time)
  let cumulativeProfit = profit;
  if (filter?.end) {
    const cumPayoutsAgg = await prisma.payout.aggregate({
      where: { propertyId: id, status: { not: "DELETED" }, date: { lte: new Date(filter.end) } },
      _sum: { amount: true, refundAmount: true }
    });
    const cumExpensesAgg = await prisma.expense.aggregate({
      where: { propertyId: id, status: { not: "DELETED" }, date: { lte: new Date(filter.end) } },
      _sum: { amount: true }
    });
    const cumPayouts = (cumPayoutsAgg._sum.amount || 0) - (cumPayoutsAgg._sum.refundAmount || 0);
    const cumExpenses = cumExpensesAgg._sum.amount || 0;
    cumulativeProfit = cumPayouts - cumExpenses;
  }

  return {
    ...property,
    expenses,
    payouts,
    profit,
    funds: (property.initialFunds || 0) + profit,
    currentExpense: totalExpenses,
    cumulativeProfit,
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

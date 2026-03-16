"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getExpenses(propertyId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await prisma.expense.findMany({
    where: {
      propertyId,
      property: { userId: session.user.id },
      status: { not: "DELETED" },
    },
    include: { pendingTo: true },
    orderBy: { date: "desc" },
  });
}

export async function createExpense(data: {
  name: string;
  amount: number;
  note?: string;
  date: string;
  propertyId: string;
  isRecurring?: boolean;
  recurringRef?: string;
  status?: "PENDING" | "SETTLED";
  pendingToId?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const expense = await prisma.expense.create({
    data: {
      name: data.name,
      amount: data.amount,
      note: data.note,
      date: new Date(data.date),
      propertyId: data.propertyId,
      isRecurring: data.isRecurring || false,
      recurringRef: data.recurringRef,
      status: data.status || "SETTLED",
      pendingToId: data.pendingToId,
    },
  });

  revalidatePath(`/properties/${data.propertyId}`);
  return expense;
}

export async function updateExpense(
  id: string,
  data: {
    name?: string;
    amount?: number;
    note?: string;
    date?: string;
    status?: "PENDING" | "SETTLED" | "DELETED";
    pendingToId?: string | null;
  }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const expense = await prisma.expense.update({
    where: {
      id,
      property: { userId: session.user.id },
    },
    data: {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
      ...(data.pendingToId !== undefined && { pendingToId: data.pendingToId }),
    },
  });

  revalidatePath(`/properties/${expense.propertyId}`);
  return expense;
}

export async function deleteExpense(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const expense = await prisma.expense.delete({
    where: {
      id,
      property: { userId: session.user.id },
    },
  });

  revalidatePath(`/properties/${expense.propertyId}`);
  return expense;
}

export async function softDeleteExpense(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const expense = await prisma.expense.update({
    where: {
      id,
      property: { userId: session.user.id },
    },
    data: {
      status: "DELETED",
    },
  });

  revalidatePath(`/properties/${expense.propertyId}`);
  return expense;
}

export async function settleExpenses(ids: string[], propertyId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const result = await prisma.expense.updateMany({
    where: {
      id: { in: ids },
      property: { userId: session.user.id },
    },
    data: {
      status: "SETTLED",
    },
  });

  revalidatePath(`/properties/${propertyId}`);
  return result;
}

export async function unsettleExpenses(ids: string[], propertyId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const result = await prisma.expense.updateMany({
    where: {
      id: { in: ids },
      property: { userId: session.user.id },
    },
    data: {
      status: "PENDING",
    },
  });

  revalidatePath(`/properties/${propertyId}`);
  return result;
}

"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function waiveRecurringExpense(data: {
  recurringExpenseId: string;
  monthKey: string;
  propertyId: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const waive = await prisma.recurringExpenseWaive.create({
    data: {
      recurringExpenseId: data.recurringExpenseId,
      monthKey: data.monthKey,
      propertyId: data.propertyId,
    },
  });

  revalidatePath(`/properties/${data.propertyId}`);
  return waive;
}

export async function unwaiveRecurringExpense(data: {
  recurringExpenseId: string;
  monthKey: string;
  propertyId: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const waive = await prisma.recurringExpenseWaive.delete({
    where: {
      monthKey_recurringExpenseId_propertyId: {
        monthKey: data.monthKey,
        recurringExpenseId: data.recurringExpenseId,
        propertyId: data.propertyId,
      },
    },
  });

  revalidatePath(`/properties/${data.propertyId}`);
  return waive;
}

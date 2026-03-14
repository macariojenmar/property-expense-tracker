"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// Status: "PAID" | "REFUNDED" | "PARTIALLY_REFUNDED"

export async function getPayouts(propertyId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await prisma.payout.findMany({
    where: {
      propertyId,
      property: { userId: session.user.id },
    },
    orderBy: { date: "desc" },
  });
}

export async function createPayout(data: {
  amount: number;
  date: string;
  propertyId: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const payout = await prisma.payout.create({
    data: {
      amount: data.amount,
      date: new Date(data.date),
      propertyId: data.propertyId,
    },
  });

  revalidatePath(`/properties/${data.propertyId}`);
  return payout;
}

export async function refundPayout(id: string, amount: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const payout = await prisma.payout.findUnique({
    where: { id, property: { userId: session.user.id } },
  });

  if (!payout) throw new Error("Payout not found");

  const newRefundAmount = (payout.refundAmount || 0) + amount;
  const status: "PAID" | "REFUNDED" | "PARTIALLY_REFUNDED" =
    newRefundAmount >= payout.amount
      ? "REFUNDED"
      : "PARTIALLY_REFUNDED";

  const updatedPayout = await prisma.payout.update({
    where: { id },
    data: {
      refundAmount: newRefundAmount,
      status: status,
    },
  });

  revalidatePath(`/properties/${payout.propertyId}`);
  return updatedPayout;
}

export async function revertRefund(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const payout = await prisma.payout.update({
    where: {
      id,
      property: { userId: session.user.id },
    },
    data: {
      refundAmount: 0,
      status: "PAID",
    },
  });

  revalidatePath(`/properties/${payout.propertyId}`);
  return payout;
}

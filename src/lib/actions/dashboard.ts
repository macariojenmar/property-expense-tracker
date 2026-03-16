"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { differenceInDays } from "date-fns";

export async function getDashboardStats(params: {
  propertyId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { propertyId, startDate, endDate } = params;

  // Define date filters
  const dateFilter = startDate && endDate ? {
    date: {
      gte: startDate,
      lte: endDate,
    }
  } : {};

  // Find previous period for trend calculation
  let prevStartDate: Date | undefined;
  let prevEndDate: Date | undefined;

  if (startDate && endDate) {
    const daysDiff = differenceInDays(endDate, startDate) + 1;
    prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - daysDiff);
    prevEndDate = new Date(endDate);
    prevEndDate.setDate(prevEndDate.getDate() - daysDiff);
  }

  const prevDateFilter = prevStartDate && prevEndDate ? {
    date: {
      gte: prevStartDate,
      lte: prevEndDate,
    }
  } : {};

  // Define property filter
  const propertyFilter = {
    userId: session.user.id,
    ...(propertyId ? { id: propertyId } : {}),
  };

  // Fetch current period data
  const [expenses, payouts] = await Promise.all([
    prisma.expense.findMany({
      where: {
        property: propertyFilter,
        ...dateFilter,
        status: { not: "DELETED" as any },
      },
      select: { amount: true },
    }),
    prisma.payout.findMany({
      where: {
        property: propertyFilter,
        ...dateFilter,
        status: { not: "DELETED" as any },
      },
      select: { amount: true, refundAmount: true },
    }),
  ]);

  // Fetch previous period data
  const [prevExpenses, prevPayouts] = await Promise.all([
    prisma.expense.findMany({
      where: {
        property: propertyFilter,
        ...prevDateFilter,
        status: { not: "DELETED" as any },
      },
      select: { amount: true },
    }),
    prisma.payout.findMany({
      where: {
        property: propertyFilter,
        ...prevDateFilter,
        status: { not: "DELETED" as any },
      },
      select: { amount: true, refundAmount: true },
    }),
  ]);

  const calculateTotals = (exps: { amount: number }[], pays: { amount: number; refundAmount: number | null }[]) => {
    const totalExpenses = exps.reduce((sum, e) => sum + e.amount, 0);
    const totalRevenue = pays.reduce((sum, p) => sum + (p.amount - (p.refundAmount || 0)), 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return { totalExpenses, totalRevenue, netProfit, profitMargin };
  };

  const current = calculateTotals(expenses, payouts);
  const previous = calculateTotals(prevExpenses, prevPayouts);

  const calculateTrend = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? "+100%" : "0%";
    const trend = ((curr - prev) / Math.abs(prev)) * 100;
    return `${trend > 0 ? "+" : ""}${trend.toFixed(1)}%`;
  };

  return {
    totalRevenue: {
      value: current.totalRevenue,
      trend: calculateTrend(current.totalRevenue, previous.totalRevenue),
    },
    totalExpenses: {
      value: current.totalExpenses,
      trend: calculateTrend(current.totalExpenses, previous.totalExpenses),
    },
    netProfit: {
      value: current.netProfit,
      trend: calculateTrend(current.netProfit, previous.netProfit),
    },
    profitMargin: {
      value: `${current.profitMargin.toFixed(1)}%`,
      trend: calculateTrend(current.profitMargin, previous.profitMargin),
    },
  };
}

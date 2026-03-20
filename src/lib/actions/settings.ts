"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPlatformSettings as getSettings } from "@/lib/limits";

const checkDeveloperAccess = async () => {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "DEVELOPER") {
    throw new Error("Unauthorized access");
  }
};

export async function getPlatformSettings() {
  await checkDeveloperAccess();
  return getSettings();
}

export async function updatePlatformSettings(data: any) {
  await checkDeveloperAccess();
  
  const settings = await (prisma as any).platformSetting.update({
    where: { id: "default" },
    data: {
      trialPeriodDays: Number(data.trialPeriodDays),
      trialMaxProperties: Number(data.trialMaxProperties),
      trialMaxEntities: Number(data.trialMaxEntities),
      trialMaxDictionaries: Number(data.trialMaxDictionaries),
      trialMaxExpenses: Number(data.trialMaxExpenses),
      trialMaxPayouts: Number(data.trialMaxPayouts),
      
      standardMaxProperties: Number(data.standardMaxProperties),
      standardMaxEntities: Number(data.standardMaxEntities),
      standardMaxDictionaries: Number(data.standardMaxDictionaries),
      standardMaxExpenses: Number(data.standardMaxExpenses),
      standardMaxPayouts: Number(data.standardMaxPayouts),
      
      proMaxProperties: Number(data.proMaxProperties),
      proMaxEntities: Number(data.proMaxEntities),
      proMaxDictionaries: Number(data.proMaxDictionaries),
      proMaxExpenses: Number(data.proMaxExpenses),
      proMaxPayouts: Number(data.proMaxPayouts),
    },
  });

  revalidatePath("/platform/settings");
  return settings;
}

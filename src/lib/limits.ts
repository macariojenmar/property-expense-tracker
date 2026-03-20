import prisma from "./prisma";

export type LimitType = "property" | "entity" | "dictionary" | "expense" | "payout";

export async function getPlatformSettings() {
  let settings = await (prisma as any).platformSetting.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    settings = await (prisma as any).platformSetting.create({
      data: { id: "default" },
    });
  }

  return settings as any;
}

export async function checkUserLimit(userId: string, type: LimitType) {
  const [user, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { accountType: true, expiredAt: true } as any,
    }) as Promise<any>,
    getPlatformSettings(),
  ]);

  if (!user) throw new Error("User not found");

  const accountType = user.accountType;
  const expiredAt = user.expiredAt;
  const isExpired = expiredAt && new Date() > new Date(expiredAt);

  if (isExpired) {
    return {
      reached: true,
      expired: true,
      limit: -1,
      current: 0,
      type,
    };
  }

  let limit = -1;
  let current = 0;

  switch (type) {
    case "property":
      current = await prisma.property.count({ where: { userId } });
      limit = accountType === "TRIAL" ? settings.trialMaxProperties : 
              accountType === "STANDARD" ? settings.standardMaxProperties : 
              settings.proMaxProperties;
      break;
    case "entity":
      current = await prisma.pendingTo.count({ where: { userId } });
      limit = accountType === "TRIAL" ? settings.trialMaxEntities : 
              accountType === "STANDARD" ? settings.standardMaxEntities : 
              settings.proMaxEntities;
      break;
    case "dictionary":
      current = await prisma.dictionaryWord.count({ where: { userId } });
      limit = accountType === "TRIAL" ? settings.trialMaxDictionaries : 
              accountType === "STANDARD" ? settings.standardMaxDictionaries : 
              settings.proMaxDictionaries;
      break;
    case "expense":
      // For expenses, we might want to count across all properties or just the active one?
      // Usually it's account-wide limits.
      current = await prisma.expense.count({ 
        where: { property: { userId } } 
      });
      limit = accountType === "TRIAL" ? settings.trialMaxExpenses : 
              accountType === "STANDARD" ? settings.standardMaxExpenses : 
              settings.proMaxExpenses;
      break;
    case "payout":
      current = await prisma.payout.count({ 
        where: { property: { userId } } 
      });
      limit = accountType === "TRIAL" ? settings.trialMaxPayouts : 
              accountType === "STANDARD" ? settings.standardMaxPayouts : 
              settings.proMaxPayouts;
      break;
  }

  return {
    reached: limit !== -1 && current >= limit,
    limit,
    current,
    type,
  };
}

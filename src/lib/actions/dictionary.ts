"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const DEFAULT_WORDS = [
  "Internet",
  "Rent",
  "Transportation",
  "Water Bill",
  "Electricity Bill",
  "Maintenance",
  "Property Payout",
];

export async function getDictionaryWords() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  let words = await prisma.dictionaryWord.findMany({
    where: { userId: session.user.id },
    orderBy: { word: "asc" },
  });

  // If no words exist for the user, seed with defaults
  if (words.length === 0) {
    await prisma.dictionaryWord.createMany({
      data: DEFAULT_WORDS.map((word) => ({
        word,
        userId: session.user.id!,
      })),
      skipDuplicates: true,
    });

    words = await prisma.dictionaryWord.findMany({
      where: { userId: session.user.id },
      orderBy: { word: "asc" },
    });
  }

  return words;
}

export async function addDictionaryWord(word: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const trimmedWord = word.trim();
  if (!trimmedWord) {
    throw new Error("Word cannot be empty");
  }

  const newWord = await prisma.dictionaryWord.upsert({
    where: {
      word_userId: {
        word: trimmedWord,
        userId: session.user.id,
      },
    },
    update: {}, // Do nothing if it exists
    create: {
      word: trimmedWord,
      userId: session.user.id,
    },
  });

  revalidatePath("/dictionary");
  return newWord;
}

export async function deleteDictionaryWord(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.dictionaryWord.delete({
    where: { 
      id,
      userId: session.user.id // Ensure user owns the word
    },
  });

  revalidatePath("/dictionary");
}

"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getPendingToEntities() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await prisma.pendingTo.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: { name: "asc" },
  });
}

export async function getPendingToEntity(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await prisma.pendingTo.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });
}

export async function createPendingToEntity(data: {
  name: string;
  type?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const entity = await prisma.pendingTo.create({
    data: {
      name: data.name,
      type: data.type,
      userId: session.user.id,
    },
  });

  revalidatePath("/entities");
  return entity;
}

export async function updatePendingToEntity(
  id: string,
  data: {
    name?: string;
    type?: string;
  }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const entity = await prisma.pendingTo.update({
    where: {
      id,
      userId: session.user.id,
    },
    data,
  });

  revalidatePath("/entities");
  return entity;
}

export async function deletePendingToEntity(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const entity = await prisma.pendingTo.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });

  revalidatePath("/entities");
  return entity;
}

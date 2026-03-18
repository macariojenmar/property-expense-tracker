import { Session } from "next-auth";

export type Role = "USER" | "DEVELOPER";

export const isDeveloper = (session: Session | null) => {
  return session?.user?.role === "DEVELOPER";
};

export const canAccessPlatform = (session: Session | null) => {
  return isDeveloper(session);
};

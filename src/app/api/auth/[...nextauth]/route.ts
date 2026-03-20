import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      status: string;
      accountType: string;
      expiredAt: Date | null;
      image?: string | null;
      provider?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    status: string;
    accountType: string;
    expiredAt: Date | null;
    image?: string | null;
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    status?: string;
    accountType?: string;
    expiredAt?: string | null;
    picture?: string | null;
    image?: string | null;
    provider?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid credentials");
        }

        if (user.status !== "ACTIVE") {
          throw new Error("Your account is currently disabled.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          accountType: user.accountType,
          expiredAt: (user as any).expiredAt,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          const settings = await prisma.platformSetting.findUnique({
            where: { id: "default" },
          });
          const trialDays = settings?.trialPeriodDays || 7;
          const expiredAt = new Date();
          expiredAt.setDate(expiredAt.getDate() + trialDays);

          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              status: "ACTIVE",
              accountType: "TRIAL",
              expiredAt,
              emailVerified: new Date(),
            },
          });
        }

        if (dbUser.status !== "ACTIVE") {
          return "/login?error=account_disabled";
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
        session.user.accountType = token.accountType as string;
        session.user.expiredAt = token.expiredAt
          ? new Date(token.expiredAt)
          : null;
        session.user.image = (token.picture || token.image) as string | null;
        session.user.provider = token.provider as string | undefined;
      }
      return session;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (account) {
        token.provider = account.provider;
      }
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.status = user.status;
        token.accountType = user.accountType;
        token.expiredAt = user.expiredAt ? user.expiredAt.toISOString() : null;
        token.picture = user.image || token.picture;
        token.image = user.image;
      }

      if (trigger === "update" && session) {
        if (session.user) {
          token.name = session.user.name;
          token.email = session.user.email;
        }
      }

      return token;
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

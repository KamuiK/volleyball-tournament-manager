import NextAuth, { type DefaultSession, type NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import { isOrganizerGithubLogin } from "@/src/auth/organizer-logins";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      githubLogin?: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    githubLogin?: string;
  }
}

export const authConfig: NextAuthConfig = {
  providers: [GitHub],
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  logger: {
    error() {
      console.error("Authentication request failed.");
    },
    warn() {
      console.warn("Authentication configuration warning.");
    },
    debug() {},
  },
  callbacks: {
    signIn({ profile }) {
      const githubLogin = typeof profile?.login === "string" ? profile.login : undefined;
      return isOrganizerGithubLogin(githubLogin, process.env.ORGANIZER_GITHUB_LOGINS);
    },
    jwt({ token, profile }) {
      if (typeof profile?.login === "string") {
        token.githubLogin = profile.login;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.githubLogin === "string") {
        session.user.githubLogin = token.githubLogin;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

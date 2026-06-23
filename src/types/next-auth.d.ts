import type { DefaultSession } from "next-auth";

// Augment NextAuth's Session so `session.user.id` is typed throughout the app.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { randomUUID } from "crypto";
import { D1Database } from "@cloudflare/workers-types";

// Ensure DB is globally available
declare global {
  var DB: D1Database | undefined;
}

// Ensure DB is defined in Cloudflare Workers
function getDB(): D1Database {
  if (typeof globalThis.DB === "undefined") {
    throw new Error("Cloudflare D1 database binding (DB) is missing. Ensure your environment exposes DB.");
  }
  return globalThis.DB;
}

const authHandler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return true;

      try {
        console.log(`Checking user: ${user.email}`);
        const now = new Date().toISOString();

        const DB = getDB();

        // Check if user exists
        const existingUser = await DB.prepare(
          "SELECT id FROM users WHERE email = ?"
        )
          .bind(user.email)
          .first();

        if (!existingUser) {
          const newUserId = randomUUID();

          console.log(`Creating new user: ${user.email}, ID: ${newUserId}`);

          await DB.prepare(
            `INSERT INTO users (
              id, email, name, image, login_count, last_login_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 1, ?, ?, ?)`
          )
            .bind(
              newUserId,
              user.email,
              user.name,
              user.image,
              now,
              now,
              now
            )
            .run();
        } else {
          console.log(`Updating existing user: ${user.email}`);

          await DB.prepare(
            `UPDATE users SET 
              name = ?, 
              image = ?, 
              login_count = login_count + 1,
              last_login_at = ?, 
              updated_at = ?
            WHERE email = ?`
          )
            .bind(user.name, user.image, now, now, user.email)
            .run();
        }
      } catch (error) {
        console.error("Database error in signIn:", error);
        return true;
      }

      return true;
    },

    async session({ session }) {
      if (!session.user?.email) return session;

      try {
        console.log(`Fetching session data for: ${session.user.email}`);
        const DB = getDB();

        const dbUser = await DB.prepare(
          `SELECT id, email, name, image, login_count, last_login_at FROM users WHERE email = ?`
        )
          .bind(session.user.email)
          .first();

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.loginCount = dbUser.login_count;
          session.user.lastLoginAt = dbUser.last_login_at;
        }
      } catch (error) {
        console.error("Error fetching user data in session:", error);
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET!,
});

// Re-export as GET/POST for Next.js 13
export { authHandler as GET, authHandler as POST };
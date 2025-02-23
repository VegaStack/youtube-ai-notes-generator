// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { D1Database } from '@cloudflare/workers-types';

declare global {
  var DB: D1Database;
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (user.email) {
        try {
          // Check if user exists
          const existingUser = await DB
            .prepare('SELECT * FROM users WHERE email = ?')
            .bind(user.email)
            .first();

          const now = new Date().toISOString();

          if (!existingUser) {
            // Create new user
            await DB
              .prepare(`
                INSERT INTO users (
                  email, 
                  name, 
                  image, 
                  login_count, 
                  last_login_at, 
                  created_at,
                  updated_at
                ) 
                VALUES (?, ?, ?, 1, ?, ?, ?)
              `)
              .bind(
                user.email,
                user.name,
                user.image,
                now,
                now,
                now
              )
              .run();
          } else {
            // Update existing user and increment login count
            await DB
              .prepare(`
                UPDATE users 
                SET 
                  name = ?, 
                  image = ?, 
                  login_count = login_count + 1,
                  last_login_at = ?,
                  updated_at = ?
                WHERE email = ?
              `)
              .bind(
                user.name,
                user.image,
                now,
                now,
                user.email
              )
              .run();
          }
        } catch (error) {
          console.error('Database error:', error);
          // Still allow sign in even if DB update fails
          return true;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const dbUser = await DB
            .prepare(`
              SELECT 
                id,
                name,
                email,
                image,
                login_count,
                last_login_at,
                created_at
              FROM users 
              WHERE email = ?
            `)
            .bind(session.user.email)
            .first();
          
          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.loginCount = dbUser.login_count;
            session.user.lastLoginAt = dbUser.last_login_at;
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
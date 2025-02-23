import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { D1Database } from '@cloudflare/workers-types';

declare global {
  var DB: D1Database;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (user.email) {
        try {
          const now = new Date().toISOString();
          
          // Check if user exists
          const existingUser = await DB
            .prepare('SELECT * FROM users WHERE email = ?')
            .bind(user.email)
            .first();

          if (!existingUser) {
            // Create new user
            await DB
              .prepare(`
                INSERT INTO users (
                  email, 
                  name, 
                  image, 
                  login_count, 
                  last_login_at
                ) 
                VALUES (?, ?, ?, 1, ?)
              `)
              .bind(
                user.email,
                user.name,
                user.image,
                now
              )
              .run();
          } else {
            // Update existing user
            await DB
              .prepare(`
                UPDATE users 
                SET 
                  name = ?, 
                  image = ?, 
                  login_count = login_count + 1,
                  last_login_at = ?
                WHERE email = ?
              `)
              .bind(
                user.name,
                user.image,
                now,
                user.email
              )
              .run();
          }
        } catch (error) {
          console.error('Database error:', error);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const dbUser = await DB
            .prepare('SELECT * FROM users WHERE email = ?')
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
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
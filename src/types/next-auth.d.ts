import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      loginCount: number;
      lastLoginAt: string;
    } & DefaultSession['user']
  }

  interface User {
    id: string;
    loginCount: number;
    last_login_at: string;
  }
}
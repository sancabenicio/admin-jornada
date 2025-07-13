import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    avatar?: string;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar?: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    avatar?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar
          };
        } catch (error) {
          console.error('Erro na autenticação:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.avatar = token.avatar as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/admin',
    error: '/admin'
  },
  secret: process.env.NEXTAUTH_SECRET
}; 
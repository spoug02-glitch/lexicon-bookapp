import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge 런타임(middleware.ts)에서도 쓸 수 있도록 Prisma 어댑터를 뺀 최소 설정만 분리.
// 전체 설정(어댑터 포함)은 lib/auth.ts에 있음.
export const authConfig = {
  providers: [Google],
  session: { strategy: "jwt" },
  // NextAuth 기본 로그인 페이지가 영어라서 한글 커스텀 페이지로 대체.
  pages: { signIn: "/signin" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

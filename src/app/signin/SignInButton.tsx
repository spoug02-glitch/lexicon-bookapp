"use client";

import { signIn } from "next-auth/react";

export function SignInButton({ callbackUrl }: { callbackUrl: string }) {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl })}
      className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-medium py-3 rounded-full hover:bg-primary/90 active:scale-[0.98] transition-all"
    >
      <span className="material-symbols-outlined text-[20px]">login</span>
      Google로 로그인
    </button>
  );
}

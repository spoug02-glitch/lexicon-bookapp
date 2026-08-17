import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountSection } from "./AccountSection";
import { NicknameSection } from "./NicknameSection";
import { NotionSyncSection } from "./NotionSyncSection";

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;

  return (
    <>
      <Header title="설정" />
      <main className="flex flex-col relative w-full pt-16 pb-24 px-margin-mobile bg-background min-h-screen items-center justify-center gap-stack-md">
        {session?.user && user ? (
          <>
            <NicknameSection
              displayName={user.displayName ?? user.name ?? ""}
              googleName={user.name}
            />
            <NotionSyncSection />
            <AccountSection name={session.user.name ?? null} email={session.user.email ?? null} />
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="material-symbols-outlined text-display text-primary-fixed-dim">
              person_off
            </span>
            <p className="text-body-md text-on-surface-variant">
              계정 설정을 보려면 로그인이 필요합니다.
            </p>
            <Link href="/signin" className="text-primary font-medium hover:underline">
              로그인하기
            </Link>
          </div>
        )}
      </main>
    </>
  );
}

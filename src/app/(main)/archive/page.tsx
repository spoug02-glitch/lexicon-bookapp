import { Header } from "@/components/layout/Header";

export default function ArchivePage() {
  return (
    <>
      <Header title="아카이브" />
      <main className="flex flex-col relative w-full pt-header-safe pb-24 px-margin-mobile bg-background min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="material-symbols-outlined text-display text-primary-fixed-dim">
            construction
          </span>
          <p className="text-body-md text-on-surface-variant">
            아카이브 기능은 준비 중입니다.
          </p>
        </div>
      </main>
    </>
  );
}

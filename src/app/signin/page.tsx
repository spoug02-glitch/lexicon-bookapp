import { LogoMark } from "@/components/brand/Logo";
import { SignInButton } from "./SignInButton";

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-margin-mobile">
      <div className="flex flex-col items-center gap-stack-lg bg-surface-container-lowest p-8 rounded-xl shadow-sm max-w-sm w-full text-center">
        <LogoMark size={40} />
        <h1 className="font-headline-md text-headline-md text-on-surface">책결 로그인</h1>
        <p className="text-body-md text-on-surface-variant">
          리뷰 작성과 마이페이지를 이용하려면 로그인이 필요합니다. 검색과 책 상세, 공유된 리뷰는
          로그인 없이 바로 볼 수 있어요.
        </p>
        <SignInButton callbackUrl={callbackUrl ?? "/"} />
      </div>
    </main>
  );
}

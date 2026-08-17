import Link from "next/link";
import { auth } from "@/lib/auth";

interface HeaderProps {
  title: string;
  variant?: "default" | "back";
  backHref?: string;
}

export async function Header({ title, variant = "default", backHref = "/" }: HeaderProps) {
  const session = variant === "default" ? await auth() : null;

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="h-16 px-margin-mobile flex items-center justify-between">
        <div className="flex items-center gap-stack-md">
          {variant === "back" ? (
            <Link
              href={backHref}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/20 text-on-surface"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
          ) : (
            <span className="material-symbols-outlined text-primary text-[28px]">menu_book</span>
          )}
          <h1 className="font-title-lg text-title-lg text-primary">{title}</h1>
        </div>
        {variant === "default" &&
          (session?.user ? (
            <Link href="/history" aria-label="마이페이지">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt="프로필"
                  className="w-8 h-8 rounded-full object-cover border border-outline-variant"
                />
              ) : (
                <span className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </span>
              )}
            </Link>
          ) : (
            <Link
              href="/signin"
              className="text-body-md font-medium text-primary hover:underline"
            >
              로그인
            </Link>
          ))}
      </div>
    </header>
  );
}

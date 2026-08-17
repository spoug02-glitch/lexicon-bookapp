"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", icon: "search", label: "검색", isAction: false },
  { href: "/archive", icon: "book_2", label: "아카이브", isAction: false },
  { href: "/reviews/new", icon: "add", label: "작성", isAction: true },
  { href: "/history", icon: "history", label: "기록", isAction: false },
  { href: "/settings", icon: "settings", label: "설정", isAction: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-surface/80 backdrop-blur-xl pb-safe shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 flex items-center justify-around px-unit">
        {NAV_ITEMS.map((item) => {
          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined">{item.icon}</span>
              </Link>
            );
          }

          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
                active ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  defaultValue?: string;
}

export function SearchBar({ defaultValue = "" }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/?q=${encodeURIComponent(q)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full h-12 bg-surface-container rounded-full flex items-center px-4 gap-3 focus-within:ring-2 focus-within:ring-primary focus-within:bg-surface transition-all shadow-sm"
    >
      <span className="material-symbols-outlined text-on-surface-variant">search</span>
      <input
        className="flex-1 bg-transparent border-none outline-none text-body-lg text-on-surface placeholder:text-on-surface-variant/70"
        placeholder="[예시 검색어]"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        type="text"
      />
      <button
        type="submit"
        aria-label="검색"
        className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">search</span>
      </button>
    </form>
  );
}

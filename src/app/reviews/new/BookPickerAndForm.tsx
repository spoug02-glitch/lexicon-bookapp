"use client";

import { useState, type FormEvent } from "react";
import { ReviewForm, type ReviewFormValues } from "@/components/review/ReviewForm";
import { BookCover } from "@/components/book/BookCover";
import { createReview } from "@/app/actions/reviews";
import { useRouter } from "next/navigation";

interface SearchItem {
  isbn13: string;
  title: string;
  author: string | null;
  cover: string | null;
}

interface BookPickerAndFormProps {
  presets: string[];
}

export function BookPickerAndForm({ presets }: BookPickerAndFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchItem | null>(null);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setResults(json.items ?? []);
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit(values: ReviewFormValues) {
    await createReview(values);
    router.push(`/books/${values.bookIsbn13}`);
  }

  if (selected) {
    return (
      <ReviewForm
        book={{
          isbn13: selected.isbn13,
          title: selected.title,
          author: selected.author,
          coverUrl: selected.cover,
        }}
        presets={presets}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <div className="flex flex-col gap-stack-lg w-full">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          className="flex-1 bg-surface-container rounded-full px-4 py-3 text-body-lg text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="리뷰를 남길 책을 검색하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="px-5 rounded-full bg-primary text-on-primary font-medium"
        >
          검색
        </button>
      </form>

      {searching && <p className="text-body-md text-on-surface-variant">검색 중...</p>}

      <div className="flex flex-col gap-stack-sm">
        {results.map((item) => (
          <button
            key={item.isbn13}
            type="button"
            onClick={() => setSelected(item)}
            className="flex items-center gap-4 bg-surface-container-lowest p-3 rounded-xl shadow-sm text-left hover:shadow-md transition-shadow"
          >
            <BookCover src={item.cover} alt={item.title} size="sm" />
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-title-lg text-title-lg text-on-surface truncate">
                {item.title}
              </span>
              {item.author && (
                <span className="text-body-md text-on-surface-variant truncate">
                  {item.author}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: number;
}

export function StarRating({ value, onChange, readOnly = false, size = 20 }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div className="flex gap-0.5 items-center" aria-label="별점">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          className={`p-0.5 transition-transform ${
            readOnly ? "cursor-default" : "hover:scale-110"
          } ${n <= display ? "text-primary" : "text-outline-variant"}`}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(null)}
          onClick={() => !readOnly && onChange?.(n)}
          aria-label={`${n}점`}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: size, fontVariationSettings: `'FILL' ${n <= display ? 1 : 0}` }}
          >
            star
          </span>
        </button>
      ))}
    </div>
  );
}

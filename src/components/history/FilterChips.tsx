"use client";

const FILTERS = [
  { value: "ALL", label: "전체" },
  { value: "PAPER", label: "종이책" },
  { value: "EBOOK", label: "전자책" },
  { value: "AUDIOBOOK", label: "오디오북" },
] as const;

export type FilterValue = (typeof FILTERS)[number]["value"];

interface FilterChipsProps {
  active: FilterValue;
  onChange: (value: FilterValue) => void;
}

export function FilterChips({ active, onChange }: FilterChipsProps) {
  return (
    <div className="flex gap-stack-sm overflow-x-auto pb-unit px-unit snap-x -mx-unit">
      <div className="w-1 shrink-0" />
      {FILTERS.map((f) => (
        <button
          key={f.value}
          type="button"
          onClick={() => onChange(f.value)}
          aria-pressed={active === f.value}
          className={`snap-start shrink-0 px-4 py-2 rounded-full font-label-md text-label-md transition-colors ${
            active === f.value
              ? "bg-primary text-on-primary shadow-md"
              : "bg-surface-container-high text-on-surface hover:bg-surface-variant"
          }`}
        >
          {f.label}
        </button>
      ))}
      <div className="w-1 shrink-0" />
    </div>
  );
}

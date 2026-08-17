"use client";

const OPTIONS: { value: "PUBLIC" | "PRIVATE"; label: string }[] = [
  { value: "PUBLIC", label: "공개" },
  { value: "PRIVATE", label: "비공개" },
];

interface VisibilityToggleProps {
  value: "PUBLIC" | "PRIVATE";
  onChange: (value: "PUBLIC" | "PRIVATE") => void;
}

export function VisibilityToggle({ value, onChange }: VisibilityToggleProps) {
  return (
    <div className="flex flex-col gap-stack-sm w-full">
      <label className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
        공개 범위
      </label>
      <div className="flex gap-2">
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={`px-4 py-2 rounded-full text-body-md transition-colors border border-transparent ${
                selected
                  ? "bg-primary-container text-on-primary-container font-bold"
                  : "bg-surface-container text-on-surface hover:border-primary/20 hover:bg-surface-container-high"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

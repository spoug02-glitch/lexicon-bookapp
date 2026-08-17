"use client";

import { useState, type KeyboardEvent } from "react";

const MAX_TAGS = 10;

function normalizeLabel(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

interface TagSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  presets: string[];
}

export function TagSelector({ value, onChange, presets }: TagSelectorProps) {
  const [draft, setDraft] = useState("");
  const atCap = value.length >= MAX_TAGS;

  function togglePreset(label: string) {
    const normalized = normalizeLabel(label);
    if (!normalized) return;
    if (value.includes(normalized)) {
      onChange(value.filter((tag) => tag !== normalized));
      return;
    }
    if (atCap) return;
    onChange([...value, normalized]);
  }

  function addDraft() {
    const normalized = normalizeLabel(draft);
    if (!normalized) return;
    if (value.includes(normalized)) {
      setDraft("");
      return;
    }
    if (atCap) return;
    onChange([...value, normalized]);
    setDraft("");
  }

  function removeTag(label: string) {
    onChange(value.filter((tag) => tag !== label));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addDraft();
    }
  }

  return (
    <div className="flex flex-col gap-stack-sm w-full">
      <label className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
        태그
      </label>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const normalized = normalizeLabel(preset);
          const selected = value.includes(normalized);
          return (
            <button
              key={preset}
              type="button"
              aria-pressed={selected}
              onClick={() => togglePreset(preset)}
              disabled={!selected && atCap}
              className={`px-4 py-2 rounded-full text-body-md transition-colors border border-transparent disabled:opacity-50 disabled:pointer-events-none ${
                selected
                  ? "bg-primary-container text-on-primary-container font-bold"
                  : "bg-surface-container text-on-surface hover:border-primary/20 hover:bg-surface-container-high"
              }`}
            >
              {normalized}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 bg-[#F1F5F9] text-on-surface px-4 py-3 rounded-xl text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface transition-all border border-transparent"
          placeholder="새 태그 입력 후 Enter"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={atCap}
        />
        <button
          type="button"
          onClick={addDraft}
          disabled={atCap || draft.trim().length === 0}
          className="px-5 rounded-xl bg-primary text-on-primary font-medium disabled:opacity-50 disabled:pointer-events-none"
        >
          추가
        </button>
      </div>

      {atCap && (
        <p className="text-label-md text-on-surface-variant">
          태그는 최대 {MAX_TAGS}개까지 선택할 수 있습니다.
        </p>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-surface-container-high text-on-surface-variant text-label-md px-2 py-0.5 rounded-full"
            >
              {tag}
              <button
                type="button"
                aria-label={`${tag} 태그 제거`}
                onClick={() => removeTag(tag)}
                className="material-symbols-outlined text-[14px] leading-none"
              >
                close
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

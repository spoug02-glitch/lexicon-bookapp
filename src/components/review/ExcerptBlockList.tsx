"use client";

import { type ClipboardEvent } from "react";

export interface ExcerptBlockValue {
  id: string;
  quote: string;
  pageLabel: string | null;
  comment: string | null;
}

interface ExcerptBlockListProps {
  value: ExcerptBlockValue[];
  onChange: (value: ExcerptBlockValue[]) => void;
}

const MAX_EXCERPTS = 20;

function createEmptyBlock(): ExcerptBlockValue {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `tmp-${Date.now()}-${Math.random()}`,
    quote: "",
    pageLabel: null,
    comment: null,
  };
}

export function ExcerptBlockList({ value, onChange }: ExcerptBlockListProps) {
  const atCap = value.length >= MAX_EXCERPTS;

  function addBlock() {
    if (atCap) return;
    onChange([...value, createEmptyBlock()]);
  }

  function updateBlock(id: string, patch: Partial<ExcerptBlockValue>) {
    onChange(value.map((block) => (block.id === id ? { ...block, ...patch } : block)));
  }

  function removeBlock(id: string) {
    onChange(value.filter((block) => block.id !== id));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function handlePaste(id: string, e: ClipboardEvent<HTMLTextAreaElement>) {
    const text = e.clipboardData.getData("text");
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (paragraphs.length <= 1) return; // 일반 붙여넣기는 그대로 둠

    e.preventDefault();
    const index = value.findIndex((block) => block.id === id);
    if (index === -1) return;

    const [first, ...rest] = paragraphs;
    const updatedFirst = { ...value[index], quote: first };
    const newBlocks = rest.map((quote) => ({ ...createEmptyBlock(), quote }));
    onChange([...value.slice(0, index), updatedFirst, ...newBlocks, ...value.slice(index + 1)]);
  }

  if (value.length === 0) {
    return (
      <div className="flex flex-col gap-stack-sm w-full">
        <label className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
          문장 발췌
        </label>
        <button
          type="button"
          onClick={addBlock}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-outline-variant/50 text-on-surface-variant hover:border-primary/40 hover:text-primary transition-colors self-start"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          발췌 추가하기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-stack-sm w-full">
      <label className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
        문장 발췌
      </label>

      <div className="flex flex-col gap-stack-sm">
        {value.map((block, index) => (
          <div
            key={block.id}
            className="flex flex-col gap-2 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-label-md text-on-surface-variant">발췌 {index + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="위로 이동"
                  onClick={() => moveBlock(index, -1)}
                  disabled={index === 0}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                </button>
                <button
                  type="button"
                  aria-label="아래로 이동"
                  onClick={() => moveBlock(index, 1)}
                  disabled={index === value.length - 1}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                </button>
                <button
                  type="button"
                  aria-label="발췌 삭제"
                  onClick={() => removeBlock(block.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-error-container hover:text-on-error-container"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            </div>

            <textarea
              className="w-full bg-[#F1F5F9] text-on-surface p-3 rounded-lg text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface transition-all resize-none placeholder:text-on-surface-variant/50"
              placeholder="인용할 문장을 입력하세요"
              rows={2}
              value={block.quote}
              onChange={(e) => updateBlock(block.id, { quote: e.target.value })}
              onPaste={(e) => handlePaste(block.id, e)}
            />

            <input
              type="text"
              className="w-full bg-[#F1F5F9] text-on-surface px-3 py-2 rounded-lg text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface transition-all placeholder:text-on-surface-variant/50"
              placeholder="페이지/위치 (예: p.12, 35%, 3장)"
              maxLength={30}
              value={block.pageLabel ?? ""}
              onChange={(e) =>
                updateBlock(block.id, { pageLabel: e.target.value.length > 0 ? e.target.value : null })
              }
            />

            {block.comment === null ? (
              <button
                type="button"
                onClick={() => updateBlock(block.id, { comment: "" })}
                className="text-label-md text-primary hover:underline self-start"
              >
                한줄코멘트 추가
              </button>
            ) : (
              <input
                type="text"
                className="w-full bg-[#F1F5F9] text-on-surface px-3 py-2 rounded-lg text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface transition-all placeholder:text-on-surface-variant/50"
                placeholder="이 문장에 대한 짧은 코멘트"
                maxLength={200}
                value={block.comment}
                onChange={(e) => updateBlock(block.id, { comment: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addBlock}
        disabled={atCap}
        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-outline-variant/50 text-on-surface-variant hover:border-primary/40 hover:text-primary transition-colors self-start disabled:opacity-50 disabled:pointer-events-none"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        발췌 추가
      </button>

      {atCap && (
        <p className="text-label-md text-on-surface-variant">
          발췌는 최대 {MAX_EXCERPTS}개까지 추가할 수 있습니다.
        </p>
      )}
    </div>
  );
}

"use client";

import type { ReadingChannel } from "@prisma/client";

const CHANNELS: { value: ReadingChannel; label: string }[] = [
  { value: "PAPER", label: "종이책" },
  { value: "EBOOK", label: "전자책" },
  { value: "AUDIOBOOK", label: "오디오북" },
];

interface ChannelSelectorProps {
  value: ReadingChannel | null;
  onChange: (value: ReadingChannel | null) => void;
}

export function ChannelSelector({ value, onChange }: ChannelSelectorProps) {
  return (
    <div className="flex flex-col gap-stack-sm w-full">
      <label className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
        읽은 방식
      </label>
      <div className="flex flex-wrap gap-2">
        {CHANNELS.map((channel) => {
          const selected = value === channel.value;
          return (
            <button
              key={channel.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? null : channel.value)}
              className={`px-4 py-2 rounded-full text-body-md transition-colors border border-transparent ${
                selected
                  ? "bg-primary-container text-on-primary-container font-bold"
                  : "bg-surface-container text-on-surface hover:border-primary/20 hover:bg-surface-container-high"
              }`}
            >
              {channel.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

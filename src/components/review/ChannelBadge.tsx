import type { ReadingChannel } from "@prisma/client";

const CHANNEL_LABEL: Record<ReadingChannel, string> = {
  PAPER: "종이책",
  EBOOK: "전자책",
  AUDIOBOOK: "오디오북",
};

const CHANNEL_ICON: Record<ReadingChannel, string> = {
  PAPER: "book",
  EBOOK: "tablet",
  AUDIOBOOK: "headphones",
};

const CHANNEL_STYLE: Record<ReadingChannel, string> = {
  PAPER: "bg-primary-container/20 text-on-surface",
  EBOOK: "bg-secondary-container/40 text-on-secondary-container",
  AUDIOBOOK: "bg-tertiary-container/20 text-tertiary",
};

export function ChannelBadge({ channel }: { channel: ReadingChannel | null }) {
  if (!channel) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-md text-label-md font-medium ${CHANNEL_STYLE[channel]}`}
    >
      <span className="material-symbols-outlined text-[14px]">{CHANNEL_ICON[channel]}</span>
      {CHANNEL_LABEL[channel]}
    </span>
  );
}

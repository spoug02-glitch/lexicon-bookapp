"use client";

import { useState } from "react";

interface ShareButtonProps {
  reviewId: string;
}

export function ShareButton({ reviewId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  function shareUrl(): string {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/share/${reviewId}`;
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleNativeShare() {
    if (typeof navigator === "undefined" || !("share" in navigator)) return;
    try {
      await navigator.share({ url: shareUrl() });
    } catch {
      // 사용자가 공유 시트를 취소한 경우 등은 무시한다.
    }
  }

  const supportsNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1 text-label-md text-on-surface-variant hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
          link
        </span>
        공유
      </button>
      {supportsNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          aria-label="공유 시트 열기"
          className="w-6 h-6 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            ios_share
          </span>
        </button>
      )}
      {copied && <span className="text-label-md text-primary">링크가 복사되었습니다.</span>}
    </div>
  );
}

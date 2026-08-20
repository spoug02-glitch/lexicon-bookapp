"use client";

import { useEffect, useState } from "react";
import { buildExcerptShareText } from "@/lib/share-card/text";
import { SHARE_CARD_THEMES, SHARE_CARD_RATIOS } from "@/lib/share-card/theme";

export interface ExcerptShareData {
  excerptId: string;
  quote: string;
  pageLabel: string | null;
  bookTitle: string;
  author: string | null;
}

interface ExcerptShareSheetProps {
  excerpt: ExcerptShareData;
  onClose: () => void;
}

type Mode = "menu" | "image";

// 발췌 하나를 "이미지로 공유" / "텍스트 복사"할 수 있는 바텀시트.
// 이미지 공유는 사진 편집기가 아니라 카드 스타일 선택기 — 실제 렌더 결과(/api/share-card)를
// 그대로 미리보기로 보여주고, 저장/공유는 그 PNG를 그대로 사용한다.
export function ExcerptShareSheet({ excerpt, onClose }: ExcerptShareSheetProps) {
  const [mode, setMode] = useState<Mode>("menu");
  const [themeId, setThemeId] = useState(SHARE_CARD_THEMES[0].id);
  const [ratioId, setRatioId] = useState(SHARE_CARD_RATIOS[0].id);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [supportsNativeFileShare, setSupportsNativeFileShare] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupportsNativeFileShare(
      typeof navigator !== "undefined" && "share" in navigator && "canShare" in navigator,
    );
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const imageUrl = `/api/share-card/excerpt/${excerpt.excerptId}?theme=${themeId}&ratio=${ratioId}`;

  async function handleCopyText() {
    const text = buildExcerptShareText({
      quote: excerpt.quote,
      bookTitle: excerpt.bookTitle,
      author: excerpt.author,
      pageLabel: excerpt.pageLabel,
    });
    try {
      if (!navigator.clipboard) throw new Error("clipboard API unavailable");
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 2000);
    }
  }

  async function fetchCardBlob(): Promise<File> {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("이미지를 생성하지 못했습니다.");
    const blob = await response.blob();
    return new File([blob], "책결-발췌.png", { type: "image/png" });
  }

  // 다운로드 트리거는 저장/공유 폴백 양쪽에서 쓰므로, 이미 받아온 file을 그대로 넘겨받는다
  // (여기서 다시 fetch하면 satori 렌더가 매번 두 번씩 돈다).
  function downloadFile(file: File) {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // 일부 브라우저(Safari 등)는 클릭 직후 동기적으로 revoke하면 다운로드가 시작되기 전에
    // URL이 무효화된다. 다음 이벤트 루프까지 미룬다.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function isAbortError(error: unknown): boolean {
    return typeof error === "object" && error !== null && (error as { name?: string }).name === "AbortError";
  }

  async function handleSaveImage() {
    setBusy(true);
    setActionError(null);
    try {
      const file = await fetchCardBlob();
      downloadFile(file);
    } catch {
      setActionError("이미지 저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function handleShareImage() {
    setBusy(true);
    setActionError(null);
    try {
      const file = await fetchCardBlob();
      if (supportsNativeFileShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: excerpt.bookTitle });
      } else {
        downloadFile(file);
      }
    } catch (error) {
      if (isAbortError(error)) return; // 사용자가 공유 시트를 취소함
      setActionError("공유에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-on-background/40"
      />
      <div className="relative w-full max-w-container-max bg-surface rounded-t-2xl p-margin-mobile pb-safe flex flex-col gap-stack-md max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 rounded-full bg-outline-variant mx-auto" />

        {mode === "menu" && (
          <div className="flex flex-col gap-stack-sm">
            <h2 className="text-title-lg font-title-lg text-on-surface px-1">발췌 공유</h2>
            <button
              type="button"
              onClick={() => setMode("image")}
              className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors text-left"
            >
              <span className="material-symbols-outlined text-on-surface">image</span>
              <span className="text-body-lg text-on-surface">이미지로 공유</span>
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors text-left"
            >
              <span className="material-symbols-outlined text-on-surface">content_copy</span>
              <span className="text-body-lg text-on-surface">텍스트 복사</span>
            </button>
            {copied && <p className="text-label-md text-primary px-1">복사되었습니다.</p>}
            {copyFailed && <p className="text-label-md text-error px-1">복사에 실패했습니다.</p>}
          </div>
        )}

        {mode === "image" && (
          <div className="flex flex-col gap-stack-md">
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => setMode("menu")}
                aria-label="뒤로"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <h2 className="text-title-lg font-title-lg text-on-surface">이미지로 공유</h2>
              <div className="w-8" />
            </div>

            <div className="rounded-xl overflow-hidden bg-surface-container border border-outline-variant/30 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={imageUrl}
                src={imageUrl}
                alt="발췌 공유 카드 미리보기"
                className="w-full h-auto"
              />
            </div>

            <div className="flex flex-col gap-stack-sm">
              <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold px-1">
                배경
              </span>
              <div className="flex gap-2 px-1">
                {SHARE_CARD_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setThemeId(theme.id)}
                    aria-pressed={themeId === theme.id}
                    className={`px-4 py-2 rounded-full text-body-md transition-colors border ${
                      themeId === theme.id
                        ? "border-primary bg-primary-container text-on-primary-container font-bold"
                        : "border-outline-variant/40 bg-surface-container text-on-surface"
                    }`}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-stack-sm">
              <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold px-1">
                비율
              </span>
              <div className="flex gap-2 px-1">
                {SHARE_CARD_RATIOS.map((ratio) => (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setRatioId(ratio.id)}
                    aria-pressed={ratioId === ratio.id}
                    className={`px-4 py-2 rounded-full text-body-md transition-colors border ${
                      ratioId === ratio.id
                        ? "border-primary bg-primary-container text-on-primary-container font-bold"
                        : "border-outline-variant/40 bg-surface-container text-on-surface"
                    }`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            {actionError && <p className="text-label-md text-error px-1">{actionError}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveImage}
                disabled={busy}
                className="flex-1 py-3 rounded-xl border border-outline-variant/50 text-on-surface font-medium disabled:opacity-50"
              >
                저장하기
              </button>
              <button
                type="button"
                onClick={handleShareImage}
                disabled={busy}
                className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-medium disabled:opacity-50"
              >
                공유하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

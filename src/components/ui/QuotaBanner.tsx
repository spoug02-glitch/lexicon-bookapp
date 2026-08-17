interface QuotaBannerProps {
  provider: "aladin" | "library";
}

const MESSAGES: Record<QuotaBannerProps["provider"], string> = {
  aladin: "알라딘 정보 조회 한도에 도달했습니다. 표시된 정보는 최신이 아닐 수 있어요.",
  library: "도서관 정보 조회 중 일시적인 문제가 있습니다. 표시된 정보는 최신이 아닐 수 있어요.",
};

export function QuotaBanner({ provider }: QuotaBannerProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary-container/30 text-on-secondary-container text-label-md">
      <span className="material-symbols-outlined text-[18px]">info</span>
      <span>{MESSAGES[provider]}</span>
    </div>
  );
}

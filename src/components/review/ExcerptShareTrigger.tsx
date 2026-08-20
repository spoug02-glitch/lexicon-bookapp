"use client";

import { useState } from "react";
import { ExcerptShareSheet, type ExcerptShareData } from "./ExcerptShareSheet";

// ShareReviewCard(순수 프레젠테이션 서버 컴포넌트) 안에서 유일하게 상호작용이 필요한 지점.
// 시트 상태만 이 작은 클라이언트 리프에 격리해, ShareReviewCard 자체는 계속 서버 컴포넌트로 남긴다.
export function ExcerptShareTrigger({ excerpt }: { excerpt: ExcerptShareData }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="이 발췌 공유"
        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors shrink-0"
      >
        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
          ios_share
        </span>
      </button>
      {open && <ExcerptShareSheet excerpt={excerpt} onClose={() => setOpen(false)} />}
    </>
  );
}

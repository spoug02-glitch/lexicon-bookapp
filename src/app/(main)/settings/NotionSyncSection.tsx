"use client";

import { useState, useTransition } from "react";
import { exportReviewsAction, importReviewsAction } from "@/app/actions/notion";

type ResultMessage = { type: "success" | "error"; text: string };

export function NotionSyncSection() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<ResultMessage | null>(null);

  function handleExport() {
    setMessage(null);
    startTransition(async () => {
      try {
        const { created, updated } = await exportReviewsAction();
        setMessage({
          type: "success",
          text: `노션으로 내보내기 완료 — 새로 생성 ${created}건, 갱신 ${updated}건`,
        });
      } catch (err) {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : "내보내기 중 오류가 발생했습니다.",
        });
      }
    });
  }

  function handleImport() {
    setMessage(null);
    startTransition(async () => {
      try {
        const { created, skipped, failed } = await importReviewsAction();
        setMessage({
          type: "success",
          text: `노션에서 불러오기 완료 — 새로 추가 ${created}건, 이미 있음 ${skipped}건, 실패 ${failed}건`,
        });
      } catch (err) {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : "불러오기 중 오류가 발생했습니다.",
        });
      }
    });
  }

  return (
    <div className="flex flex-col gap-stack-sm bg-surface-container-lowest rounded-xl p-stack-md shadow-sm w-full max-w-sm">
      <span className="text-title-lg font-title-lg text-on-surface">노션 연동</span>
      <p className="text-body-md text-on-surface-variant">
        내가 쓴 리뷰를 노션 데이터베이스와 주고받습니다. 최초 1회 설정은 README를 참고하세요.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleExport}
          disabled={pending}
          className="flex-1 bg-primary text-on-primary py-2 rounded-full text-body-md font-medium disabled:opacity-50"
        >
          {pending ? "처리 중..." : "내보내기"}
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={pending}
          className="flex-1 bg-surface-container text-on-surface py-2 rounded-full text-body-md font-medium disabled:opacity-50"
        >
          {pending ? "처리 중..." : "불러오기"}
        </button>
      </div>
      {message && (
        <p
          className={`text-label-md ${message.type === "error" ? "text-error" : "text-on-surface-variant"}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}

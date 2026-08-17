"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateDisplayName } from "@/app/actions/account";

interface NicknameSectionProps {
  displayName: string;
  googleName: string | null;
}

export function NicknameSection({ displayName, googleName }: NicknameSectionProps) {
  const [value, setValue] = useState(displayName);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await updateDisplayName(value);
        setSaved(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장 중 오류가 발생했습니다.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-stack-sm bg-surface-container-lowest rounded-xl p-stack-md shadow-sm w-full max-w-sm">
      <span className="text-title-lg font-title-lg text-on-surface">닉네임</span>
      <p className="text-body-md text-on-surface-variant">
        다른 사람에게는 실제 구글 이름 대신 이 닉네임이 보여요.
      </p>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={30}
        className="w-full bg-surface-container text-on-surface px-4 py-3 rounded-xl text-body-md focus:outline-none focus:ring-1 focus:ring-primary"
        placeholder="닉네임을 입력하세요"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending || value.trim().length === 0}
          className="flex-1 bg-primary text-on-primary py-2 rounded-full text-body-md font-medium disabled:opacity-50"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
        {googleName && (
          <button
            type="button"
            onClick={() => setValue(googleName)}
            disabled={pending}
            className="flex-1 bg-surface-container text-on-surface py-2 rounded-full text-body-md font-medium disabled:opacity-50"
          >
            구글 이름 불러오기
          </button>
        )}
      </div>
      {saved && <p className="text-label-md text-on-surface-variant">저장했습니다.</p>}
      {error && <p className="text-label-md text-error">{error}</p>}
    </div>
  );
}

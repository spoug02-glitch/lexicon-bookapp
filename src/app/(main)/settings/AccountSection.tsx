"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { deleteAccount } from "@/app/actions/account";

interface AccountSectionProps {
  name: string | null;
  email: string | null;
}

export function AccountSection({ name, email }: AccountSectionProps) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteAccount();
        await signOut({ redirect: false });
        router.push("/");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "탈퇴 중 오류가 발생했습니다.");
        setConfirming(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-stack-md bg-surface-container-lowest rounded-xl p-stack-md shadow-sm w-full max-w-sm">
      <div className="flex flex-col gap-1">
        <span className="text-title-lg font-title-lg text-on-surface">{name ?? "게스트"}</span>
        {email && <span className="text-body-md text-on-surface-variant">{email}</span>}
      </div>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-body-md font-medium text-error text-left hover:underline"
        >
          회원 탈퇴
        </button>
      ) : (
        <div className="flex flex-col gap-stack-sm bg-error-container/30 rounded-lg p-stack-sm">
          <p className="text-body-md text-on-error-container">
            탈퇴하면 작성한 리뷰와 좋아요가 모두 삭제되며 되돌릴 수 없습니다. 정말
            탈퇴하시겠습니까?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="flex-1 bg-error text-on-error py-2 rounded-full text-body-md font-medium disabled:opacity-50"
            >
              {pending ? "처리 중..." : "탈퇴하기"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className="flex-1 bg-surface-container text-on-surface py-2 rounded-full text-body-md font-medium disabled:opacity-50"
            >
              취소
            </button>
          </div>
          {error && <p className="text-label-md text-error">{error}</p>}
        </div>
      )}
    </div>
  );
}

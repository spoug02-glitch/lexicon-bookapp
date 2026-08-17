import { auth } from "@/lib/auth";

export class UnauthenticatedError extends Error {
  constructor() {
    super("로그인이 필요한 작업입니다.");
    this.name = "UnauthenticatedError";
  }
}

// Server Action 내부에서 미들웨어와 별개로 세션을 재확인한다(defense in depth).
// 미들웨어를 우회해 액션을 직접 호출하는 경우까지 방어하기 위함.
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthenticatedError();
  }
  return session.user.id;
}

import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { requireUserId, UnauthenticatedError } from "@/lib/auth-guard";

// next-auth의 auth()는 미들웨어 래퍼로도 쓰이는 오버로드 타입이라
// vi.mocked()의 타입 추론이 어긋난다. 순수 함수 모킹 목적이므로 unknown 캐스팅으로 우회.
const mockedAuth = auth as unknown as ReturnType<typeof vi.fn>;

describe("requireUserId", () => {
  it("세션이 있으면 user.id를 반환한다", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: "user-1" } });

    await expect(requireUserId()).resolves.toBe("user-1");
  });

  it("세션이 없으면 UnauthenticatedError를 던진다", async () => {
    mockedAuth.mockResolvedValueOnce(null);

    await expect(requireUserId()).rejects.toBeInstanceOf(UnauthenticatedError);
  });

  it("세션은 있지만 user.id가 없으면 UnauthenticatedError를 던진다", async () => {
    mockedAuth.mockResolvedValueOnce({ user: {} });

    await expect(requireUserId()).rejects.toBeInstanceOf(UnauthenticatedError);
  });
});

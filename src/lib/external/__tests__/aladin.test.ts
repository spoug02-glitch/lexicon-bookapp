import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { searchBooks, lookupBook, searchUsedItems } from "@/lib/external/aladin";

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValueOnce({
      ok,
      status,
      json: async () => body,
    }),
  );
}

beforeEach(() => {
  process.env.ALADIN_TTB_KEY = "test-ttb-key";
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("searchBooks", () => {
  it("정상 응답의 item 배열을 반환한다", async () => {
    mockFetchOnce({ item: [{ title: "테스트북", isbn13: "9788900000001" }] });

    const result = await searchBooks("테스트");

    expect(result).toEqual([{ title: "테스트북", isbn13: "9788900000001" }]);
  });

  it("item이 없으면 빈 배열을 반환한다", async () => {
    mockFetchOnce({});

    const result = await searchBooks("없는책");

    expect(result).toEqual([]);
  });

  it("errorCode가 있으면 에러를 던진다", async () => {
    mockFetchOnce({ errorCode: 900, errorMessage: "잘못된 키" });

    await expect(searchBooks("테스트")).rejects.toThrow("잘못된 키");
  });

  it("HTTP 오류면 에러를 던진다", async () => {
    mockFetchOnce({}, false, 500);

    await expect(searchBooks("테스트")).rejects.toThrow("HTTP 500");
  });

  it("ALADIN_TTB_KEY가 없으면 에러를 던진다", async () => {
    delete process.env.ALADIN_TTB_KEY;

    await expect(searchBooks("테스트")).rejects.toThrow("ALADIN_TTB_KEY");
  });
});

describe("lookupBook", () => {
  it("첫 번째 item을 반환한다", async () => {
    mockFetchOnce({ item: [{ title: "단권조회", isbn13: "9788900000002" }] });

    const result = await lookupBook("9788900000002");

    expect(result).toEqual({ title: "단권조회", isbn13: "9788900000002" });
  });

  it("item이 없으면 null을 반환한다", async () => {
    mockFetchOnce({ item: [] });

    const result = await lookupBook("9788900000099");

    expect(result).toBeNull();
  });
});

describe("searchUsedItems", () => {
  it("중고 매장 목록을 반환한다", async () => {
    mockFetchOnce({
      item: [{ offStoreName: "알라딘 중고서점 강남점", price: 8000, condition: "최상" }],
    });

    const result = await searchUsedItems("12345");

    expect(result).toHaveLength(1);
    expect(result[0].offStoreName).toBe("알라딘 중고서점 강남점");
  });

  it("item이 없으면 빈 배열을 반환한다", async () => {
    mockFetchOnce({});

    const result = await searchUsedItems("12345");

    expect(result).toEqual([]);
  });

  it("중고 매물이 없어 errorCode로 응답해도 던지지 않고 빈 배열을 반환한다", async () => {
    mockFetchOnce({ errorCode: 907, errorMessage: "키에 해당하는 상품이 존재하지 않습니다." });

    const result = await searchUsedItems("12345");

    expect(result).toEqual([]);
  });

  it("HTTP 오류면 에러를 던진다", async () => {
    mockFetchOnce({}, false, 500);

    await expect(searchUsedItems("12345")).rejects.toThrow("HTTP 500");
  });
});

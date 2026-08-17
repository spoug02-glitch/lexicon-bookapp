import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { checkHoldings } from "@/lib/external/library";

function queueFetchResponses(bodies: unknown[]) {
  const fn = vi.fn();
  for (const body of bodies) {
    fn.mockResolvedValueOnce({ ok: true, status: 200, json: async () => body });
  }
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeEach(() => {
  process.env.LIBRARY_API_KEY = "test-library-key";
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("checkHoldings", () => {
  it("소장 도서관마다 bookExist를 호출해 hasBook/loanAvailable을 결합한다", async () => {
    const fetchMock = queueFetchResponses([
      {
        response: {
          libs: [{ lib: { libCode: 111, libName: "[예시] 도서관A", address: "서울" } }],
        },
      },
      { response: { result: { hasBook: "Y", loanAvailable: "N" } } },
    ]);

    const result = await checkHoldings("9788900000001", "11", "11010");

    expect(result).toEqual([
      {
        libCode: "111",
        libName: "[예시] 도서관A",
        address: "서울",
        hasBook: true,
        loanAvailable: false,
      },
    ]);

    const firstCallUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(firstCallUrl.searchParams.get("isbn")).toBe("9788900000001");
    expect(firstCallUrl.searchParams.get("region")).toBe("11");
    expect(firstCallUrl.searchParams.get("dtl_region")).toBe("11010");
  });

  it("dtl_region 없이 region만으로도 조회할 수 있다", async () => {
    const fetchMock = queueFetchResponses([{ response: { libs: [] } }]);

    await checkHoldings("9788900000001", "11");

    const firstCallUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(firstCallUrl.searchParams.has("dtl_region")).toBe(false);
  });

  it("소장 도서관이 10개를 넘으면 상한(10개)까지만 조회한다", async () => {
    const libs = Array.from({ length: 15 }, (_, i) => ({
      lib: { libCode: i, libName: `도서관${i}`, address: "서울" },
    }));
    const fetchMock = queueFetchResponses([
      { response: { libs } },
      ...Array.from({ length: 10 }, () => ({
        response: { result: { hasBook: "Y", loanAvailable: "Y" } },
      })),
    ]);

    const result = await checkHoldings("9788900000001", "11", "11010");

    expect(result).toHaveLength(10);
    expect(fetchMock).toHaveBeenCalledTimes(11); // libSrchByBook 1회 + bookExist 10회
  });
});

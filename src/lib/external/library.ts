import "server-only";

const LIBRARY_BASE = "https://data4library.kr/api";

// 상세 조회(bookExist)를 각 소장 도서관마다 개별 호출해야 하므로,
// 한 번의 checkHoldings 호출이 과도하게 많은 업스트림 요청을 만들지 않도록 상한을 둔다.
const MAX_LIBRARIES_TO_CHECK = 10;

export interface LibraryHolding {
  libCode: string;
  libName: string;
  address: string;
  hasBook: boolean;
  loanAvailable: boolean;
}

interface RawLibEntry {
  lib: {
    libCode: number | string;
    libName: string;
    address: string;
  };
}

function getApiKey(): string {
  const key = process.env.LIBRARY_API_KEY;
  if (!key) {
    throw new Error("LIBRARY_API_KEY가 설정되지 않았습니다. .env.local을 확인하세요.");
  }
  return key;
}

async function fetchLibraryJson<T>(url: string, errorPrefix: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${errorPrefix}: HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

// libSrchByBook(도서 소장 도서관 조회) + bookExist(도서관별 소장/대출가능 여부)를 조합한다.
// region은 libSrchByBook의 필수 파라미터(도서관정보나루_API_Manual.pdf §13).
export async function checkHoldings(
  isbn13: string,
  regionCode: string,
  dtlRegionCode?: string,
): Promise<LibraryHolding[]> {
  const url = new URL(`${LIBRARY_BASE}/libSrchByBook`);
  url.searchParams.set("authKey", getApiKey());
  url.searchParams.set("isbn", isbn13);
  url.searchParams.set("region", regionCode);
  if (dtlRegionCode) {
    url.searchParams.set("dtl_region", dtlRegionCode);
  }
  url.searchParams.set("format", "json");

  const data = await fetchLibraryJson<{ response?: { libs?: RawLibEntry[] } }>(
    url.toString(),
    "도서관정보나루 libSrchByBook 오류",
  );
  const libs = (data.response?.libs ?? []).slice(0, MAX_LIBRARIES_TO_CHECK);

  return Promise.all(
    libs.map(async (entry) => {
      const libCode = String(entry.lib.libCode);
      const existUrl = new URL(`${LIBRARY_BASE}/bookExist`);
      existUrl.searchParams.set("authKey", getApiKey());
      existUrl.searchParams.set("libCode", libCode);
      existUrl.searchParams.set("isbn13", isbn13);
      existUrl.searchParams.set("format", "json");

      const existData = await fetchLibraryJson<{
        response?: { result?: { hasBook?: string; loanAvailable?: string } };
      }>(existUrl.toString(), "도서관정보나루 bookExist 오류");
      const result = existData.response?.result;

      return {
        libCode,
        libName: entry.lib.libName,
        address: entry.lib.address,
        hasBook: result?.hasBook === "Y",
        loanAvailable: result?.loanAvailable === "Y",
      };
    }),
  );
}

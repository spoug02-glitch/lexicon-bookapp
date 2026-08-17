import "server-only";

const ALADIN_BASE = "https://www.aladin.co.kr/ttb/api";

export interface AladinBookItem {
  title: string;
  author: string;
  publisher: string;
  pubDate: string;
  isbn13: string;
  cover: string;
  description?: string;
  priceSales: number;
  priceStandard: number;
  itemId: number;
}

export interface AladinUsedStoreItem {
  offStoreName: string;
  link: string;
  price: number;
  condition: string;
}

interface AladinApiResponse {
  item?: AladinBookItem[];
  errorCode?: number;
  errorMessage?: string;
}

interface AladinUsedApiResponse {
  item?: AladinUsedStoreItem[];
  errorCode?: number;
  errorMessage?: string;
}

function getTtbKey(): string {
  const key = process.env.ALADIN_TTB_KEY;
  if (!key) {
    throw new Error("ALADIN_TTB_KEY가 설정되지 않았습니다. .env.local을 확인하세요.");
  }
  return key;
}

function buildUrl(path: string, params: Record<string, string>): string {
  const url = new URL(`${ALADIN_BASE}/${path}`);
  url.searchParams.set("ttbkey", getTtbKey());
  url.searchParams.set("output", "js");
  url.searchParams.set("Version", "20131101");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

async function fetchAladin<T extends { errorCode?: number; errorMessage?: string }>(
  url: string,
  errorPrefix: string,
): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${errorPrefix}: HTTP ${res.status}`);
  }
  const data = (await res.json()) as T;
  if (data.errorCode) {
    throw new Error(`${errorPrefix}: ${data.errorMessage ?? data.errorCode}`);
  }
  return data;
}

export async function searchBooks(query: string): Promise<AladinBookItem[]> {
  const url = buildUrl("ItemSearch.aspx", {
    Query: query,
    QueryType: "Title",
    MaxResults: "20",
    start: "1",
    SearchTarget: "Book",
    Cover: "Big", // 기본값은 흐릿한 저해상도 썸네일이라 큰 표지 이미지를 요청한다.
  });
  const data = await fetchAladin<AladinApiResponse>(url, "알라딘 검색 API 오류");
  return data.item ?? [];
}

export async function lookupBook(isbn13: string): Promise<AladinBookItem | null> {
  const url = buildUrl("ItemLookUp.aspx", {
    ItemId: isbn13,
    ItemIdType: "ISBN13",
    Cover: "Big",
  });
  const data = await fetchAladin<AladinApiResponse>(url, "알라딘 조회 API 오류");
  return data.item?.[0] ?? null;
}

export async function searchUsedItems(itemId: string): Promise<AladinUsedStoreItem[]> {
  const url = buildUrl("ItemOffStoreList.aspx", { ItemId: itemId });
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`알라딘 중고매장 API 오류: HTTP ${res.status}`);
  }
  const data = (await res.json()) as AladinUsedApiResponse;
  // 이 엔드포인트는 중고 매물이 하나도 없는 상품이면 빈 목록이 아니라
  // errorCode로 응답한다("키에 해당하는 상품이 존재하지 않습니다" 등). 중고 매물
  // 없음은 정상적인 상태이므로 페이지 전체를 죽이지 않고 빈 배열로 처리한다.
  if (data.errorCode) {
    return [];
  }
  return data.item ?? [];
}

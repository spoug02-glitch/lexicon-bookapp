import "server-only";
import { prisma } from "@/lib/prisma";
import { getOrSetCache } from "@/lib/cache";
import { withQuota, QuotaExceededError } from "@/lib/quota";
import {
  searchBooks,
  lookupBook,
  searchUsedItems,
  type AladinBookItem,
  type AladinUsedStoreItem,
} from "@/lib/external/aladin";
import type { Book } from "@prisma/client";

// Server Component와 Route Handler가 공유하는 서비스 레이어.
// Server Component에서 자신의 Route Handler를 다시 fetch하는 안티패턴을 피하기 위해
// 캐싱/쿼터/외부 API 호출 로직을 여기 한 곳에 모은다.

const SEARCH_TTL_MS = 12 * 60 * 60 * 1000;
const BOOK_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const USED_TTL_MS = 2 * 60 * 60 * 1000;

export interface SearchResult {
  items: AladinBookItem[];
  stale: boolean;
  quotaExceeded: boolean;
}

export async function searchBooksService(query: string): Promise<SearchResult> {
  try {
    const { data, stale } = await getOrSetCache("ALADIN_SEARCH", query, SEARCH_TTL_MS, () =>
      withQuota("ALADIN_SEARCH", () => searchBooks(query)),
    );
    return { items: data, stale, quotaExceeded: false };
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      return { items: [], stale: false, quotaExceeded: true };
    }
    throw error;
  }
}

function toBookData(item: AladinBookItem) {
  return {
    title: item.title,
    author: item.author,
    publisher: item.publisher,
    pubDate: item.pubDate ? new Date(item.pubDate) : null,
    coverUrl: item.cover,
    description: item.description,
    priceSales: item.priceSales,
    priceStandard: item.priceStandard,
    aladinItemId: String(item.itemId),
  };
}

export interface BookDetailResult {
  book: Book | null;
  stale: boolean;
  quotaExceeded: boolean;
}

export async function getBookDetailService(isbn13: string): Promise<BookDetailResult> {
  const existing = await prisma.book.findUnique({ where: { isbn13 } });
  const isFresh = existing
    ? Date.now() - existing.cachedAt.getTime() < BOOK_CACHE_TTL_MS
    : false;
  if (isFresh && existing) {
    return { book: existing, stale: false, quotaExceeded: false };
  }

  try {
    const item = await withQuota("ALADIN_LOOKUP", () => lookupBook(isbn13));
    if (!item) {
      return { book: existing ?? null, stale: !!existing, quotaExceeded: false };
    }
    const book = await prisma.book.upsert({
      where: { isbn13 },
      update: toBookData(item),
      create: { isbn13, ...toBookData(item) },
    });
    return { book, stale: false, quotaExceeded: false };
  } catch (error) {
    if (existing) return { book: existing, stale: true, quotaExceeded: false };
    if (error instanceof QuotaExceededError) {
      return { book: null, stale: false, quotaExceeded: true };
    }
    throw error;
  }
}

export interface UsedListingsResult {
  items: AladinUsedStoreItem[];
  stale: boolean;
  quotaExceeded: boolean;
}

export async function getUsedListingsService(isbn13: string): Promise<UsedListingsResult> {
  const book = await prisma.book.findUnique({ where: { isbn13 } });
  if (!book?.aladinItemId) {
    return { items: [], stale: false, quotaExceeded: false };
  }

  try {
    const { data, stale } = await getOrSetCache("ALADIN_USED", isbn13, USED_TTL_MS, () =>
      withQuota("ALADIN_USED", () => searchUsedItems(book.aladinItemId as string)),
    );
    return { items: data, stale, quotaExceeded: false };
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      return { items: [], stale: false, quotaExceeded: true };
    }
    throw error;
  }
}

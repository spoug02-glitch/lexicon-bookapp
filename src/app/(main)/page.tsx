import { Header } from "@/components/layout/Header";
import { SearchBar } from "@/components/search/SearchBar";
import { BookCard } from "@/components/book/BookCard";
import { QuotaBanner } from "@/components/ui/QuotaBanner";
import { searchBooksService } from "@/lib/services/books";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim();
  const result = query ? await searchBooksService(query) : null;

  return (
    <>
      <Header title="검색" />
      <main className="flex flex-col relative w-full pt-header-safe pb-24 px-margin-mobile bg-background min-h-screen">
        <div className="flex flex-col w-full gap-stack-lg">
          <div className="sticky top-header-safe z-40 bg-surface/95 backdrop-blur pt-stack-sm pb-stack-md -mx-margin-mobile px-margin-mobile">
            <SearchBar defaultValue={query} />
          </div>

          {!query && (
            <p className="text-body-md text-on-surface-variant text-center mt-stack-lg">
              책 제목을 검색해보세요.
            </p>
          )}

          {query && result?.quotaExceeded && <QuotaBanner provider="aladin" />}

          {query && result && !result.quotaExceeded && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-title-lg text-title-lg text-on-background">검색 결과</h2>
                <span className="font-label-md text-label-md text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
                  {result.items.length}개의 결과
                </span>
              </div>

              {result.stale && <QuotaBanner provider="aladin" />}

              {result.items.length === 0 ? (
                <div className="mt-4 flex flex-col items-center justify-center p-6 bg-surface-container/50 rounded-xl">
                  <span className="material-symbols-outlined text-display text-primary-fixed-dim mb-2">
                    search_off
                  </span>
                  <p className="font-body-md text-body-md text-on-surface-variant text-center">
                    검색 결과가 없습니다.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-stack-md">
                  {result.items.map((item) => (
                    // 같은 책의 리커버/한정판/세트가 ISBN13을 공유하는 경우가 있어
                    // 알라딘 상품 고유 ID(itemId)까지 합쳐 key를 만든다.
                    <BookCard
                      key={`${item.isbn13}-${item.itemId}`}
                      isbn13={item.isbn13}
                      title={item.title}
                      author={item.author}
                      coverUrl={item.cover}
                      priceSales={item.priceSales}
                    />
                  ))}
                  <div className="mt-4 flex flex-col items-center justify-center p-6 bg-surface-container/50 rounded-xl">
                    <span className="material-symbols-outlined text-display text-primary-fixed-dim mb-2">
                      auto_awesome
                    </span>
                    <p className="font-body-md text-body-md text-on-surface-variant text-center">
                      검색 결과의 끝입니다.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

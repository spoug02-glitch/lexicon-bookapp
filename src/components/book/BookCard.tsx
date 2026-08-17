import Link from "next/link";
import { BookCover } from "./BookCover";

interface BookCardProps {
  isbn13: string;
  title: string;
  author?: string | null;
  coverUrl?: string | null;
  priceSales?: number | null;
}

// 검색 결과 목록은 알라딘 ItemSearch 1회 호출로 얻는 정가만 표시한다.
// 도서관 소장여부·중고 시세는 항목마다 추가 업스트림 호출(최대 10회+)이 필요해
// 목록 화면에서는 보여주지 않고, 책 상세 페이지에서 확인하도록 안내한다.
export function BookCard({ isbn13, title, author, coverUrl, priceSales }: BookCardProps) {
  return (
    <Link
      href={`/books/${isbn13}`}
      className="group relative flex w-full bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <BookCover src={coverUrl} alt={title} size="md" />
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div className="flex flex-col gap-unit">
          <h3 className="font-title-lg text-title-lg text-on-surface truncate">{title}</h3>
          {author && (
            <p className="font-body-md text-body-md text-on-surface-variant truncate">{author}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {priceSales != null && (
            <div className="flex items-baseline gap-1 text-on-surface">
              <span className="font-label-md text-label-md text-on-surface-variant">정가</span>
              <span className="font-body-md text-body-md font-medium">
                {priceSales.toLocaleString()}원
              </span>
            </div>
          )}
          <span className="font-label-md text-label-md text-on-surface-variant/70">
            도서관·중고 시세는 상세보기에서 확인
          </span>
        </div>
      </div>
    </Link>
  );
}

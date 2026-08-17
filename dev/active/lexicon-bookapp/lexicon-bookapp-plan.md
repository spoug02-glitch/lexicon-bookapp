# Lexicon 책 통합검색 & 리뷰 서비스 — 승인된 계획

> 원본 계획 파일: `C:\Users\notebook\.claude\plans\ticklish-growing-stonebraker.md` (전문 동일하게 복사)

## Context

PRD(`# PRD — 책 통합검색 & 리뷰 서비스 (가칭).txt`)와 스티치(Google Stitch) 정적 목업 4종(`stitch_bookconnect/_1~_4`)을 기반으로, 도서관 소장 여부·서점 정가·중고 시세를 한 화면에서 비교하고 획득 경로와 무관하게 리뷰를 한곳에 모으는 웹앱을 만든다. 지금 작업 디렉토리는 PRD 파일과 정적 HTML 목업만 있는 완전한 그린필드 상태다.

사용자가 확정한 결정: **Next.js(App Router)+TS / Prisma+SQLite / NextAuth Google OAuth / 로컬 개발까지만(배포 제외)**. 도서관정보나루·알라딘 API 키는 이미 발급받은 상태.

목업을 코드로 그대로 옮기면 발생하는 정합성 문제 3가지를 이번 계획에서 함께 바로잡는다:
1. **알라딘 API는 알라딘 자체 정가·중고재고만 제공**한다 (교보문고 등 타 서점 가격 비교 불가). PRD SECTION 4도 "알라딘 Open API 기반"이라고만 되어 있어 이 범위와 일치한다. 목업의 "Kyobo Bookstore ₩16,500"는 오해 소지가 있으므로 "서점 정가(알라딘 기준)"으로 표기를 교정한다.
2. **"2.4 km away"(거리)는 Geolocation이 필요해 MVP 범위 밖**이다. 도서관 소재지(구/주소 텍스트)로 대체한다.
3. **하단 네비의 "아카이브"·"설정", 책 상세의 "읽고 싶어요" 북마크는 PRD MVP 목록에 없다.** 라우트는 만들되 "준비 중" 스텁으로 처리한다.

## 기술 스택 & 아키텍처

- **프레임워크**: Next.js 14+ App Router, TypeScript
- **DB/ORM**: SQLite + Prisma (로컬 파일 DB, `prisma/dev.db`)
- **인증**: NextAuth(Auth.js) + Google Provider, PrismaAdapter, **세션 전략은 JWT** (Edge 미들웨어 호환을 위해)
- **스타일**: Tailwind (npm 설치 방식, CDN 스크립트 금지) — 스티치 `code.html`의 인라인 tailwind.config를 `tailwind.config.ts`로 이식. 폰트는 `next/font/google`의 Hanken Grotesk. 아이콘은 `material-symbols` npm 패키지
- **외부 API**: 도서관정보나루(`libSrch`, `libSrchByBook`, `bookExist`), 알라딘 Open API(`ItemSearch`, `ItemLookUp`, `ItemOffStoreList`) — 서버사이드 전용(`"server-only"`), Route Handler가 프록시

## 데이터 모델 (Prisma)

- `User/Account/Session/VerificationToken` — NextAuth 표준
- `Book` (isbn13 PK) — 알라딘 응답을 정식 캐시 엔티티로 저장. `cachedAt`으로 TTL 판단
- `Review` — `userId`, `bookId`, `rating`(optional 1-5), `body`, `finishedAt`, `acquisitionRoute`(enum 4값), `acquisitionDetail`(nullable, SUBSCRIPTION/ONLINE일 때만 값 존재, Zod refine 강제)
- `AcquisitionPreset` — 2차 세부 플랫폼 프리셋+자유입력 자동완성 (route, label, isSeed, usageCount)
- `ApiCache` / `ApiQuotaUsage` — 외부 API 캐싱 + 알라딘 쿼터 추적

## 캐싱 TTL

알라딘 ItemLookUp 7일 / ItemSearch 12시간 / ItemOffStoreList 2시간, 도서관 소장여부 12시간, 구별 도서관목록 30일. 쿼터 안전마진 4,800/5,000 초과 시 stale 반환 또는 QuotaBanner.

## 라우트 구조

```
app/(main)/page.tsx, search/           → _4 검색
app/(main)/books/[isbn13]/page.tsx     → _2 책 상세
app/(main)/books/[isbn13]/review/new/  → _3 리뷰 작성(책 확정)
app/(main)/reviews/new/                → _3 리뷰 작성(책 미확정, 네비 + 버튼)
app/(main)/history/page.tsx            → _1 마이페이지
app/(main)/archive/, settings/         → MVP 밖, 스텁
app/api/books/*, app/api/library/*     → 외부 API 프록시
app/api/auth/[...nextauth]             → NextAuth
app/actions/reviews.ts#createReview    → 리뷰 작성 Server Action
middleware.ts                          → /reviews, /books/*/review, /history 인증 필요
```

## 핵심 컴포넌트

`layout/{Header,BottomNav}`, `book/{BookCard,BookCover,AvailabilityBadge}`, `acquisition/{AcquisitionBadge,AcquisitionRouteSelector}`, `review/{StarRating,ReviewCard,ReviewForm}`, `search/SearchBar`, `history/FilterChips`, `ui/QuotaBanner`.

## 한글화 목록

| 위치 | 원문 | 교체 |
|---|---|---|
| 마이페이지 프로필명/등급 | Elara Vance / Scholar | [예시] 이서연 / [예시] 다독가 |
| 마이페이지 리뷰 3건 | The Design of Everyday Things 등 | [예시] 도서 제목 B/C/D, [예시] 저자 B/C/D |
| 마이페이지 인용 리뷰 2건 | 영문 인용구 | 한글 예시 인용구 |
| 책상세 대출상태 | Available | 대출가능 |
| 책상세 도서관명/거리 | Seoul Central Library / 2.4 km away | [예시] 서울중앙도서관 / [예시] 서울특별시 종로구 |
| 책상세 서점 섹션 | Kyobo Bookstore, From ₩8,000 | "서점 정가(알라딘 기준)", [예시] 온라인 서점 |
| 책상세 중고 매장 | Aladin Used Books, 3 copies available (Very Good) | 알라딘 중고서점(실명 유지), [예시] 3권 재고 (최상급) |
| 책상세 리뷰어명 3건 | Reader_123, BookWorm99, NovelLover | [예시] 독서가A/B/C |
| 검색화면 도서명 3건 | The Elements of Typographic Style 등 | [예시] 도서 제목 A/B/C |

## 작업 순서 (Phase)

0. 부트스트랩(create-next-app, Tailwind 토큰 이식, .env.example/.env.local)
1. 데이터 계층(schema.prisma, migrate, seed)
2. 인증(NextAuth Google, middleware)
3. 외부 API 연동(cache, quota, aladin.ts, library.ts) — 단위테스트
4. UI 원자 컴포넌트 — StarRating/AcquisitionRouteSelector 상태분기 테스트
5. 화면 조립(4라우트+스텁) — createReview Zod 검증 테스트
6. QA(한글화 전수 확인, grep 재검증)
7. 로컬 실행 검증(dev 구동, Google 로그인, 전체 플로우, README)

## 검증 방법

- Phase 3~5 순수 로직은 Vitest RED→GREEN
- Phase 7 실키로 dev 구동 후 4화면 수동 클릭 검증
- 완료 보고 전 영어 텍스트 잔존 grep 재확인 후 체크리스트 보고

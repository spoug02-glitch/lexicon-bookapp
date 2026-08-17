# Lexicon 책 통합검색 & 리뷰 서비스 — 태스크 체크리스트

## Phase 0 — 부트스트랩
- [x] create-next-app (TS, App Router, ESLint) — Next.js 16 / Tailwind v4로 스캐폴딩됨
- [x] Tailwind npm 설치 (CDN 금지) — v4 CSS-first, tailwind.config.ts 대신 globals.css `@theme`
- [x] globals.css `@theme` — 스티치 code.html 토큰 이식 (색상/spacing/폰트 스케일)
- [x] next/font Hanken Grotesk 세팅
- [x] material-symbols npm 패키지 설치+import
- [x] 폴더 스켈레톤 생성
- [x] .env.example 생성 (키 이름만, YES24_API_KEY 자리 포함)
- [x] .env.local 생성 (LIBRARY_API_KEY/ALADIN_TTB_KEY(자리만)/AUTH_GOOGLE_*/AUTH_SECRET 입력완료)

## Phase 1 — 데이터 계층
- [x] schema.prisma 작성 (User/Account/Session/VerificationToken/Book(+isSeed)/Review/AcquisitionPreset/ApiCache/ApiQuotaUsage)
- [x] prisma migrate dev (Prisma 6.19.3로 고정 — 7.x는 datasource url 방식 폐지돼 스킵)
- [x] lib/prisma.ts 싱글턴
- [x] prisma/seed.ts (한글 [예시] 데이터: 책 4권, 사용자 4명, 리뷰 6건, 프리셋 7개)

## Phase 2 — 인증
- [x] lib/auth.ts + lib/auth.config.ts (NextAuth v5 + Google + PrismaAdapter + JWT 세션, Edge 호환 위해 config 분리)
- [x] app/api/auth/[...nextauth]/route.ts
- [x] types/next-auth.d.ts (session.user.id 확장)
- [x] src/proxy.ts (Next.js 16이 middleware.ts를 deprecated 처리 → proxy.ts로 마이그레이션)
- [x] 커스텀 한글 로그인 페이지 (app/signin) — NextAuth 기본 페이지가 영어라 교체
- [x] Google Cloud Console 리디렉션 URI 실사용자 등록 확인 완료 (redirect_uri_mismatch 해소, Google 로그인 페이지까지 정상 도달)

## Phase 3 — 외부 API 연동 (TDD)
- [x] lib/cache.ts#getOrSetCache — 캐시 히트/미스/만료 테스트 5개
- [x] lib/quota.ts#checkQuota/recordQuotaUsage/withQuota — 임계치+합성 테스트 8개
- [x] lib/external/aladin.ts (searchBooks/lookupBook/searchUsedItems) — fetch 모킹 테스트 8개
- [x] lib/external/library.ts (checkHoldings) — 도서관정보나루_API_Manual.pdf 기준 파라미터 수정(isbn/region) 후 테스트 3개
- [x] lib/services/{books,library}.ts — Route Handler와 Server Component가 공유하는 서비스 레이어(자기 API 재호출 안티패턴 회피)
- [x] app/api/books/{search,[isbn13],[isbn13]/used}/route.ts, app/api/library/[isbn13]/route.ts
- [x] searchDistrictLibraries/구목록 API 제거 — 서울 25개 구 코드는 lib/seoul-districts.ts 정적 상수로 대체(API 매뉴얼에서 고정 코드표 확인)
- [x] 실키(LIBRARY_API_KEY)로 브라우저 스모크 테스트 완료 — 가짜 ISBN에 정확히 "소장없음" 응답 확인

## Phase 4 — UI 컴포넌트
- [x] layout/{Header,BottomNav}
- [x] book/{BookCard,BookCover,AvailabilityBadge,LibraryAvailabilityCard}
- [x] acquisition/AcquisitionBadge (색상 매핑 단일화)
- [x] acquisition/AcquisitionRouteSelector — 상태분기 테스트 5개 (도서관/오프라인 선택시 2차값 초기화 등)
- [x] review/{StarRating,ReviewCard,ReviewForm}
- [x] search/SearchBar
- [x] history/FilterChips
- [x] ui/QuotaBanner

## Phase 5 — 화면 조립
- [x] app/(main)/page.tsx (검색 — 실 알라딘 검색 연동)
- [x] app/(main)/books/[isbn13]/page.tsx (책 상세 — 도서관/서점/중고 3카드 + 커뮤니티 리뷰)
- [x] app/books/[isbn13]/review/new/, app/reviews/new/ (리뷰 작성 — (main) 그룹 밖으로 이동, BottomNav와 겹침 방지)
- [x] app/(main)/history/page.tsx (마이페이지 — 필터+월별 그룹)
- [x] app/(main)/archive/, settings/ (스텁)
- [x] app/actions/reviews.ts#createReview + lib/validation/review.ts Zod 조건부 검증 테스트 9개

## Phase 6 — QA
- [x] 소스 전체 영어 UI 텍스트 잔존 grep 검증 (아이콘 리거처 텍스트 제외 전부 한글 확인)
- [x] 시드(데모) 책 4권에 isSeed 플래그 추가 + 상세 페이지 "[예시]" 배너 — 가격 등 임의 숫자에 라벨 누락 발견해 수정
- [x] 4개 목업과 실제 화면 스크린샷 비교(Playwright)

## Phase 7 — 로컬 실행 검증
- [x] npm run dev 구동 확인
- [x] Google 로그인 콜백 동작 확인 (redirect_uri_mismatch 발견 → 사용자가 Google Console에 등록 → 해소 확인)
- [x] 검색/책상세/도서관API/로그인 화면 Playwright로 실제 렌더링 확인
- [x] README.md 셋업 절차 문서화
- [ ] ALADIN_TTB_KEY 실키 입력 후 실제 검색 결과 수동 확인 (사용자가 키 발급 후 진행 예정)
- [ ] Google 로그인 계정 자격증명으로 실제 리뷰 작성 → 마이페이지 반영까지 수동 E2E (사용자 직접 진행 필요)

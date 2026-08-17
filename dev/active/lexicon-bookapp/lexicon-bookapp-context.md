# Lexicon 책 통합검색 & 리뷰 서비스 — Context

Last Updated: 2026-08-09 (MVP 전 Phase 구현 완료, 로컬 검증 완료)

## 남은 일 (사용자 진행 필요)

- `ALADIN_TTB_KEY` 입력 완료 (2026-08-09) — 실제 검색 결과 확인 필요
- Google 계정으로 실제 로그인 → 리뷰 작성 → 마이페이지 반영까지 수동 확인 (redirect_uri_mismatch는 해소됨, Google 로그인 페이지까지는 확인 완료)
- 배포는 이번 범위 밖 (요청 시 별도 진행)

## 핵심 파일

- PRD: `# PRD — 책 통합검색 & 리뷰 서비스 (가칭).txt` (프로젝트 루트)
- 스티치 목업: `stitch_bookconnect/_1`(마이페이지) `_2`(책상세) `_3`(리뷰작성) `_4`(검색), 각 폴더에 `code.html`+`screen.png`
- 디자인 시스템: `stitch_bookconnect/lexicon_archival/DESIGN.md` (단, 실제 렌더링은 각 `code.html` 인라인 tailwind.config가 source of truth — DESIGN.md의 borderRadius 값과 미세 차이 있음, `md`(0.375rem)만 DESIGN.md에서 보강)
- 승인된 계획 원본: `C:\Users\notebook\.claude\plans\ticklish-growing-stonebraker.md`

## 사용자 확정 의사결정 (재논의 불필요)

| 항목 | 결정 |
|---|---|
| 인증 방식 | Google OAuth (NextAuth) |
| API 키 보유 | 도서관정보나루 + 알라딘 둘 다 이미 발급받음. `.env.local`에 사용자가 직접 입력 |
| 기술 스택 | Next.js(App Router) + TS + Prisma + SQLite |
| 배포 범위 | 로컬 개발/실행 확인까지만. 배포(Vercel 등)는 이번 단계 제외 |

## 계획 승인 시 함께 바로잡은 정합성 이슈 (중요 — 구현 중 잊지 말 것)

1. 알라딘 API는 알라딘 자체 정가/중고재고만 제공 (타 서점 가격비교 불가) → "서점 정가(알라딘 기준)"로 표기
2. 도서관 "거리"(km)는 Geolocation 필요해 MVP 제외 → 소재지 텍스트로 대체
3. 하단 네비 "아카이브"/"설정", 책상세 "읽고 싶어요" 북마크는 PRD MVP 목록에 없음 → 스텁 처리

## 추가 결정 (계획 승인 이후)

- YES24 API: 유료라 최종 제외 결정 (2026-08-09). `.env`의 자리 표시도 삭제함. 연동 안 함

## 외부 API 참고

- 도서관정보나루: `https://data4library.kr/api/{libSrch,libSrchByBook,bookExist}` — 공식 일일 호출 한도 불명확하나 캐싱은 동일 적용
- 알라딘: `https://www.aladin.co.kr/ttb/api/{ItemSearch,ItemLookUp,ItemOffStoreList}.aspx` — 개인 계정 일 5,000회 제한 확정. 안전마진 4,800에서 컷

## 절대 규칙 (사용자 지정)

- 모든 사용자 대면 텍스트는 한글. 스티치 원본에 남은 영어(카드 콘텐츠, 예시 데이터 포함) 전부 교체
- 실제처럼 보이는 임의 숫자(가격/거리/재고/리뷰수) 금지 — 불가피하면 "[예시]" 라벨 병기
- PRD "Later" 항목(구독앱 API 통합, 개인간거래 통합, 리뷰추천, 웹소설 구간경로) 절대 구현 금지
- 애매한 설계 판단은 임의 결정 금지, 먼저 질문

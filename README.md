# Lexicon — 책 통합검색 & 리뷰 서비스

도서관 소장 여부, 서점 정가, 중고 시세를 한 화면에서 비교하고, 어디서 읽었든 리뷰를 한곳에
모아볼 수 있는 서비스. 자세한 배경과 설계는 `# PRD — 책 통합검색 & 리뷰 서비스 (가칭).txt`와
`dev/active/lexicon-bookapp/`의 dev docs를 참고하세요.

## 기술 스택

- Next.js 16 (App Router) + TypeScript
- Prisma 6 + SQLite (로컬 개발용)
- NextAuth(Auth.js) v5 + Google OAuth
- Tailwind CSS v4 (CSS-first `@theme`)
- Vitest + Testing Library

## 처음 셋업하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example`을 참고해 `.env.local`에 실제 값을 채웁니다(`.env.local`은 git에 커밋되지 않음).

| 키 | 발급처 |
|---|---|
| `LIBRARY_API_KEY` | https://www.data4library.kr/openApi/apply |
| `ALADIN_TTB_KEY` | https://blog.aladin.co.kr/openapi/ |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | https://console.cloud.google.com/apis/credentials — OAuth 클라이언트(웹 애플리케이션) 생성, **승인된 리디렉션 URI에 `http://localhost:3000/api/auth/callback/google` 반드시 추가** |
| `AUTH_SECRET` | `npx auth secret`으로 생성하거나 임의의 긴 무작위 문자열 |

`NOTION_API_KEY` / `NOTION_DATABASE_ID`는 설정 페이지의 "노션 연동"(리뷰 내보내기/불러오기)에만
필요합니다. 설정 방법은 아래 "노션 연동 설정" 참고. 값을 비워두면 이 기능만 비활성 상태로 동작합니다.

### 3. 데이터베이스 준비

```bash
npx prisma migrate dev
npm run db:seed
```

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 접속. 검색·책 상세는 로그인 없이 열람 가능하고, 리뷰 작성·마이페이지는
Google 로그인이 필요합니다.

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm test` | Vitest 전체 테스트 실행 |
| `npm run db:seed` | 데모용 예시 데이터([예시] 표기) 시드 |

## 노션 연동 설정

내가 쓴 리뷰를 노션 데이터베이스로 내보내거나(반복 실행해도 중복 없이 갱신), 노션에서 직접
추가한 행을 리뷰로 불러올 수 있습니다(설정 페이지 → 노션 연동).

1. https://www.notion.so/my-integrations 에서 새 Integration 생성 → Internal Integration Secret 복사 → `NOTION_API_KEY`에 입력
2. 노션에 빈 페이지를 하나 만들고, 우측 상단 "공유" → 초대 검색창에 방금 만든 Integration 이름을 입력해 초대
3. 그 페이지 ID(페이지 URL의 `?` 앞, 32자리 문자열)로 아래 명령 실행:
   ```bash
   npm run notion:setup -- <페이지ID>
   ```
   (`.env.local`을 자동으로 읽어서 `NOTION_API_KEY`를 사용함)
4. 출력된 데이터소스 ID를 `NOTION_DATABASE_ID`에 붙여넣기

불러오기는 `LexiconReviewId` 속성이 비어 있는 행(=노션에서 직접 추가한 행)만 새 리뷰로 가져오며,
그 행에는 `ISBN13`·`획득경로`·`완독일` 속성이 반드시 채워져 있어야 합니다.

## 데모 데이터 안내

`prisma/seed.ts`로 생성되는 책/사용자/리뷰는 전부 화면 데모용 가상 데이터입니다. 제목·저자·가격
등은 실제 정보가 아니며 "[예시]" 표기가 붙어 있습니다. 실제 알라딘 검색 결과는 `ALADIN_TTB_KEY`가
설정된 경우 실시간으로 조회됩니다.

## 알려진 제약

- 도서관 소장 여부는 서울 25개 구 기준으로만 조회 가능합니다(도서관정보나루 API의 `region`/
  `dtl_region` 코드 체계 참고).
- 알라딘 API는 알라딘 자체 판매가·중고 재고만 제공하며, 다른 서점(교보문고 등)과의 가격 비교
  기능은 없습니다.
- 배포 설정은 이번 범위에 포함되지 않았습니다(로컬 개발 확인까지).

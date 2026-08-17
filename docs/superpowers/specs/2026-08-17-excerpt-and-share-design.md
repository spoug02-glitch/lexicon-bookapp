# 문장 발췌 + 공유 기능 설계

## 배경

리뷰 작성 시 "총평 한 덩어리"만 남길 수 있던 기존 구조에, 노션 블록처럼 문장을 하나씩 발췌해
쌓아나가는 흐름을 추가한다. 또한 공개 리뷰를 로그인 없이도 볼 수 있는 공유 링크 기능을 추가한다.
둘 다 PRD의 "Later" 항목이 아니며, 기존 리뷰 모델(채널/태그/공개범위)을 확장하는 형태로 구현한다.

## 확정된 결정

- 발췌 블록 하나 = 문장(필수) + 페이지(선택) + 한줄코멘트(선택, 기본 접혀있고 펼쳐서 입력)
- 발췌는 여러 개 추가 가능(노션 블록처럼 `+` 로 계속 추가), 순서는 위/아래 화살표로만 조정
  (드래그앤드롭은 이번 범위 아님)
- 폼 순서: 발췌 블록들 → 총평(기존 body) → 채널/태그/공개설정
- 공개 범위는 리뷰 전체 1단위로만 조절(기존 `visibility` 그대로 재사용). 발췌 블록별 개별
  노출 토글은 만들지 않는다 — UX 복잡도 우려로 기각됨
- 공유는 "공개 링크"만 만든다. 이미지 카드 렌더링은 이번 범위에서 제외하고 Later로 보류하되,
  나중에 쉽게 얹을 수 있도록 읽기 전용 렌더링을 순수 프레젠테이션 컴포넌트로 분리해둔다
- 공유 링크는 `visibility === "PUBLIC"`인 리뷰만 유효. 비공개 리뷰는 공유 버튼 자체를 숨긴다
  (별도의 "링크로만 공개" 같은 중간 상태는 만들지 않는다)

## 데이터 모델 변경 (prisma/schema.prisma)

```prisma
model Excerpt {
  id        String   @id @default(cuid())
  reviewId  String
  quote     String
  page      Int?
  comment   String?
  order     Int
  createdAt DateTime @default(now())

  review Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)

  @@index([reviewId, order])
}
```

`Review`에 `excerpts Excerpt[]` relation 추가. 그 외 필드 변경 없음(공유는 기존 `visibility` 재사용).

`prisma migrate dev` 1회, `seed.ts`에 리뷰 1~2개에 발췌 2~3개씩 데모로 추가(`[예시]` 표기 유지).

## 검증 (src/lib/validation/review.ts)

`createReviewSchema`에 필드 추가:
```
excerpts: z.array(z.object({
  quote: z.string().trim().min(1).max(500),
  page: z.number().int().positive().nullable(),
  comment: z.string().trim().max(200).nullable(),
})).max(20).default([])
```
빈 quote(공백만 있는 경우)는 클라이언트에서 제출 전 필터링, 서버에서도 min(1)로 이중 방어.

## UI 컴포넌트

- `components/review/ExcerptBlockList.tsx` 신규: 발췌 블록 배열 상태 관리, `+ 발췌 추가` 버튼,
  블록별 문장 인풋 + 페이지 인풋(선택) + "한줄코멘트 추가" 토글 링크(누르면 코멘트 textarea
  펼쳐짐) + 삭제(x) 버튼 + 위/아래 순서 버튼
- `ReviewForm.tsx`: ExcerptBlockList를 총평 textarea 위에 배치, 제출 시 payload에
  `excerpts` 포함(빈 quote 블록은 필터링 후 전송)
- `ReviewCard.tsx` / 새 `ShareReviewCard.tsx`(공유 페이지 전용): 발췌 블록을 순서대로 인용구
  스타일로 표시(문장 + 페이지 있으면 "p.xx", 코멘트 있으면 그 아래 작게)
- `ShareButton.tsx` 신규: PUBLIC 리뷰에서만 렌더링. 클릭 시 `/share/[reviewId]` 절대 URL을
  Web Share API(`navigator.share`)가 있으면 그걸로, 없으면 클립보드 복사 + 토스트 안내

## 공유 페이지 (`src/app/share/[reviewId]/page.tsx`)

- 신규 라우트 그룹(로그인 불필요, `(main)` 밖에 별도로 둠 — 헤더/탭바 없는 단독 페이지)
- `visibility !== "PUBLIC"`이거나 리뷰가 없으면 `notFound()`
- `ShareReviewCard`(읽기 전용, 좋아요/수정/삭제 버튼 없음)로 책 정보 + 한줄평 + 발췌 목록 +
  총평 + 채널뱃지 + 태그 렌더링
- 향후 이미지 카드 확장을 대비해 `ShareReviewCard`는 서버/클라이언트 상태에 의존하지 않는
  순수 프레젠테이션 컴포넌트로 유지(나중에 `opengraph-image` 라우트나 스크린샷 서비스로
  재사용 가능하도록)

## 서버 액션 (`app/actions/reviews.ts`)

- `createReview`/`updateReview`: `syncReviewTags`와 동일한 패턴으로 `syncReviewExcerpts`
  신규(update 시 기존 Excerpt 전체 삭제 후 배열 인덱스를 `order`로 재생성)
- 공유 관련 별도 서버 액션은 불필요(공유 페이지는 공개 데이터를 그냥 조회하는 서버 컴포넌트)

## 작업 순서

1. 스키마 변경(Excerpt 모델) + 마이그레이션 + seed.ts에 발췌 데모 추가
2. 검증(review.ts) 재작성 + 테스트
3. ExcerptBlockList 컴포넌트 신규 + 테스트, ReviewForm에 통합
4. ReviewCard/ShareReviewCard에 발췌 렌더링 추가
5. ShareButton 컴포넌트 + 책상세/마이페이지 리뷰 카드에 배치
6. `/share/[reviewId]` 라우트 신규(visibility 가드 포함)
7. 서버 액션(syncReviewExcerpts) 갱신
8. 전체 빌드/lint/테스트, Playwright로 발췌 추가/삭제/순서변경, 공유 링크 접근(공개/비공개
   리뷰 양쪽) 실제 확인

## 검증 방법

- `npx vitest run`, `npm run lint`, `npm run build` 전부 클린
- Playwright로: 리뷰 작성 폼에서 발췌 여러 개 추가 → 순서 변경 → 코멘트 펼치기 → 저장 확인.
  공개 리뷰의 공유 버튼으로 `/share/[id]` 접근 시 정상 렌더링, 비공개 리뷰는 공유 버튼 안 보임
  + 직접 URL 접근 시 404 확인.

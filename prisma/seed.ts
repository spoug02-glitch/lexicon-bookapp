import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 모든 book/user 데이터는 실제 정보가 아닌 화면 데모용 예시입니다.
// 사용자 대면 필드([예시] 표기 대상)는 seedBooks/seedUsers/seedReviews에서 명시적으로 관리합니다.

async function main() {
  const books = [
    {
      isbn13: "9788900000001",
      title: "[예시] 도서 제목 A",
      author: "[예시] 저자 A",
      publisher: "[예시] 출판사",
      pubDate: new Date("2023-10-15"),
      priceStandard: 16500,
      priceSales: 14850,
      description: "[예시] 책 소개 문구입니다.",
      isSeed: true,
    },
    {
      isbn13: "9788900000002",
      title: "[예시] 도서 제목 B",
      author: "[예시] 저자 B",
      publisher: "[예시] 출판사",
      pubDate: new Date("2022-03-02"),
      priceStandard: 35000,
      priceSales: 31500,
      description: "[예시] 책 소개 문구입니다.",
      isSeed: true,
    },
    {
      isbn13: "9788900000003",
      title: "[예시] 도서 제목 C",
      author: "[예시] 저자 C",
      publisher: "[예시] 출판사",
      pubDate: new Date("2021-11-20"),
      priceStandard: 42000,
      priceSales: 37800,
      description: "[예시] 책 소개 문구입니다.",
      isSeed: true,
    },
    {
      isbn13: "9788900000004",
      title: "[예시] 도서 제목 D",
      author: "[예시] 저자 D",
      publisher: "[예시] 출판사",
      pubDate: new Date("2020-06-01"),
      priceStandard: 48000,
      priceSales: 43200,
      description: "[예시] 책 소개 문구입니다.",
      isSeed: true,
    },
  ];

  for (const book of books) {
    await prisma.book.upsert({
      where: { isbn13: book.isbn13 },
      update: book,
      create: book,
    });
  }

  // 데모 사용자 4명: 실제 Google 로그인 계정과 무관한 시드 전용 사용자.
  // "이서연"은 마이페이지 데모, "독서가A/B/C"는 책 상세 커뮤니티 리뷰 데모용.
  const users = [
    { id: "seed-user-main", name: "[예시] 이서연", email: "seed-main@lexicon.example" },
    { id: "seed-user-a", name: "[예시] 독서가A", email: "seed-a@lexicon.example" },
    { id: "seed-user-b", name: "[예시] 독서가B", email: "seed-b@lexicon.example" },
    { id: "seed-user-c", name: "[예시] 독서가C", email: "seed-c@lexicon.example" },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }

  // 태그 프리셋 — 실제 서비스에서 쓰일 문구(픽션 아님, 선택 옵션 라벨)
  const tagPresets = ["소장필요", "밑줄용", "영화나오면"];
  const tagIdByLabel = new Map<string, string>();
  for (const label of tagPresets) {
    const tag = await prisma.tag.upsert({
      where: { label },
      update: {},
      create: { label },
    });
    tagIdByLabel.set(label, tag.id);
  }

  const reviews: {
    id: string;
    userId: string;
    bookId: string;
    rating: number;
    shortReview: string;
    body: string;
    finishedAt: Date;
    channel: "PAPER" | "EBOOK" | "AUDIOBOOK" | null;
    originStory: string | null;
    visibility: "PUBLIC" | "PRIVATE";
    tags: string[];
  }[] = [
    // 책상세(_2) 커뮤니티 리뷰 목록 데모 — 모두 도서 A에 대한 리뷰
    {
      id: "seed-review-a1",
      userId: "seed-user-a",
      bookId: "9788900000001",
      rating: 4,
      shortReview: "간결한데 깊게 남는 책",
      body: "문체가 매우 간결하면서도 깊은 울림을 줍니다. 도서관에서 우연히 발견해서 읽었는데, 올해 읽은 책 중 단연 최고입니다. 특히 중반부의 전개는 전혀 예상하지 못했어요. 추천합니다.",
      finishedAt: new Date("2023-10-27"),
      channel: "PAPER",
      originStory: "[예시] 2023년 가을 어느 날, 동네 도서관 신간 코너에서 우연히 발견했다.",
      visibility: "PUBLIC",
      tags: ["소장필요"],
    },
    {
      id: "seed-review-a2",
      userId: "seed-user-b",
      bookId: "9788900000001",
      rating: 4,
      shortReview: "번역이 매끄러워서 술술 읽힘",
      body: "소장 가치가 충분한 책입니다. 전자책으로 먼저 읽고 너무 좋아서 종이책으로 다시 구매했어요. 번역도 매끄럽고 만듦새도 훌륭합니다.",
      finishedAt: new Date("2023-10-25"),
      channel: "EBOOK",
      originStory: null,
      visibility: "PUBLIC",
      tags: ["소장필요", "밑줄용"],
    },
    {
      id: "seed-review-a3",
      userId: "seed-user-c",
      bookId: "9788900000001",
      rating: 3,
      shortReview: "가볍게 읽기 좋았음",
      body: "오디오북으로 들었습니다. 가볍게 듣기 좋은 내용이었어요. 후반부 결말이 조금 아쉽지만 전반적으로 흥미로운 주제를 다루고 있습니다.",
      finishedAt: new Date("2023-10-20"),
      channel: "AUDIOBOOK",
      originStory: null,
      visibility: "PUBLIC",
      tags: [],
    },
    // 마이페이지(_1) 타임라인 데모 — "이서연" 본인 리뷰 3건, 채널이 서로 다름
    {
      id: "seed-review-main1",
      userId: "seed-user-main",
      bookId: "9788900000002",
      rating: 4,
      shortReview: "[예시] 문고리 하나도 다시 보게 됨",
      body: "[예시] 사용성의 기본을 다시 생각하게 해주는 책입니다. 문고리 하나 보는 시각이 달라졌어요.",
      finishedAt: new Date("2023-10-27"),
      channel: "PAPER",
      originStory: "[예시] 2023년 어느 날 을지로 헌책방에서 눈에 띄어 집어들었다.",
      visibility: "PUBLIC",
      tags: ["밑줄용"],
    },
    {
      id: "seed-review-main2",
      userId: "seed-user-main",
      bookId: "9788900000003",
      rating: 5,
      shortReview: "[예시] 행동경제학 입문으로 최고",
      body: "[예시] 다소 두껍지만 그만큼 얻는 게 많은 책입니다. 행동경제학 통찰이 실생활에도 그대로 적용돼요.",
      finishedAt: new Date("2023-10-15"),
      channel: "EBOOK",
      originStory: null,
      visibility: "PRIVATE", // 비공개 리뷰 예시 — 커뮤니티 목록엔 안 보이고 마이페이지에만 노출
      tags: ["영화나오면"],
    },
    {
      id: "seed-review-main3",
      userId: "seed-user-main",
      bookId: "9788900000004",
      rating: 3,
      shortReview: "[예시] 개념 정리엔 좋지만 다소 건조함",
      body: "[예시] 다소 건조하지만 복잡한 디지털 시스템을 정리하는 기본기는 탄탄한 책입니다.",
      finishedAt: new Date("2023-09-18"),
      channel: "PAPER",
      originStory: null,
      visibility: "PUBLIC",
      tags: [],
    },
  ];

  for (const review of reviews) {
    const { tags, ...data } = review;
    await prisma.review.upsert({
      where: { id: review.id },
      update: data,
      create: data,
    });

    // 리뷰-태그 연결을 항상 최신 상태로 맞춘다(재시드 시 중복 방지).
    await prisma.reviewTag.deleteMany({ where: { reviewId: review.id } });
    for (const label of tags) {
      const tagId = tagIdByLabel.get(label);
      if (!tagId) continue;
      await prisma.reviewTag.create({ data: { reviewId: review.id, tagId } });
      await prisma.tag.update({ where: { id: tagId }, data: { usageCount: { increment: 1 } } });
    }
  }

  console.log("시드 데이터 생성 완료");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

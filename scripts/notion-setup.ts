// 1회성 셋업 스크립트: 리뷰 동기화용 Notion 데이터베이스(+데이터소스)를 생성한다.
// Notion API 2025-09-03부터 속성 스키마는 데이터베이스가 아니라 그 안의 "데이터소스"에
// 붙는다. 우리가 실제로 쓰는(query/create page) ID는 데이터베이스 ID가 아니라
// 데이터소스 ID이므로, 이 스크립트가 최종적으로 출력하는 값도 데이터소스 ID다.
// 사용법: npx tsx scripts/notion-setup.ts <부모 페이지 ID>
import { Client } from "@notionhq/client";
import { NOTION_PROPERTIES, CHANNEL_LABELS, VISIBILITY_LABELS } from "../src/lib/notion-schema";

async function main() {
  const parentPageId = process.argv[2];
  if (!parentPageId) {
    console.error("사용법: npx tsx scripts/notion-setup.ts <부모 페이지 ID>");
    process.exit(1);
  }

  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    console.error("NOTION_API_KEY가 설정되지 않았습니다. .env.local을 확인하세요.");
    process.exit(1);
  }

  const notion = new Client({ auth: apiKey });

  const database = await notion.databases.create({
    parent: { type: "page_id", page_id: parentPageId },
    title: [{ type: "text", text: { content: "책결 독서 리뷰" } }],
  });

  const dataSource = await notion.dataSources.create({
    parent: { database_id: database.id },
    title: [{ type: "text", text: { content: "리뷰" } }],
    properties: {
      [NOTION_PROPERTIES.title]: { title: {} },
      [NOTION_PROPERTIES.author]: { rich_text: {} },
      [NOTION_PROPERTIES.isbn13]: { rich_text: {} },
      [NOTION_PROPERTIES.rating]: { number: {} },
      [NOTION_PROPERTIES.shortReview]: { rich_text: {} },
      [NOTION_PROPERTIES.body]: { rich_text: {} },
      [NOTION_PROPERTIES.channel]: {
        select: {
          options: Object.values(CHANNEL_LABELS).map((name) => ({ name })),
        },
      },
      [NOTION_PROPERTIES.originStory]: { rich_text: {} },
      [NOTION_PROPERTIES.finishedAt]: { date: {} },
      [NOTION_PROPERTIES.visibility]: {
        select: {
          options: Object.values(VISIBILITY_LABELS).map((name) => ({ name })),
        },
      },
      [NOTION_PROPERTIES.tags]: { multi_select: {} },
      [NOTION_PROPERTIES.reviewId]: { rich_text: {} },
    },
  });

  console.log("데이터베이스 생성 완료!");
  console.log("아래 값을 .env.local의 NOTION_DATABASE_ID에 붙여넣으세요:");
  console.log(dataSource.id);
}

main().catch((error) => {
  console.error("데이터베이스 생성 실패:", error instanceof Error ? error.message : error);
  process.exit(1);
});

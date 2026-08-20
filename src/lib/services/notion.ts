import "server-only";
import { Client } from "@notionhq/client";
import { prisma } from "@/lib/prisma";
import { getBookDetailService } from "@/lib/services/books";
import {
  NOTION_PROPERTIES,
  CHANNEL_LABELS,
  CHANNEL_BY_LABEL,
  VISIBILITY_LABELS,
} from "@/lib/notion-schema";

function getClient(): Client {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    throw new Error(
      "NOTION_API_KEY가 설정되지 않았습니다. .env.local과 scripts/notion-setup.ts 안내를 확인하세요.",
    );
  }
  return new Client({ auth: apiKey });
}

// scripts/notion-setup.ts가 출력하는 값은 데이터베이스 ID가 아니라 그 안의
// "데이터소스" ID다(Notion API 2025-09-03부터 속성 스키마·쿼리·페이지 생성 모두
// 데이터소스 기준). 환경변수 이름은 사용자에게 익숙한 NOTION_DATABASE_ID를 유지한다.
function getDataSourceId(): string {
  const dataSourceId = process.env.NOTION_DATABASE_ID;
  if (!dataSourceId) {
    throw new Error(
      "NOTION_DATABASE_ID가 설정되지 않았습니다. scripts/notion-setup.ts로 데이터베이스를 먼저 만드세요.",
    );
  }
  return dataSourceId;
}

// rich_text 필터로 매칭되는 Notion 응답 페이지의 최소 형태.
type NotionPage = {
  id: string;
  properties: Record<string, unknown>;
};

function richText(text: string) {
  return { rich_text: [{ type: "text" as const, text: { content: text.slice(0, 2000) } }] };
}

function getRichTextValue(properties: Record<string, unknown>, key: string): string {
  const prop = properties[key] as { rich_text?: { plain_text?: string }[] } | undefined;
  return prop?.rich_text?.map((t) => t.plain_text ?? "").join("") ?? "";
}

function getTitleValue(properties: Record<string, unknown>, key: string): string {
  const prop = properties[key] as { title?: { plain_text?: string }[] } | undefined;
  return prop?.title?.map((t) => t.plain_text ?? "").join("") ?? "";
}

function getNumberValue(properties: Record<string, unknown>, key: string): number | null {
  const prop = properties[key] as { number?: number | null } | undefined;
  return prop?.number ?? null;
}

function getSelectValue(properties: Record<string, unknown>, key: string): string | null {
  const prop = properties[key] as { select?: { name?: string } | null } | undefined;
  return prop?.select?.name ?? null;
}

function getDateValue(properties: Record<string, unknown>, key: string): string | null {
  const prop = properties[key] as { date?: { start?: string } | null } | undefined;
  return prop?.date?.start ?? null;
}

function getMultiSelectValue(properties: Record<string, unknown>, key: string): string[] {
  const prop = properties[key] as { multi_select?: { name?: string }[] } | undefined;
  return prop?.multi_select?.map((option) => option.name ?? "").filter((name) => name.length > 0) ?? [];
}

export interface ExportSummary {
  created: number;
  updated: number;
}

// 사용자의 리뷰 전체를 Notion 데이터베이스에 반영한다. ChaekgyeolReviewId로 기존 페이지를
// 찾아 있으면 업데이트, 없으면 새로 만든다(반복 실행해도 중복 생성되지 않음).
export async function exportReviewsToNotion(userId: string): Promise<ExportSummary> {
  const notion = getClient();
  const dataSourceId = getDataSourceId();

  const reviews = await prisma.review.findMany({
    where: { userId },
    include: { book: true, tags: { include: { tag: true } } },
    orderBy: { finishedAt: "desc" },
  });

  let created = 0;
  let updated = 0;

  for (const review of reviews) {
    const existing = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        property: NOTION_PROPERTIES.reviewId,
        rich_text: { equals: review.id },
      },
    });

    const properties = {
      [NOTION_PROPERTIES.title]: {
        title: [{ type: "text" as const, text: { content: review.book.title } }],
      },
      [NOTION_PROPERTIES.author]: richText(review.book.author ?? ""),
      [NOTION_PROPERTIES.isbn13]: richText(review.book.isbn13),
      [NOTION_PROPERTIES.rating]: { number: review.rating },
      [NOTION_PROPERTIES.shortReview]: richText(review.shortReview ?? ""),
      [NOTION_PROPERTIES.body]: richText(review.body),
      [NOTION_PROPERTIES.channel]: {
        select: review.channel ? { name: CHANNEL_LABELS[review.channel] } : null,
      },
      [NOTION_PROPERTIES.originStory]: richText(review.originStory ?? ""),
      [NOTION_PROPERTIES.finishedAt]: {
        date: { start: review.finishedAt.toISOString().slice(0, 10) },
      },
      [NOTION_PROPERTIES.visibility]: {
        select: { name: VISIBILITY_LABELS[review.visibility] },
      },
      [NOTION_PROPERTIES.tags]: {
        multi_select: review.tags.map((rt) => ({ name: rt.tag.label })),
      },
      [NOTION_PROPERTIES.reviewId]: richText(review.id),
    };

    if (existing.results.length > 0) {
      await notion.pages.update({ page_id: existing.results[0].id, properties });
      updated += 1;
    } else {
      await notion.pages.create({
        parent: { type: "data_source_id", data_source_id: dataSourceId },
        properties,
      });
      created += 1;
    }
  }

  return { created, updated };
}

export interface ImportSummary {
  created: number;
  skipped: number;
  failed: number;
}

// Notion 데이터베이스의 행을 읽어와 아직 없는 리뷰만 새로 만든다.
// ChaekgyeolReviewId가 있는 행(=우리가 내보낸 행)은 건드리지 않고, 사용자가 Notion에서
// 직접 추가한 행(ISBN13 필수)만 새 리뷰로 들여온다.
export async function importReviewsFromNotion(userId: string): Promise<ImportSummary> {
  const notion = getClient();
  const dataSourceId = getDataSourceId();

  const existingReviewIds = new Set(
    (await prisma.review.findMany({ where: { userId }, select: { id: true } })).map((r) => r.id),
  );

  let created = 0;
  let skipped = 0;
  let failed = 0;
  let cursor: string | undefined;

  do {
    const page = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
    });

    for (const result of page.results as unknown as NotionPage[]) {
      const reviewId = getRichTextValue(result.properties, NOTION_PROPERTIES.reviewId);
      if (reviewId && existingReviewIds.has(reviewId)) {
        skipped += 1;
        continue;
      }

      const isbn13 = getRichTextValue(result.properties, NOTION_PROPERTIES.isbn13).trim();
      const channelLabel = getSelectValue(result.properties, NOTION_PROPERTIES.channel);
      const finishedAt = getDateValue(result.properties, NOTION_PROPERTIES.finishedAt);
      // 채널은 선택 사항이라 라벨이 없으면 null(미기재)로 둔다.
      const channel = channelLabel ? (CHANNEL_BY_LABEL[channelLabel] ?? null) : null;

      if (!isbn13 || !finishedAt) {
        failed += 1;
        continue;
      }

      const { book } = await getBookDetailService(isbn13);
      const title = getTitleValue(result.properties, NOTION_PROPERTIES.title);
      const resolvedBook =
        book ??
        (await prisma.book.upsert({
          where: { isbn13 },
          update: {},
          create: {
            isbn13,
            title: title || `[가져옴] ${isbn13}`,
            author: getRichTextValue(result.properties, NOTION_PROPERTIES.author) || null,
          },
        }));

      const visibilityLabel = getSelectValue(result.properties, NOTION_PROPERTIES.visibility);
      const visibility = visibilityLabel === VISIBILITY_LABELS.PRIVATE ? "PRIVATE" : "PUBLIC";

      const tagLabels = getMultiSelectValue(result.properties, NOTION_PROPERTIES.tags);
      const tagIds: string[] = [];
      for (const label of tagLabels) {
        const tag = await prisma.tag.upsert({
          where: { label },
          update: { usageCount: { increment: 1 } },
          create: { label, usageCount: 1 },
        });
        tagIds.push(tag.id);
      }

      await prisma.review.create({
        data: {
          userId,
          bookId: resolvedBook.isbn13,
          rating: getNumberValue(result.properties, NOTION_PROPERTIES.rating),
          body: getRichTextValue(result.properties, NOTION_PROPERTIES.body) || "(내용 없음)",
          shortReview: getRichTextValue(result.properties, NOTION_PROPERTIES.shortReview) || null,
          finishedAt: new Date(finishedAt),
          channel,
          originStory: getRichTextValue(result.properties, NOTION_PROPERTIES.originStory) || null,
          visibility,
          tags: { create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })) },
        },
      });
      created += 1;
    }

    cursor = page.has_more ? (page.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return { created, skipped, failed };
}

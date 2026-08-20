import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { excerpt: { findUnique: vi.fn() } },
}));

vi.mock("@/lib/share-card/render", () => ({
  renderExcerptCardPng: vi.fn(async () => ({
    headers: new Headers({ "content-type": "image/png" }),
  })),
}));

import { prisma } from "@/lib/prisma";
import { renderExcerptCardPng } from "@/lib/share-card/render";
import { GET } from "../route";

const findUnique = vi.mocked(prisma.excerpt.findUnique);
const renderMock = vi.mocked(renderExcerptCardPng);

beforeEach(() => {
  vi.clearAllMocks();
});

function makeRequest(url: string) {
  return { url } as unknown as Parameters<typeof GET>[0];
}

describe("GET /api/share-card/excerpt/[excerptId]", () => {
  it("비공개 리뷰의 발췌는 렌더하지 않고 404를 반환한다", async () => {
    findUnique.mockResolvedValue({
      id: "excerpt-1",
      quote: "문장",
      pageLabel: null,
      review: { visibility: "PRIVATE", book: { title: "책", author: null } },
    } as never);

    const response = await GET(makeRequest("http://localhost/api/share-card/excerpt/excerpt-1"), {
      params: Promise.resolve({ excerptId: "excerpt-1" }),
    });

    expect(response.status).toBe(404);
    expect(renderMock).not.toHaveBeenCalled();
  });

  it("존재하지 않는 발췌도 렌더하지 않고 404를 반환한다", async () => {
    findUnique.mockResolvedValue(null);

    const response = await GET(makeRequest("http://localhost/api/share-card/excerpt/missing"), {
      params: Promise.resolve({ excerptId: "missing" }),
    });

    expect(response.status).toBe(404);
    expect(renderMock).not.toHaveBeenCalled();
  });

  it("공개 리뷰의 발췌는 렌더 함수를 호출한다", async () => {
    findUnique.mockResolvedValue({
      id: "excerpt-1",
      quote: "문장",
      pageLabel: "p.10",
      review: { visibility: "PUBLIC", book: { title: "책", author: "저자" } },
    } as never);

    const response = await GET(makeRequest("http://localhost/api/share-card/excerpt/excerpt-1?theme=navy"), {
      params: Promise.resolve({ excerptId: "excerpt-1" }),
    });

    expect(renderMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledWith(
      { bookTitle: "책", author: "저자", pageLabel: "p.10", quote: "문장" },
      expect.objectContaining({ id: "navy" }),
      expect.any(Object),
    );
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=300");
  });
});

import { Header } from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HistoryTimeline } from "./HistoryTimeline";

export default async function HistoryPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [reviews, user] = await Promise.all([
    userId
      ? prisma.review.findMany({
          where: { userId },
          include: {
            book: true,
            tags: { include: { tag: true } },
            excerpts: { orderBy: { order: "asc" } },
          },
          orderBy: { finishedAt: "desc" },
        })
      : Promise.resolve([]),
    userId ? prisma.user.findUnique({ where: { id: userId } }) : Promise.resolve(null),
  ]);

  return (
    <>
      <Header title="나의 독서 기록" />
      <main className="flex flex-col relative w-full pt-header-safe pb-24 px-margin-mobile bg-background min-h-screen">
        <div className="flex flex-col w-full gap-stack-lg pb-margin-mobile">
          <div className="flex items-center gap-stack-md px-unit pt-unit">
            <div className="relative w-16 h-16 rounded-full shadow-md overflow-hidden shrink-0 border-2 border-surface-container-lowest bg-surface-container-high flex items-center justify-center">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt="프로필"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant text-[28px]">
                  person
                </span>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="font-headline-md text-headline-md text-on-background tracking-tight">
                {user?.displayName ?? session?.user?.name ?? "게스트"}
              </h1>
              <span className="font-body-md text-body-md text-on-surface-variant mt-1">
                {reviews.length}건의 기록
              </span>
            </div>
          </div>

          <HistoryTimeline
            reviews={reviews.map((review) => ({
              ...review,
              tags: review.tags.map((rt) => rt.tag.label),
              excerpts: review.excerpts.map((e) => ({
                id: e.id,
                quote: e.quote,
                pageLabel: e.pageLabel,
                comment: e.comment,
              })),
            }))}
          />
        </div>
      </main>
    </>
  );
}

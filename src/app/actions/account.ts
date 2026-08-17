"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-guard";

// User를 지우면 Account/Session/Review/ReviewLike가 스키마의 onDelete: Cascade로
// 함께 정리된다(Book은 다른 사용자의 리뷰가 참조할 수 있으므로 남겨둠).
export async function deleteAccount() {
  const userId = await requireUserId();
  await prisma.user.delete({ where: { id: userId } });
}

export async function updateDisplayName(name: string) {
  const userId = await requireUserId();
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 30) {
    throw new Error("닉네임은 1~30자로 입력해주세요.");
  }

  await prisma.user.update({ where: { id: userId }, data: { displayName: trimmed } });

  revalidatePath("/settings");
  revalidatePath("/history");
}

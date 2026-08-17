"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth-guard";
import { exportReviewsToNotion, importReviewsFromNotion } from "@/lib/services/notion";

export async function exportReviewsAction() {
  const userId = await requireUserId();
  return exportReviewsToNotion(userId);
}

export async function importReviewsAction() {
  const userId = await requireUserId();
  const result = await importReviewsFromNotion(userId);
  revalidatePath("/history");
  return result;
}

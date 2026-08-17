import { Header } from "@/components/layout/Header";
import { getTagPresets } from "@/app/actions/reviews";
import { BookPickerAndForm } from "./BookPickerAndForm";

export default async function NewReviewPage() {
  const presets = await getTagPresets();

  return (
    <>
      <Header title="리뷰 작성" variant="back" backHref="/" />
      <main className="flex flex-col relative w-full pt-16 bg-background min-h-screen p-margin-mobile">
        <BookPickerAndForm presets={presets} />
      </main>
    </>
  );
}

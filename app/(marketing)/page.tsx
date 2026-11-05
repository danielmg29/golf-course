import { CoursePreview } from "@/features/hole/CoursePreview";
import { env } from "@/lib/env";
import { getModelPage } from "@/lib/server-queries";

export default async function Home() {
  const { rows } = await getModelPage("hole");

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <CoursePreview title={env.NEXT_PUBLIC_APP_NAME} holes={rows} />
    </main>
  );
}

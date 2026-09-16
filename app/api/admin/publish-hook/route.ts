import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { submitToIndexNow } from "@/lib/indexnow";

export async function POST(request: Request) {
  try {
    const { url, category } = await request.json();

    // 1. Invalidate caches for homepage and category
    revalidatePath("/", "layout");
    revalidatePath("/(home)", "page");
    if (category) {
      revalidatePath(`/${category}`, "page");
    }

    // 2. Ping IndexNow if a URL is provided
    // IMPORTANT: fetch MUST be awaited here.
    // Vercel terminates the serverless function immediately after NextResponse.json() is returned.
    if (url) {
      await submitToIndexNow(url);
    }

    return NextResponse.json({ success: true, revalidated: true });
  } catch (error) {
    console.error("Publish hook error:", error);
    // Return 200 anyway so we don't break the admin UI if cache invalidation fails
    return NextResponse.json({ success: false, error: "Hook failed" }, { status: 200 });
  }
}

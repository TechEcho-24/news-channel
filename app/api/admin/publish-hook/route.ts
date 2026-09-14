import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bharatnewsbulletin.com";
const INDEXNOW_KEY = "bnb-indexnow-7a3b9c2d1e5f4a8b";

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
    if (url) {
      const fullUrl = `${SITE_URL}${url}`;
      
      const indexNowPayload = {
        host: new URL(SITE_URL).hostname,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: [fullUrl]
      };

      // Non-blocking IndexNow ping
      fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(indexNowPayload)
      }).catch(err => console.error("IndexNow Ping failed:", err));
    }

    return NextResponse.json({ success: true, revalidated: true });
  } catch (error) {
    console.error("Publish hook error:", error);
    // Return 200 anyway so we don't break the admin UI if cache invalidation fails
    return NextResponse.json({ success: false, error: "Hook failed" }, { status: 200 });
  }
}

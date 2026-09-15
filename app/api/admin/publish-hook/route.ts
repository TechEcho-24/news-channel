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
    // IMPORTANT: fetch MUST be awaited here.
    // Vercel terminates the serverless function immediately after NextResponse.json() is returned.
    // A fire-and-forget (non-awaited) fetch is killed mid-flight on Vercel — the IndexNow
    // request never completes. Awaiting ensures the request finishes before the function exits.
    if (url) {
      const fullUrl = `${SITE_URL}${url}`;

      const indexNowPayload = {
        host: new URL(SITE_URL).hostname,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: [fullUrl],
      };

      try {
        console.log(`[IndexNow] Submitting: ${fullUrl}`);

        const indexNowRes = await fetch("https://api.indexnow.org/indexnow", {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: JSON.stringify(indexNowPayload),
        });

        if (indexNowRes.ok) {
          console.log(`[IndexNow] Success: ${fullUrl} — HTTP ${indexNowRes.status}`);
        } else {
          const body = await indexNowRes.text().catch(() => "");
          console.error(`[IndexNow] Failed: HTTP ${indexNowRes.status} — ${body}`);
        }
      } catch (indexNowErr: any) {
        // IndexNow failure must NOT prevent publishing from returning success
        console.error(`[IndexNow] Network error: ${indexNowErr.message}`);
      }
    }

    return NextResponse.json({ success: true, revalidated: true });
  } catch (error) {
    console.error("Publish hook error:", error);
    // Return 200 anyway so we don't break the admin UI if cache invalidation fails
    return NextResponse.json({ success: false, error: "Hook failed" }, { status: 200 });
  }
}

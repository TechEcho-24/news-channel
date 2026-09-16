import { NextResponse } from "next/server";
import { submitToIndexNow } from "@/lib/indexnow";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    // 1. Secure the endpoint using Supabase Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json({ error: "Invalid payload, expected array of urls" }, { status: 400 });
    }

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bharatnewsbulletin.com";
    const allowedHostname = new URL(SITE_URL).hostname;

    // Validate URLs
    const validUrls = urls.filter(u => {
      try {
        const parsed = new URL(u, SITE_URL); // allow relative
        return parsed.hostname === allowedHostname;
      } catch {
        return false;
      }
    });

    if (validUrls.length === 0) {
      return NextResponse.json({ error: "No valid URLs for this domain provided." }, { status: 400 });
    }

    const success = await submitToIndexNow(validUrls);

    if (success) {
      return NextResponse.json({ success: true, submittedCount: validUrls.length });
    } else {
      return NextResponse.json({ success: false, error: "IndexNow submission failed" }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

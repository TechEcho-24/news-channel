import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// service_role bypasses RLS — safe because this is a server-side API route
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("subscribers")
      .select("id, email, preferences, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Subscribers API] Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    console.error("[Subscribers API] Unexpected:", err.message);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

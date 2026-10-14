import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { articleId } = await request.json();
    if (!articleId) {
      return NextResponse.json({ error: "Missing articleId" }, { status: 400 });
    }

    // 1. Try atomic RPC increment
    const { error: rpcError } = await supabaseAdmin.rpc("increment_impressions", {
      row_id: articleId,
    });

    if (rpcError) {
      // 2. Fallback direct update via service role (bypasses RLS)
      const { data: art } = await supabaseAdmin
        .from("articles")
        .select("impressions")
        .eq("id", articleId)
        .single();

      if (art) {
        const current = (art as any).impressions || 0;
        await supabaseAdmin
          .from("articles")
          .update({ impressions: current + 1 })
          .eq("id", articleId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("View increment error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

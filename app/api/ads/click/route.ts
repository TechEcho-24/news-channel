import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { adId } = await request.json();
    if (!adId) return NextResponse.json({ error: "Missing adId" }, { status: 400 });

    // 1. Increment total clicks on ads table
    const { error: rpcError } = await supabaseAdmin.rpc("increment_ad_click", { ad_id: adId });
    if (rpcError) {
      const { data: ad } = await supabaseAdmin.from("ads").select("clicks").eq("id", adId).single();
      if (ad) {
        const current = (ad as any).clicks || 0;
        await supabaseAdmin.from("ads").update({ clicks: current + 1 }).eq("id", adId);
      }
    }

    // 2. Track in ad_daily_stats for daily chart
    const today = new Date().toISOString().split("T")[0];
    const { error: dailyRpcError } = await supabaseAdmin.rpc("record_daily_ad_click", { 
      p_ad_id: adId,
      p_date: today 
    });

    if (dailyRpcError) {
      // Fallback manual upsert into ad_daily_stats
      const { data: existing } = await supabaseAdmin
        .from("ad_daily_stats")
        .select("id, clicks")
        .eq("ad_id", adId)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin
          .from("ad_daily_stats")
          .update({ clicks: (existing.clicks || 0) + 1 })
          .eq("id", existing.id);
      } else {
        await supabaseAdmin
          .from("ad_daily_stats")
          .insert({ ad_id: adId, date: today, impressions: 0, clicks: 1 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

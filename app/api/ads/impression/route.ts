import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { adId } = await request.json();
    if (!adId) return NextResponse.json({ error: "Missing adId" }, { status: 400 });

    // 1. Increment total impressions by +1 on ads table
    const { error: rpcError } = await supabaseAdmin.rpc("increment_ad_impression", { ad_id: adId });
    if (rpcError) {
      const { data: ad } = await supabaseAdmin.from("ads").select("impressions").eq("id", adId).single();
      if (ad) {
        const current = (ad as any).impressions || 0;
        await supabaseAdmin.from("ads").update({ impressions: current + 1 }).eq("id", adId);
      }
    }

    // 2. Track in ad_daily_stats for daily chart (+1)
    const today = new Date().toISOString().split("T")[0];
    const { error: dailyRpcError } = await supabaseAdmin.rpc("record_daily_ad_impression", { 
      p_ad_id: adId,
      p_date: today 
    });

    if (dailyRpcError) {
      const { data: existing } = await supabaseAdmin
        .from("ad_daily_stats")
        .select("id, impressions")
        .eq("ad_id", adId)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin
          .from("ad_daily_stats")
          .update({ impressions: (existing.impressions || 0) + 1 })
          .eq("id", existing.id);
      } else {
        await supabaseAdmin
          .from("ad_daily_stats")
          .insert({ ad_id: adId, date: today, impressions: 1, clicks: 0 });
      }
    }

    return NextResponse.json({ success: true, added: 1 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

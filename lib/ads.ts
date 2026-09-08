import { supabase } from "@/lib/supabase";

export type AdSlotType = "leaderboard" | "sidebar" | "in_article" | "homepage_hero" | "footer" | "nav_top";

export type Ad = {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  slot: AdSlotType;
  cta_text?: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

export async function getActiveAd(slot: AdSlotType): Promise<Ad | null> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("ads")
    .select("*")
    .eq("slot", slot)
    .eq("is_active", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as Ad;
}

export async function getAllAds(): Promise<Ad[]> {
  const { data, error } = await supabase
    .from("ads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Ad[];
}

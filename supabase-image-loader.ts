export default function supabaseLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Local images (jaise logo) ko direct return karein bina kisi CDN ke
  if (src.startsWith("/")) {
    return src;
  }

  // Supabase (ya kisi bhi external) images ko wsrv.nl ke through compress aur resize karein
  const encodedUrl = encodeURIComponent(src);
  return `https://wsrv.nl/?url=${encodedUrl}&w=${width}&q=${quality || 75}&output=webp`;
}

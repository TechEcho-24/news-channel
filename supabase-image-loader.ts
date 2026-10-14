export default function supabaseLoader({
  src,
}: {
  src: string;
  width?: number;
  quality?: number;
}) {
  // Return the original image URL directly so Google Discover and crawlers
  // can index high-resolution publisher images without external proxy/canonical issues.
  return src;
}


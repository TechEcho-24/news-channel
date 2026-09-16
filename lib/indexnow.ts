export async function submitToIndexNow(urls: string | string[]) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bharatnewsbulletin.com";
  const INDEXNOW_KEY = process.env.INDEXNOW_KEY;

  if (!INDEXNOW_KEY) {
    console.error("[IndexNow] INDEXNOW_KEY is not configured.");
    return false;
  }

  const urlList = Array.isArray(urls) ? urls : [urls];
  
  if (urlList.length === 0) return false;

  const fullUrls = urlList.map(url => {
    if (url.startsWith("http")) return url;
    return `${SITE_URL}${url.startsWith("/") ? url : "/" + url}`;
  });

  const payload = {
    host: new URL(SITE_URL).hostname,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: fullUrls,
  };

  try {
    console.log(`[IndexNow] Submitting: ${fullUrls.join(", ")}`);
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log(`[IndexNow] Submitted successfully. HTTP ${res.status}`);
      return true;
    } else {
      const errorText = await res.text().catch(() => "");
      console.error(`[IndexNow] Submission failed. HTTP ${res.status} - ${errorText}`);
      return false;
    }
  } catch (err: any) {
    console.error(`[IndexNow] Network error: ${err.message}`);
    return false;
  }
}

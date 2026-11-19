const HOST = "readymyfile.vercel.app";
const KEY = "8f4e2b9a1c7d3e6f0a5b8c2d4e7f9a1b";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_INDEX = `https://${HOST}/sitemap-index.xml`;

async function extractLocs(xmlUrl) {
  const res = await fetch(xmlUrl);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
}

async function run() {
  console.log("Fetching sitemaps...");
  const childSitemaps = await extractLocs(SITEMAP_INDEX);
  const allUrls = [];

  for (const sm of childSitemaps) {
    const urls = await extractLocs(sm);
    allUrls.push(...urls);
  }

  console.log(`Found ${allUrls.length} URLs. Pushing to IndexNow in batches of 1,000...`);

  for (let i = 0; i < allUrls.length; i += 1000) {
    const batch = allUrls.slice(i, i + 1000);
    const response = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: KEY_LOCATION,
        urlList: batch,
      }),
    });
    console.log(`Batch ${i / 1000 + 1} (${batch.length} URLs) -> HTTP ${response.status}`);
  }
}

run().catch(console.error);

const fs = require("fs");
const path = require("path");

const SITE_URL = "https://www.waleedgad.com";
const OUTPUT = "sitemap.xml";

/* Folders & files to ignore */
const EXCLUDED = new Set([
  "assets",
  "img",
  "css",
  "js",
  "json",
  "node_modules",
  ".git",
  ".github",
  "test",
  "scripts"
]);

const urls = [];

/* Walk folders recursively */
function walk(dir, baseUrl = "") {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    if (EXCLUDED.has(item.name)) continue;

    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      const indexFile = path.join(fullPath, "index.html");

      if (fs.existsSync(indexFile)) {
        const urlPath = `${baseUrl}/${item.name}`.replace(/\/+/g, "/");
        urls.push(`${SITE_URL}${urlPath}/`);
      }

      walk(fullPath, `${baseUrl}/${item.name}`);
    }
  }
}

/* Homepage */
urls.push(`${SITE_URL}/`);

/* Start scan */
walk(process.cwd());

/* Build XML */
const today = new Date().toISOString().split("T")[0];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...new Set(urls)]
  .map(
    (url) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url === SITE_URL + "/" ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("")}
</urlset>`;

fs.writeFileSync(OUTPUT, xml.trim());

console.log(`✅ Sitemap generated: ${OUTPUT}`);
console.log(`🔗 URLs included: ${urls.length}`);
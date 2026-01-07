const fs = require("fs");
const path = require("path");

const SITE_URL = "https://www.waleedgad.com";
const OUTPUT = "sitemap.xml";

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

const urls = new Set();

/* Priority & changefreq rules */
function metaFor(url) {
  if (url === "/") return { priority: "1.0", freq: "weekly" };
  if (url.startsWith("/services")) return { priority: "0.9", freq: "monthly" };
  if (url === "/portfolio/") return { priority: "0.8", freq: "weekly" };
  if (url.startsWith("/portfolio/")) return { priority: "0.7", freq: "monthly" };
  if (url === "/virtual-tours/") return { priority: "0.8", freq: "weekly" };
  if (url.startsWith("/virtual-tours/")) return { priority: "0.7", freq: "monthly" };
  return { priority: "0.6", freq: "monthly" };
}

/* Walk folders */
function walk(dir, baseUrl = "") {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    if (EXCLUDED.has(item.name)) continue;

    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      const indexFile = path.join(fullPath, "index.html");

      if (fs.existsSync(indexFile)) {
        const urlPath = `${baseUrl}/${item.name}/`.replace(/\/+/g, "/");
        urls.add(urlPath);
      }

      walk(fullPath, `${baseUrl}/${item.name}`);
    }
  }
}

/* Add homepage explicitly */
urls.add("/");

/* Scan project */
walk(process.cwd());

const today = new Date().toISOString().split("T")[0];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...urls]
  .map((pathUrl) => {
    const { priority, freq } = metaFor(pathUrl);
    return `
  <url>
    <loc>${SITE_URL}${pathUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join("")}
</urlset>`;

fs.writeFileSync(OUTPUT, xml.trim());

console.log(`✅ Sitemap generated: ${OUTPUT}`);
console.log(`🔗 URLs included: ${urls.size}`);
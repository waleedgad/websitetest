const fs = require("fs");
const path = require("path");

const ROOT = "assets/img/photography";
const OUTPUT = path.join(ROOT, "gallery.json");

if (!fs.existsSync(ROOT)) {
  console.error("❌ Photography folder not found:", ROOT);
  process.exit(1);
}

const projects = [];

const folders = fs.readdirSync(ROOT).filter((f) =>
  fs.statSync(path.join(ROOT, f)).isDirectory()
);

for (const folder of folders) {
  const folderPath = path.join(ROOT, folder);
  const metaPath = path.join(folderPath, "_meta.json");

  if (!fs.existsSync(metaPath)) {
    console.warn(`⚠️ Missing _meta.json in ${folder}, skipping`);
    continue;
  }

  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  } catch {
    console.warn(`⚠️ Invalid _meta.json in ${folder}, skipping`);
    continue;
  }

  if (!Array.isArray(meta.categories) || meta.categories.length === 0) {
    console.warn(`⚠️ No categories in ${folder}, skipping`);
    continue;
  }

  const images = fs
    .readdirSync(folderPath)
    .filter(
      (f) =>
        /\.(jpg|jpeg|png|webp)$/i.test(f) &&
        f !== meta.cover &&
        f !== "_meta.json"
    );

  projects.push({
    id: folder.toLowerCase().replace(/\s+/g, "-"),
    title: meta.title,
    categories: [meta.categories[0]], // ✅ FILTER CATEGORY ONLY
    allCategories: meta.categories,   // 🧠 keep full data
    path: `${ROOT}/${folder}/`,
    cover: meta.cover,
    images,
    location: meta.location || "",
    date: meta.date || "",
    description: meta.description || "",
    order: meta.order
  });
}

projects.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

fs.writeFileSync(OUTPUT, JSON.stringify({ projects }, null, 2));
console.log(`✅ gallery.json generated (${projects.length} projects)`);

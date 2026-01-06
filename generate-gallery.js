const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");

/* -------------------------------------------------------
   PATHS
------------------------------------------------------- */

// Filesystem path (Node.js)
const FS_ROOT = path.join(__dirname, "assets", "img", "photography");

// Browser URL base (root-relative)
const URL_ROOT = "/assets/img/photography";

// Output file
const OUTPUT = path.join(FS_ROOT, "gallery.json");

// Flags
const WATCH = process.argv.includes("--watch");

/* -------------------------------------------------------
   SAFETY CHECK
------------------------------------------------------- */
if (!fs.existsSync(FS_ROOT)) {
  console.error("❌ Photography folder not found:", FS_ROOT);
  process.exit(1);
}

let debounceTimer = null;

/* -------------------------------------------------------
   BUILD GALLERY
------------------------------------------------------- */
function buildGallery() {
  const projects = [];

  const folders = fs
    .readdirSync(FS_ROOT)
    .filter((f) => fs.statSync(path.join(FS_ROOT, f)).isDirectory());

  for (const folder of folders) {
    const folderPath = path.join(FS_ROOT, folder);
    const metaPath = path.join(folderPath, "_meta.json");

    if (!fs.existsSync(metaPath)) continue;

    let meta;
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    } catch {
      console.warn(`⚠️ Invalid _meta.json in ${folder}, skipping`);
      continue;
    }

    if (!Array.isArray(meta.categories) || !meta.categories.length) continue;

    // 🔑 READ ALL IMAGES
    const allImages = fs
      .readdirSync(folderPath)
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

    if (!allImages.length) continue;

    // 🔑 COVER FIRST
    const images = meta.cover
      ? [
          meta.cover,
          ...allImages.filter((img) => img !== meta.cover)
        ]
      : allImages;

    // 🔑 URL-safe folder name (KEEP FOLDER AS-IS)
    const urlFolder = encodeURIComponent(folder);

    projects.push({
      // ID can still be slug-like internally
      id: folder.toLowerCase().replace(/\s+/g, "-"),

      title: meta.title,
      categories: [meta.categories[0]],
      allCategories: meta.categories,

      // ✅ URL-safe, root-relative path
      path: `${URL_ROOT}/${urlFolder}/`,

      cover: meta.cover || images[0],
      images,
      location: meta.location || "",
      date: meta.date || "",
      description: meta.description || "",
      order: meta.order ?? null
    });
  }

  // Sort by order
  projects.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  fs.writeFileSync(OUTPUT, JSON.stringify({ projects }, null, 2));
  console.log(`✅ gallery.json generated (${projects.length} projects)`);
}

/* -------------------------------------------------------
   DEBOUNCE
------------------------------------------------------- */
function debounceBuild() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(buildGallery, 300);
}

/* -------------------------------------------------------
   INITIAL BUILD
------------------------------------------------------- */
buildGallery();

/* -------------------------------------------------------
   WATCH MODE
------------------------------------------------------- */
if (WATCH) {
  console.log("👀 Watch mode enabled…");

  fs.watch(FS_ROOT, { recursive: true }, (event, filename) => {
    if (!filename) return;

    if (
      filename.endsWith(".jpg") ||
      filename.endsWith(".jpeg") ||
      filename.endsWith(".png") ||
      filename.endsWith(".webp") ||
      filename.endsWith("_meta.json")
    ) {
      debounceBuild();
    }
  });
}
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const ROOT = "assets/img/photography";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 🔴 Global exit handler
const ask = (q) =>
  new Promise((resolve) => {
    rl.question(q, (a) => {
      const trimmed = a.trim();
      const lower = trimmed.toLowerCase();
      if (["exit", "quit", "q"].includes(lower)) {
        console.log("\n👋 Exited. No further changes were made.\n");
        rl.close();
        process.exit(0);
      }
      resolve(trimmed);
    });
  });

async function run() {
  if (!fs.existsSync(ROOT)) {
    console.error("❌ Photography folder not found:", ROOT);
    process.exit(1);
  }

  while (true) {
    const folders = fs
      .readdirSync(ROOT)
      .filter((f) => fs.statSync(path.join(ROOT, f)).isDirectory());

    if (!folders.length) {
      console.log("⚠️ No project folders found.");
      break;
    }

    console.log("\n📁 Found project folders:\n");
    folders.forEach((f, i) => console.log(`${i + 1}) ${f}`));

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:
• all        → update all folders
• 1,3,5      → update selected folders
• exit       → quit anytime
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    const input = await ask("Which folders do you want to update? ");

    let selectedFolders = [];

    if (input.toLowerCase() === "all") {
      selectedFolders = folders;
    } else {
      const indexes = input
        .split(",")
        .map((n) => parseInt(n.trim(), 10))
        .filter((n) => !isNaN(n) && n >= 1 && n <= folders.length);

      selectedFolders = indexes.map((i) => folders[i - 1]);
    }

    if (!selectedFolders.length) {
      console.log("❌ No valid selection.");
      continue;
    }

    console.log("\n✅ Updating:\n", selectedFolders.join(", "), "\n");

    /* =====================================================
       UPDATE MENU (NUMERIC)
       ===================================================== */

    console.log(`
What do you want to update?

0) All
1) Title
2) Categories
3) Cover
4) Meta (location / date / description)
5) Order
6) Gallery Group (merge)
7) Sync (files only)

Example: 1,6
`);

    const updateInput = await ask("Choose options: ");

    const choices = updateInput
      ? updateInput.split(",").map((c) => c.trim())
      : ["0"];

    const wants = (n) => choices.includes("0") || choices.includes(n);

    /* =====================================================
       BATCH PROMPTS (ASK ONCE)
       ===================================================== */

    let batchTitle = null;
    let batchCategories = null;
    let batchGroup = null;
    let batchMeta = {};
    let batchOrder = null;

    if (wants("1")) {
      batchTitle = await ask("Title (enter = keep current): ");
    }

    if (wants("2")) {
      const c = await ask(
        "Categories (comma separated, FIRST is filter): "
      );
      batchCategories = c
        ? c.split(",").map((x) => x.trim()).filter(Boolean)
        : null;
    }

    if (wants("6")) {
      batchGroup = await ask(
        "Gallery Group (optional — same value = merged gallery): "
      );
    }

    if (wants("4")) {
      batchMeta.location = await ask("Location (optional): ");
      batchMeta.date = await ask("Date / Year (optional): ");
      batchMeta.description = await ask("Description (optional): ");
    }

    if (wants("5")) {
      const o = await ask("Order (number, optional): ");
      batchOrder = o !== "" ? Number(o) : null;
    }

    /* =====================================================
       APPLY TO EACH FOLDER
       ===================================================== */

    for (const folder of selectedFolders) {
      const folderPath = path.join(ROOT, folder);
      const metaPath = path.join(folderPath, "_meta.json");

      console.log(`\n📁 ${folder}`);

      if (!fs.existsSync(metaPath)) {
        console.log("⚠️ No _meta.json found. Skipping.");
        continue;
      }

      let meta;
      try {
        meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
      } catch {
        console.log("❌ Invalid _meta.json. Skipping.");
        continue;
      }

      const images = fs
        .readdirSync(folderPath)
        .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

      if (!images.length) {
        console.log("⚠️ No images found. Skipping.");
        continue;
      }

      // 🔁 SYNC ONLY
      if (wants("7")) {
        const oldCover = meta.cover;
        const newCover =
          images.find((f) => f.toLowerCase().includes("cover")) ||
          images[0];

        meta.cover = newCover;

        console.log(
          `🔁 Cover synced: ${oldCover || "none"} → ${newCover}`
        );

        fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
        continue;
      }

      if (wants("1") && batchTitle !== null) {
        meta.title = batchTitle || meta.title || folder;
      }

      if (wants("2") && batchCategories) {
        meta.categories = batchCategories;
      }

      if (!meta.categories?.length) {
        console.log("⚠️ At least ONE category required. Skipping.");
        continue;
      }

      if (wants("6")) {
        meta.gallery_group =
          batchGroup !== null ? batchGroup : meta.gallery_group || "";
      }

      if (wants("4")) {
        meta.location = batchMeta.location || meta.location || "";
        meta.date = batchMeta.date || meta.date || "";
        meta.description =
          batchMeta.description || meta.description || "";
      }

      if (wants("5")) {
        meta.order =
          batchOrder !== null ? batchOrder : meta.order ?? null;
      }

      if (wants("3")) {
        console.log("\n🖼 Images:");
        images.forEach((img, i) => console.log(`${i + 1}) ${img}`));

        console.log(`\n⭐ Current cover: ${meta.cover || "none"}`);

        const coverInput = await ask(
          "Choose cover image number (enter = keep current / auto): "
        );

        const idx = parseInt(coverInput, 10);

        if (!isNaN(idx) && images[idx - 1]) {
          meta.cover = images[idx - 1];
        } else if (!meta.cover || !images.includes(meta.cover)) {
          meta.cover =
            images.find((f) => f.toLowerCase().includes("cover")) ||
            images[0];
        }
      }

      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
      console.log("✅ _meta.json written");
    }

    const nextAction = await ask(
      "\nDo you want to do something else? (continue / restart / exit): "
    );

    if (nextAction.toLowerCase() === "restart") continue;
    if (nextAction.toLowerCase() === "exit") break;
  }

  rl.close();
  console.log("\n👋 Done. Goodbye!\n");
}

run();
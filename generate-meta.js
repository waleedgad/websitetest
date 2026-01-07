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

      const updateInput = await ask(
        "What do you want to update? (all, title, categories, cover, meta, order, sync): "
      );

      const updateFields = updateInput
        ? updateInput.toLowerCase().split(",").map((f) => f.trim())
        : ["all"];

      const wants = (field) =>
        updateFields.includes("all") || updateFields.includes(field);

      // 🔁 SYNC MODE (FILES ONLY)
      if (wants("sync")) {
        const oldCover = meta.cover;

        if (oldCover && images.includes(oldCover)) {
          console.log("✔ Cover still valid:", oldCover);
        } else {
          const newCover =
            images.find((f) => f.toLowerCase().includes("cover")) ||
            images[0];

          meta.cover = newCover;

          console.log(
            `🔁 Cover synced: ${oldCover || "none"} → ${newCover}`
          );
        }

        fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
        console.log("✅ _meta.json synced");
        continue;
      }

      // NORMAL FLOW (unchanged behavior)
      if (wants("title")) {
        meta.title =
          (await ask("Title (enter = keep): ")) || meta.title || folder;
      }

      if (wants("categories")) {
        const categoriesInput =
          (await ask("Categories (comma separated, FIRST is filter): ")) ||
          (meta.categories || []).join(", ");

        meta.categories = categoriesInput
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
      }

      if (!meta.categories?.length) {
        console.log("⚠️ At least ONE category required. Skipping.");
        continue;
      }

      if (wants("meta")) {
        meta.location =
          (await ask("Location (optional): ")) || meta.location || "";
        meta.date = (await ask("Date / Year (optional): ")) || meta.date || "";
        meta.description =
          (await ask("Description (optional): ")) ||
          meta.description ||
          "";
      }

      if (wants("order")) {
        const o = await ask("Order (number, optional): ");
        meta.order = o !== "" ? Number(o) : meta.order ?? null;
      }

      if (wants("cover")) {
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
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const ROOT = "assets/img/photography";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (q) =>
  new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));

(async () => {
  if (!fs.existsSync(ROOT)) {
    console.error("❌ Photography folder not found:", ROOT);
    process.exit(1);
  }

  const folders = fs
    .readdirSync(ROOT)
    .filter((f) => fs.statSync(path.join(ROOT, f)).isDirectory());

  if (!folders.length) {
    console.log("⚠️ No project folders found.");
    process.exit(0);
  }

  console.log("\n📁 Found project folders:\n");
  folders.forEach((f, i) => {
    console.log(`${i + 1}) ${f}`);
  });

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:
• all        → update all folders
• 1,3,5      → update selected folders
• (enter)    → cancel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  const input = await ask("Which folders do you want to update? ");

  if (!input) {
    console.log("❌ Cancelled. No changes made.");
    rl.close();
    process.exit(0);
  }

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
    rl.close();
    process.exit(0);
  }

  console.log("\n✅ Updating:\n", selectedFolders.join(", "), "\n");

  for (const folder of selectedFolders) {
    const folderPath = path.join(ROOT, folder);
    const metaPath = path.join(folderPath, "_meta.json");

    console.log(`\n📁 ${folder}`);
    console.log("👉 FIRST category = filter category\n");

    const title = (await ask("Title (enter = folder name): ")) || folder;

    const categoriesInput = await ask(
      "Categories (comma separated, FIRST is filter): "
    );

    const categories = categoriesInput
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    if (!categories.length) {
      console.log("⚠️ At least ONE category required. Skipping.");
      continue;
    }

    const location = await ask("Location (optional): ");
    const date = await ask("Date / Year (optional): ");
    const description = await ask("Description (optional): ");
    const orderInput = await ask("Order (number, optional): ");

    const images = fs
      .readdirSync(folderPath)
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

    const cover =
      images.find((f) => f.toLowerCase().includes("cover")) ||
      images[0] ||
      "";

    const meta = {
      title,
      categories,
      location,
      date,
      description,
      cover,
      order: orderInput ? Number(orderInput) : null
    };

    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    console.log("✅ _meta.json written");
  }

  rl.close();
  console.log("\n🎉 Done. Run generate-gallery.js when ready.\n");
})();
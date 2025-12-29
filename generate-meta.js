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

  const folders = fs.readdirSync(ROOT).filter((f) =>
    fs.statSync(path.join(ROOT, f)).isDirectory()
  );

  for (const folder of folders) {
    const folderPath = path.join(ROOT, folder);
    const metaPath = path.join(folderPath, "_meta.json");

    console.log(`\n📁 Project folder: ${folder}`);
    console.log("👉 FIRST category = filter category\n");

    const title = (await ask("Title (enter to use folder name): ")) || folder;

    const categoriesInput = await ask(
      "Categories (comma separated, FIRST is filter): "
    );
    const categories = categoriesInput
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    if (!categories.length) {
      console.log("⚠️ At least ONE category is required. Skipping.\n");
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
      categories, // order matters
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
})();

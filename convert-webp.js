/**
 * Interactive WebP Converter
 * Place this file in your project root
 * Run: node convert-to-webp.js
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const readline = require("readline");

// Supported image extensions (non-WebP)
const VALID_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".tiff",
  ".avif"
];

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper: ask question
function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

// Recursive folder walker
async function walk(dir) {
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await walk(fullPath);
      continue;
    }

    const ext = path.extname(entry).toLowerCase();

    // Skip WebP files
    if (ext === ".webp") continue;

    // Skip unsupported files
    if (!VALID_EXTENSIONS.includes(ext)) continue;

    const webpPath = fullPath.replace(ext, ".webp");

    // Skip if WebP already exists
    if (fs.existsSync(webpPath)) {
      console.log(`⏭️  Skipped (WebP exists): ${webpPath}`);
      continue;
    }

    try {
      await sharp(fullPath)
        .webp({
          quality: 82,   // good balance: quality vs size
          effort: 6      // max compression effort
        })
        .toFile(webpPath);

      // Delete original ONLY after success
      fs.unlinkSync(fullPath);

      console.log(`✅ Converted & deleted: ${fullPath}`);
    } catch (err) {
      console.error(`❌ Failed: ${fullPath}`);
      console.error(err.message);
    }
  }
}

// Main execution
(async () => {
  try {
    console.log("\n🖼️  WebP Gallery Converter\n");

    const input = await ask(
      "📁 Enter folder path to convert (relative or absolute): "
    );

    const targetDir = path.resolve(input.trim());

    if (!fs.existsSync(targetDir)) {
      console.error("\n❌ Folder does not exist.");
      rl.close();
      process.exit(1);
    }

    if (!fs.statSync(targetDir).isDirectory()) {
      console.error("\n❌ Path is not a folder.");
      rl.close();
      process.exit(1);
    }

    const confirm = await ask(
      `\n⚠️  WARNING:\n` +
      `This will convert images to WebP and DELETE originals inside:\n` +
      `${targetDir}\n\n` +
      `Type YES to continue: `
    );

    if (confirm.trim().toLowerCase() !== "yes") {
      console.log("\n❌ Operation cancelled.");
      rl.close();
      process.exit(0);
    }

    console.log("\n🚀 Starting conversion...\n");

    await walk(targetDir);

    console.log("\n🎉 Conversion complete.");
    rl.close();
  } catch (err) {
    console.error("\n❌ Unexpected error:", err);
    rl.close();
    process.exit(1);
  }
})();
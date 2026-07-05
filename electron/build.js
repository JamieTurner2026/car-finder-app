const { packager } = require("@electron/packager");
const path = require("path");
const fs = require("fs");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "dist-electron");

async function build() {
  console.log("Packaging Electron app...");

  const appPaths = await packager({
    dir: __dirname,
    name: "Car Finder",
    platform: "win32",
    arch: "x64",
    out: OUT,
    overwrite: true,
    icon: null,
    ignore: [/node_modules[\\/]electron$/, /build\.js$/],
  });

  const appOut = appPaths[0];
  const resourcesDest = path.join(appOut, "resources");

  console.log(`Packaged to: ${appOut}`);
  console.log("Copying backend resources...");

  copyDir(
    path.join(ROOT, "backend"),
    path.join(resourcesDest, "backend"),
    ["node_modules/.cache"]
  );

  console.log("Copying frontend build...");
  copyDir(
    path.join(ROOT, "frontend", "dist"),
    path.join(resourcesDest, "frontend", "dist")
  );

  console.log("\nDone! Run the app from:");
  console.log(`  ${path.join(appOut, "Car Finder.exe")}`);
}

function copyDir(src, dest, skipPatterns = []) {
  if (!fs.existsSync(src)) {
    console.warn(`  Skipping missing dir: ${src}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const skip = skipPatterns.some((p) =>
      typeof p === "string" ? entry === p : p.test(entry)
    );
    if (skip) continue;
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath, skipPatterns);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});

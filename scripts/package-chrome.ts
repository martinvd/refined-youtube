import { readdir, readFile, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(rootDir, "dist");
const chromeDir = resolve(distDir, "chrome");

try {
  await readdir(chromeDir);
} catch {
  console.error("dist/chrome directory not found. Run `bun run build` first.");
  process.exit(1);
}

const packageJson = JSON.parse(await readFile(resolve(rootDir, "package.json"), "utf8")) as {
  version: string;
};
const archiveName = `refined-youtube-${packageJson.version}.zip`;
const archivePath = resolve(distDir, archiveName);

await rm(archivePath, { force: true });

const zip = Bun.spawn(["zip", "-r", archivePath, "."], {
  cwd: chromeDir,
  stdout: "inherit",
  stderr: "inherit",
});

const exitCode = await zip.exited;

if (exitCode !== 0) {
  process.exit(exitCode);
}

console.log(`Created dist/${archiveName}`);

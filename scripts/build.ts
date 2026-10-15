import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type Manifest = Record<string, unknown>;

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(rootDir, "dist");
const packageJson = JSON.parse(await readFile(resolve(rootDir, "package.json"), "utf8")) as {
  version: string;
};
const baseManifest = JSON.parse(
  await readFile(resolve(rootDir, "public/manifest.json"), "utf8"),
) as Manifest;

const targets: Record<string, Manifest> = {
  chrome: {
    background: { service_worker: "background.js" },
  },
  firefox: {
    background: { scripts: ["background.js"] },
    browser_specific_settings: {
      gecko: {
        id: "refined-youtube@martinvd",
        strict_min_version: "142.0",
        data_collection_permissions: {
          required: ["none"],
        },
      },
    },
  },
};

await rm(distDir, { recursive: true, force: true });

for (const [target, overrides] of Object.entries(targets)) {
  const targetDir = resolve(distDir, target);

  await mkdir(targetDir, { recursive: true });
  await writeFile(
    resolve(targetDir, "manifest.json"),
    `${JSON.stringify({ ...baseManifest, ...overrides, version: packageJson.version }, null, 2)}\n`,
  );
  await cp(resolve(rootDir, "public/options.html"), resolve(targetDir, "options.html"));

  const result = await Bun.build({
    entrypoints: [
      resolve(rootDir, "src/background.ts"),
      resolve(rootDir, "src/content.ts"),
      resolve(rootDir, "src/options.ts"),
    ],
    outdir: targetDir,
    target: "browser",
    format: "iife",
    naming: "[dir]/[name].[ext]",
  });

  if (!result.success) {
    for (const log of result.logs) {
      console.error(log);
    }

    process.exit(1);
  }
}

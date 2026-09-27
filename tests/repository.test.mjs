import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((item) =>
    item.isDirectory()
      ? walk(path.join(dir, item.name))
      : [path.join(dir, item.name)],
  );
const sources = walk(path.join(root, "src")).filter((name) =>
  /\.tsx?$/.test(name),
);
const requiredAssets = new Set();
for (const source of sources)
  for (const match of readFileSync(source, "utf8").matchAll(
    /require\(['"](\.[^'"]+)['"]\)/g,
  ))
    requiredAssets.add(path.resolve(path.dirname(source), match[1]));
requiredAssets.add(
  path.resolve(
    root,
    JSON.parse(readFileSync(path.join(root, "app.json"), "utf8")).expo.icon,
  ),
);

test("Every bundled bitmap resolves, is documented, and has its original checksum", () => {
  const manifest = JSON.parse(
    readFileSync(path.join(root, "docs/asset-manifest.json"), "utf8"),
  );
  const paths = new Set(manifest.map((item) => path.join(root, item.path)));
  for (const file of walk(path.join(root, "assets")))
    assert.ok(paths.has(file), `Missing provenance: ${file}`);
  for (const asset of manifest) {
    const file = path.join(root, asset.path);
    assert.ok(requiredAssets.has(file), `Unused runtime bitmap: ${asset.path}`);
    const bytes = readFileSync(file);
    assert.equal(bytes.length, asset.bytes);
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      asset.sha256,
      asset.path,
    );
  }
  for (const file of requiredAssets)
    assert.ok(existsSync(file), `Unresolved asset: ${file}`);
});
test("Cookbook route adapters resolve to independently organized screen implementations", () => {
  for (const cookbook of ["fable", "astra"])
    for (const [route, component] of [
      ["index", "Inbox"],
      ["chat/[id]", "Conversation"],
      ["compose", "Compose"],
      ["settings", "Settings"],
      ["photo", "Photo"],
    ]) {
      const file = path.join(root, "src/app", cookbook, `${route}.tsx`);
      const text = readFileSync(file, "utf8");
      assert.ok(text.includes(`cookbooks/${cookbook}/screens/${component}`));
      const target = /from ["']([^"']+)["']/.exec(text)[1];
      assert.ok(existsSync(path.resolve(path.dirname(file), `${target}.tsx`)));
    }
});
test("Runtime source excludes capture probes, workstation paths, and empty press handlers", () => {
  for (const file of sources) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(
      source,
      /EXPO_PUBLIC_(CAPTURE|PROFILE)|CaptureCadence|useMotionProbe|\/Users\/|onPress=\{\(\) => \{\}\}/,
      file,
    );
  }
});
test("Relative documentation links point to distributable files", () => {
  for (const file of [
    path.join(root, "README.md"),
    ...walk(path.join(root, "docs")).filter((name) => name.endsWith(".md")),
  ]) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/(?:src|srcset)=["'](\.[^"']+)["']/g))
      assert.ok(
        existsSync(path.resolve(path.dirname(file), match[1])),
        `${file}: ${match[1]}`,
      );
    for (const match of source.matchAll(/\]\((\.[^\s)#]+)(?:#[^)]*)?\)/g))
      assert.ok(
        existsSync(path.resolve(path.dirname(file), match[1])),
        `${file}: ${match[1]}`,
      );
  }
});

import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Exercise the actual Zustand stores. Only the native MMKV boundary and bitmap
// loader are replaced; reducers and persistence middleware run unchanged.
const root = path.resolve(import.meta.dirname, "..");
const cache = new Map();
const disks = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const require = createRequire(file);
  const localRequire = (id) => {
    if (id === "react-native-mmkv")
      return {
        createMMKV: ({ id }) => {
          if (!disks.has(id)) disks.set(id, new Map());
          const disk = disks.get(id);
          return {
            getString: (key) => disk.get(key),
            set: (key, value) => disk.set(key, value),
            remove: (key) => disk.delete(key),
          };
        },
      };
    if (id.startsWith(".")) {
      const resolved = path.resolve(path.dirname(file), id);
      if (/\.(png|jpe?g)$/.test(resolved)) return resolved;
      const source = [resolved, `${resolved}.ts`, `${resolved}.tsx`].find(
        existsSync,
      );
      if (source) return load(source);
    }
    return require(id);
  };
  const output = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  vm.runInThisContext(`(function(require,module,exports){${output}\n})`, {
    filename: file,
  })(localRequire, module, module.exports);
  return module.exports;
}
const { useChat: astra, initialMessages } = load(
  path.join(root, "src/cookbooks/astra/data.ts"),
);
const { useFable: fable } = load(
  path.join(root, "src/cookbooks/fable/data/store.ts"),
);

for (const [name, store, id, send] of [
  ["Astra", astra, "mira", (state, id, text) => state.send(id, text)],
  ["Fable", fable, "mara", (state, id, text) => state.append(id, text)],
]) {
  test(`${name}: blank and unknown-recipient submissions do not create threads`, () => {
    store.getState().reset();
    send(store.getState(), id, "   ");
    for (const invalid of [
      "missing-person",
      "constructor",
      "__proto__",
      "toString",
    ])
      send(store.getState(), invalid, "Hello");
    assert.deepEqual(store.getState().threads, {});
  });
  test(`${name}: two submissions in one millisecond have distinct IDs and retain the sample history`, () => {
    store.getState().reset();
    const clock = Date.now;
    Date.now = () => 12345;
    try {
      send(store.getState(), id, "First");
      send(store.getState(), id, "Second");
    } finally {
      Date.now = clock;
    }
    const messages = store.getState().threads[id];
    assert.ok(messages.length > 2);
    assert.equal(messages.at(-2).text, "First");
    assert.equal(messages.at(-1).text, "Second");
    assert.notEqual(messages.at(-2).id, messages.at(-1).id);
  });
  test(`${name}: reading twice is idempotent and reset preserves appearance`, () => {
    store.getState().markRead(id);
    const read = store.getState().read;
    store.getState().markRead(id);
    assert.equal(store.getState().read, read);
    store.getState().setTheme("dark");
    store.getState().reset();
    assert.deepEqual(store.getState().threads, {});
    assert.deepEqual(store.getState().read, []);
    assert.equal(store.getState().theme, "dark");
  });
}
test("Astra: reacting twice restores a sample message without mutating the sample", () => {
  const original = JSON.stringify(initialMessages("mira"));
  astra.getState().heart("mira", "m1");
  assert.equal(astra.getState().threads.mira[0].heart, true);
  astra.getState().heart("mira", "m1");
  assert.equal(astra.getState().threads.mira[0].heart, false);
  assert.equal(JSON.stringify(initialMessages("mira")), original);
});
test("Astra: unknown initial messages are empty and mute toggles independently", () => {
  assert.deepEqual(initialMessages("missing"), []);
  astra.getState().toggleMute("mira");
  assert.ok(astra.getState().muted.includes("mira"));
  astra.getState().toggleMute("mira");
  assert.ok(!astra.getState().muted.includes("mira"));
});
test("Cookbook persistence uses separate namespaces and survives store hydration", async () => {
  astra.getState().send("mira", "Astra only");
  fable.getState().append("mara", "Fable only");
  assert.equal(disks.size, 2);
  const astraDisk = disks.get("astra-local-v1").get("astra-state");
  const fableDisk = disks.get("fable-local-v1").get("fable-state");
  assert.ok(
    astraDisk.includes("Astra only") && !astraDisk.includes("Fable only"),
  );
  assert.ok(
    fableDisk.includes("Fable only") && !fableDisk.includes("Astra only"),
  );
  await astra.persist.rehydrate();
  await fable.persist.rehydrate();
  assert.equal(astra.getState().threads.mira.at(-1).text, "Astra only");
  assert.equal(fable.getState().threads.mara.at(-1).text, "Fable only");
});

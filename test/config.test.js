const assert = require("assert");
const path = require("path");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${e.message}`);
    failed++;
  }
}

// ──────────────────────────────────────────────────────────────
// 1. Config files load
// ──────────────────────────────────────────────────────────────
console.log("\nConfig loading");

test("index.js exports a valid config object", () => {
  const config = require("../index");
  assert.ok(typeof config === "object");
  assert.ok(Array.isArray(config.extends));
  assert.ok(typeof config.rules === "object");
});

test("react.js exports a valid config object", () => {
  const config = require("../react");
  assert.ok(typeof config === "object");
  assert.ok(Array.isArray(config.extends));
  assert.ok(config.settings && config.settings.react);
});

// ──────────────────────────────────────────────────────────────
// 2. v8 compatibility – no removed presets
// ──────────────────────────────────────────────────────────────
console.log("\nv8 compatibility");

// Need to clear the require cache so we get a fresh copy
delete require.cache[require.resolve("../index")];
const baseConfig = require("../index");

test("does NOT use removed recommended-requiring-type-checking", () => {
  assert.ok(
    !baseConfig.extends.includes(
      "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ),
    "recommended-requiring-type-checking was deleted in v8"
  );
});

test("uses recommended-type-checked (the v8 replacement)", () => {
  assert.ok(
    baseConfig.extends.includes("plugin:@typescript-eslint/recommended-type-checked")
  );
});

test("has parserOptions.projectService for type-checked rules", () => {
  assert.ok(
    baseConfig.parserOptions && baseConfig.parserOptions.projectService,
    "recommended-type-checked requires parserOptions.projectService"
  );
});

test("plugin:prettier/recommended is last in extends chain", () => {
  const last = baseConfig.extends[baseConfig.extends.length - 1];
  assert.strictEqual(
    last,
    "plugin:prettier/recommended",
    "prettier/recommended must come last to override formatting rules"
  );
});

// ──────────────────────────────────────────────────────────────
// 3. Custom rule overrides are preserved
// ──────────────────────────────────────────────────────────────
console.log("\nCustom rule overrides");

delete require.cache[require.resolve("../index")];
const rules = require("../index").rules;

test("no-var → error", () => {
  assert.strictEqual(rules["no-var"], "error");
});

test("prefer-const → warn", () => {
  assert.strictEqual(rules["prefer-const"], "warn");
});

test("@typescript-eslint/explicit-function-return-type preserved", () => {
  const r = rules["@typescript-eslint/explicit-function-return-type"];
  assert.ok(Array.isArray(r) && r[0] === "error" && r[1].allowExpressions === true);
});

test("@typescript-eslint/unbound-method → off", () => {
  assert.strictEqual(rules["@typescript-eslint/unbound-method"], "off");
});

test("@typescript-eslint/no-misused-promises override preserved", () => {
  const r = rules["@typescript-eslint/no-misused-promises"];
  assert.ok(Array.isArray(r) && r[1] && r[1].checksVoidReturn === false);
});

test("@typescript-eslint/no-use-before-define → warn", () => {
  assert.strictEqual(rules["@typescript-eslint/no-use-before-define"], "warn");
});

test("no-use-before-define core rule → off", () => {
  assert.strictEqual(rules["no-use-before-define"], "off");
});

// ──────────────────────────────────────────────────────────────
// 4. @typescript-eslint v8 rules exist
// ──────────────────────────────────────────────────────────────
console.log("\n@typescript-eslint v8 rule availability");

const plugin = require("@typescript-eslint/eslint-plugin");

for (const rule of [
  "no-require-imports",        // replaced no-var-requires
  "no-array-delete",           // new in v8
  "no-empty-object-type",      // replaced ban-types
  "no-unsafe-function-type",   // replaced ban-types
  "no-wrapper-object-types",   // replaced ban-types
  "only-throw-error",          // replaced no-throw-literal
  "no-unsafe-unary-minus",     // new in v8
]) {
  test(`@typescript-eslint/${rule} exists`, () => {
    assert.ok(plugin.rules[rule]);
  });
}

// ──────────────────────────────────────────────────────────────
// 5. React config checks
// ──────────────────────────────────────────────────────────────
console.log("\nReact config");

const reactConfig = require("../react");

test("extends react plugin", () => {
  assert.ok(reactConfig.extends.some((e) => e.includes("react/recommended")));
});

test("extends react-hooks plugin", () => {
  assert.ok(reactConfig.extends.some((e) => e.includes("react-hooks/recommended")));
});

test("react.version = detect", () => {
  assert.strictEqual(reactConfig.settings.react.version, "detect");
});

test("custom react rules preserved", () => {
  const rr = reactConfig.rules;
  assert.strictEqual(rr["react/no-typos"], "warn");
  assert.strictEqual(rr["react/jsx-handler-names"], "warn");
  assert.strictEqual(rr["react/jsx-pascal-case"], "warn");
});

// ──────────────────────────────────────────────────────────────
// 6. Peer deps = dev deps
// ──────────────────────────────────────────────────────────────
console.log("\nPackage.json consistency");

const pkg = require("../package.json");

test("peerDependencies match devDependencies versions", () => {
  for (const [key, peerVersion] of Object.entries(pkg.peerDependencies)) {
    const depVersion = pkg.devDependencies[key];
    assert.ok(depVersion, `${key} is missing from devDependencies`);
    const norm = (v) => v.replace(/[\^~]/g, "");
    assert.strictEqual(
      norm(peerVersion),
      norm(depVersion),
      `${key}: peer (${peerVersion}) ≠ dev (${depVersion})`
    );
  }
});

// ──────────────────────────────────────────────────────────────
// Results
// ──────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(50)}`);
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

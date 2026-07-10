import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const root = resolve(new URL("..", import.meta.url).pathname);
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

test("decorative prism is hidden from assistive technology", () => {
  const path = resolve(root, "components/marketing/prism-graphic.tsx");
  assert.equal(existsSync(path), true);
  assert.match(readFileSync(path, "utf8"), /aria-hidden="true"/);
});

test("motion and color tokens honor accessibility constraints", () => {
  const css = read("app/globals.css");
  assert.match(css, /--brand:\s*#1758d5/i);
  assert.match(css, /--muted:\s*#5b7088/i);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.reveal\s*\{[^}]*opacity:\s*1/s);
  assert.match(css, /\.reveal\[data-state="visible"\]/);
  assert.doesNotMatch(css, /animation:\s*[^;]*infinite/i);
});

test("marketing page exposes the approved Pharma Prism sections", () => {
  const source = read("components/marketing/marketing-page.tsx");
  for (const id of ["audiences", "solutions", "delivery", "scenarios", "about", "contact"]) {
    assert.match(source, new RegExp(`id=["']${id}["']`));
  }
  assert.match(source, /PrismGraphic/);
  assert.match(source, /让医药数字化/);
  assert.doesNotMatch(source, /Delivery console|88\s*-|index \* 14|榫合云/);
});

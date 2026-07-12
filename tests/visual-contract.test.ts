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
  const heroClaim = /让医药数字化，[\s\S]*落到真实业务里。/;
  for (const id of ["top", "audiences", "solutions", "delivery", "scenarios", "about", "contact"]) {
    assert.match(source, new RegExp(`id=["']${id}["']`));
  }
  for (const collection of [
    "navigation",
    "deliverables",
    "audiences",
    "solutions",
    "deliverySteps",
    "scenarios",
    "trustPrinciples",
  ]) {
    assert.match(source, new RegExp(`${collection}\\.map\\(`));
  }
  assert.match(source, /PrismGraphic/);
  assert.match(source, /<Reveal\b/);
  assert.match(source, /<LeadForm\s*\/>/);
  assert.match(source, /brand\.disclaimer/);
  assert.doesNotMatch("让医药数字化，<br />错误的后半句。", heroClaim);
  assert.match(source, heroClaim);
  assert.doesNotMatch(source, /Delivery console|88\s*-|index \* 14|榫合云/);
});

test("marketing capability claims defer to project contracts and acceptance results", () => {
  const source = read("components/marketing/marketing-page.tsx");

  assert.match(source, /这些是能力表达，不是认证标志；若具体项目不包含其中某项，以实际合同与方案为准。/);
  assert.match(source, /相关能力可按项目需求设计，具体措施以方案与验收结果为准。/);
  assert.match(source, /实际合同与方案/);
  assert.match(source, /验收结果/);
});

test("hero keeps each approved claim sentence on one line across target viewports", () => {
  const source = read("components/marketing/marketing-page.tsx");
  const css = read("app/globals.css");

  assert.match(source, /lg:grid-cols-\[7fr_5fr\]/);
  assert.doesNotMatch(source, /lg:grid-cols-\[1\.05fr_\.95fr\]/);
  assert.match(source, /px-4[^"\n]*sm:px-8[^"\n]*xl:px-\[max\(8vw,2rem\)\]/);
  assert.doesNotMatch(source, /lg:px-\[max\(8vw,2rem\)\]/);
  assert.match(source, /text-\[clamp\(2\.5rem,5vw,4\.75rem\)\]/);
  assert.match(source, /lg:text-\[clamp\(4rem,5vw,4\.75rem\)\]/);

  const heading = source.match(/<h1\b[\s\S]*?<\/h1>/)?.[0] ?? "";
  const claimLines = heading.match(/<span\b[^>]*className="[^"]*\bblock\b[^"]*\bwhitespace-nowrap\b[^"]*"[^>]*>/g) ?? [];
  assert.equal(claimLines.length, 2);
  assert.match(heading, />\s*让医药数字化，\s*<\/span>/);
  assert.match(heading, />\s*落到真实业务里。\s*<\/span>/);
  assert.doesNotMatch(heading, /<br\s*\/>/);
  assert.match(css, /\.prism-graphic\s*\{[^}]*width:\s*min\(100%,\s*470px\)/s);
});

test("delivery steps remain a readable single column until the large breakpoint", () => {
  const source = read("components/marketing/marketing-page.tsx");
  const deliveryStepsBlock = source.match(/<div className="[^"]*">\s*\{deliverySteps\.map[\s\S]*?<\/div>/)?.[0] ?? "";

  assert.match(deliveryStepsBlock, /lg:grid-cols-4/);
  assert.doesNotMatch(deliveryStepsBlock, /md:grid-cols-4/);
  assert.match(deliveryStepsBlock, /border-b/);
  assert.match(deliveryStepsBlock, /lg:border-r/);
});

test("marketing links constrain motion to reduced-motion-safe transforms", () => {
  const source = read("components/marketing/marketing-page.tsx");
  const disallowedTransition = /\btransition-(?!(?:transform|opacity)\b)[^\s"'`]+/;
  for (const utility of ["transition-all", "transition-colors", "transition-shadow", "transition-filter"]) {
    assert.match(utility, disallowedTransition);
  }
  for (const utility of ["transition-transform", "transition-opacity"]) {
    assert.doesNotMatch(utility, disallowedTransition);
  }
  assert.match(source, /transition-transform/);
  assert.match(source, /motion-safe:hover:-translate-y-0\.5/);
  assert.doesNotMatch(source, /\btransition(?!-)\b/);
  assert.doesNotMatch(source, disallowedTransition);
  assert.doesNotMatch(source, /hover:brightness-/);
});

test("layered anchor reset allows link color utilities to win", () => {
  const css = read("app/globals.css");
  const source = read("components/marketing/marketing-page.tsx");

  assert.match(css, /@layer base\s*\{[\s\S]*?\ba\s*\{[^}]*color:\s*inherit;[^}]*text-decoration:\s*none;[^}]*\}[\s\S]*?\}/);
  assert.doesNotMatch(css, /^a\s*\{/m);
  assert.match(source, /const primaryLink\s*=\s*[\s\S]*?text-white/);
});

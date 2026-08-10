"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

for (const file of ["converter/index.html", "党項語藏文轉寫方案.html"]) {
  const html = fs.readFileSync(file, "utf8");
  const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/giu)];
  assert.ok(inlineScripts.length > 0, `${file} should contain its inline application script`);
  for (const [index, match] of inlineScripts.entries()) {
    assert.doesNotThrow(() => new vm.Script(match[1]), `${file} inline script ${index + 1} should compile`);
  }
}
const home = fs.readFileSync("converter/index.html", "utf8");
assert.doesNotMatch(home, /http-equiv="refresh"|location\.replace/u);
assert.match(home, /<script src="converter\.js\?v=tight-super-sa-20260811"><\/script>/u);
assert.match(home, /ShangguSans-Bold-core\.woff2\?v=shanggu-web-v1/u);
assert.match(home, /shanggu-web\.css\?v=shanggu-web-v1/u);
assert.doesNotMatch(home, /shanggu-web-manifest|webfont-loader|data-font-warmup/u);
assert.doesNotMatch(home, /ShangguSans-(?:Regular|Bold)\.woff2/u);
assert.match(home, /NotoSerifTibetan-Regular\.woff2\?v=full-20260810/u);
assert.match(home, /id="input"/u);
assert.match(home, /id="output"/u);
const scheme = fs.readFileSync("党項語藏文轉寫方案.html", "utf8");
assert.doesNotMatch(scheme, /id="converter-input"|src="converter\.js"/u);
assert.match(scheme, /\["w","ཨྭ"\]/u);
assert.doesNotMatch(scheme, /\["w","ཧྭ"\]/u);
assert.match(scheme, /-h<\/td><td>上加<span class="tibetan">ས<\/span><\/td><td>緊元音/u);
assert.doesNotMatch(scheme, /下加<span class="tibetan">ཧ<\/span><\/td><td>緊元音/u);
assert.match(scheme, /shanggu-web\.css\?v=shanggu-web-v1/u);
assert.doesNotMatch(scheme, /shanggu-web-manifest|webfont-loader|data-font-warmup/u);
assert.match(scheme, /rel="preload" href="fonts\/NotoSerifTangut-Page\.woff2\?v=tangut-page-20260810"[^>]*fetchpriority="high"/u);
assert.match(scheme, /font-family: "Noto Serif Tangut Page", "Noto Serif Tangut Full"/u);
assert.doesNotMatch(scheme, /ShangguSans-(?:Regular|Bold)\.woff2/u);

const root = fs.readFileSync("index.html", "utf8");
assert.match(root, /url=converter\//u);

console.log("ok - both HTML application scripts compiled");

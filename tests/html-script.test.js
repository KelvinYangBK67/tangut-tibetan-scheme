"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

for (const file of ["converter/index.html", "党項語藏文轉寫方案.html", "党項語藏文轉寫方案-en.html"]) {
  const html = fs.readFileSync(file, "utf8");
  const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/giu)];
  assert.ok(inlineScripts.length > 0, `${file} should contain its inline application script`);
  for (const [index, match] of inlineScripts.entries()) {
    assert.doesNotThrow(() => new vm.Script(match[1]), `${file} inline script ${index + 1} should compile`);
  }
}
const home = fs.readFileSync("converter/index.html", "utf8");
assert.doesNotMatch(home, /http-equiv="refresh"|location\.replace/u);
assert.match(home, /<script src="converter\.js\?v=ghc-rhyme-classes-20260811"><\/script>/u);
assert.match(home, /GX／勳拼 → 藏文/u);
assert.match(home, /GHC → 藏文/u);
assert.match(home, /id="preserve-rhyme-marker"/u);
assert.match(home, /ShangguSans-Bold-core\.woff2\?v=shanggu-web-v4/u);
assert.match(home, /shanggu-web\.css\?v=shanggu-web-v4/u);
assert.doesNotMatch(home, /shanggu-web-manifest|webfont-loader|data-font-warmup/u);
assert.doesNotMatch(home, /ShangguSans-(?:Regular|Bold)\.woff2/u);
assert.match(home, /NotoSerifTibetan-Regular\.woff2\?v=full-20260810/u);
assert.match(home, /id="input"/u);
assert.match(home, /id="output"/u);
const scheme = fs.readFileSync("党項語藏文轉寫方案.html", "utf8");
const schemeEn = fs.readFileSync("党項語藏文轉寫方案-en.html", "utf8");
assert.doesNotMatch(scheme, /id="converter-input"|src="converter\.js"/u);
assert.match(scheme, /\["w","ཨྭ"\]/u);
assert.doesNotMatch(scheme, /\["w","ཧྭ"\]/u);
assert.match(scheme, /-h<\/td><td>上加<span class="tibetan">ས<\/span><\/td><td>緊元音/u);
assert.doesNotMatch(scheme, /下加<span class="tibetan">ཧ<\/span><\/td><td>緊元音/u);
assert.match(scheme, /R\.100\|1\.92 𗂴\|2\.85 𗉕\|\(r- -ər\?\)\|འརྸྀ/u);
assert.match(scheme, /R\.101\|1\.93 𗹙\|2\.86 𗎫\|\(r- -er\?\)\|འརྸེ/u);
assert.doesNotMatch(scheme, /\|རྸ[ྀེ]\?/u);
assert.match(scheme, /<h3>段落測試<\/h3>/u);
assert.match(scheme, /shanggu-web\.css\?v=shanggu-web-v4/u);
assert.doesNotMatch(scheme, /shanggu-web-manifest|webfont-loader|data-font-warmup/u);
assert.match(scheme, /rel="preload" href="fonts\/NotoSerifTangut-Page\.woff2\?v=tangut-page-20260811"[^>]*fetchpriority="high"/u);
assert.match(scheme, /font-family: "Noto Serif Tangut Page", "Noto Serif Tangut Full"/u);
assert.doesNotMatch(scheme, /ShangguSans-(?:Regular|Bold)\.woff2/u);

const styleBlock = html => html.match(/<style>([\s\S]*?)<\/style>/u)?.[1];
const sectionIds = html => [...html.matchAll(/<section id="([^"]+)"/gu)].map(match => match[1]);
const rhymeRows = html => html.match(/^R\.\d+\|.*$/gmu) || [];
const scriptCharacters = html => (html.match(/[\u0F00-\u0FFF\u{17000}-\u{18DFF}]/gu) || []).join("");
const testAndInventory = html => html.slice(html.indexOf('<section id="tests">'));
const constantBody = (html, name) => html.match(new RegExp(`const ${name} = ([\\s\\S]*?);\\n`, "u"))?.[1];
assert.equal(styleBlock(schemeEn), styleBlock(scheme), "Chinese and English scheme CSS must be identical");
assert.deepEqual(sectionIds(schemeEn), sectionIds(scheme), "Chinese and English scheme sections must match");
assert.deepEqual(rhymeRows(schemeEn), rhymeRows(scheme), "Chinese and English R.1–105 data must match");
assert.equal(rhymeRows(schemeEn).length, 105, "English scheme must contain the complete rhyme inventory");
assert.equal(scriptCharacters(testAndInventory(schemeEn)), scriptCharacters(testAndInventory(scheme)), "Chinese and English tests and rhyme data must match");
assert.equal(constantBody(schemeEn, "words"), constantBody(scheme, "words"), "word tests must match exactly");
assert.equal(constantBody(schemeEn, "sentences"), constantBody(scheme, "sentences"), "sentence tests must match exactly");
assert.match(schemeEn, /<h3>Paragraph test<\/h3>/u);

const root = fs.readFileSync("index.html", "utf8");
assert.match(root, /url=converter\//u);

for (const file of ["党項語藏文轉寫方案-en.html", "ghc-comparison/index.html", "ghc-comparison/index-en.html"]) {
  assert.ok(fs.existsSync(file), `${file} should exist`);
  const html = fs.readFileSync(file, "utf8");
  assert.match(html, /converter\//u, `${file} should link the converter`);
}

const ghcZh = fs.readFileSync("ghc-comparison/index.html", "utf8");
const ghcEn = fs.readFileSync("ghc-comparison/index-en.html", "utf8");
assert.equal(styleBlock(ghcEn), styleBlock(ghcZh), "Chinese and English GHC CSS must be identical");
assert.equal((ghcEn.match(/<tr>/gu) || []).length, (ghcZh.match(/<tr>/gu) || []).length, "GHC table rows must match");
assert.equal(scriptCharacters(ghcEn), scriptCharacters(ghcZh), "Chinese and English GHC data must match");
assert.deepEqual([...ghcEn.matchAll(/<code>(.*?)<\/code>/gu)].map(match => match[1]), [...ghcZh.matchAll(/<code>(.*?)<\/code>/gu)].map(match => match[1]), "Chinese and English GHC values must match");

const texZh = fs.readFileSync("tex/main.tex", "utf8");
const texEn = fs.readFileSync("tex/main-en.tex", "utf8");
assert.match(texEn, /^\\documentclass\[12pt\]\{nextart\}$/mu);
assert.doesNotMatch(texEn, /nextart_zh/u);
assert.equal((texEn.match(/^R\.\d+ &/gmu) || []).length, 105, "English TeX must contain R.1–105");
assert.deepEqual(texEn.match(/^R\.\d+ &.*$/gmu), texZh.match(/^R\.\d+ &.*$/gmu), "Chinese and English TeX rhyme rows must match");
assert.equal(scriptCharacters(texEn.slice(texEn.indexOf("\\section{Spelling tests}"))), scriptCharacters(texZh.slice(texZh.indexOf("\\section{拼寫測試}"))), "Chinese and English TeX examples and rhyme data must match");
const ghcTexEn = fs.readFileSync("ghc-comparison/tex/main-en.tex", "utf8");
assert.match(ghcTexEn, /^\\documentclass\[12pt\]\{nextart\}$/mu);
assert.doesNotMatch(ghcTexEn, /nextart_zh/u);

console.log("ok - bilingual HTML/TeX structure, CSS, and complete data remain aligned");

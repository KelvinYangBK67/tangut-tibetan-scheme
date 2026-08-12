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
assert.match(home, /<script src="converter\.js\?v=revise-20260812"><\/script>/u);
assert.match(home, /id="direction-tangut"[^>]*aria-pressed="true"/u);
assert.match(home, /西夏文 → 藏文/u);
assert.match(home, /GX\/勳拼 → 藏文/u);
assert.match(home, /GHC → 藏文/u);
assert.match(home, /id="preserve-rhyme-marker"/u);
assert.match(home, /id="language"/u);
assert.match(home, /'zh-Hant': \{/u);
assert.match(home, /instructionsTitle: 'Instructions'/u);
assert.match(home, /instruction-punctuation/u);
assert.match(home, /instruction-tangut/u);
assert.match(home, /data\/tangut-tibetan\.csv\?v=revise-20260812/u);
assert.match(home, /Character reading remains unresolved/u);
assert.match(home, /The GX → Tibetan direction also accepts/u);
assert.match(home, /Sentence-final <code>/u);
assert.match(home, /For complex stacks containing/u);
assert.match(home, /ShangguSans-Bold-core\.woff2\?v=shanggu-web-v7/u);
assert.match(home, /shanggu-web\.css\?v=shanggu-web-v7/u);
assert.doesNotMatch(home, /shanggu-web-manifest|webfont-loader|data-font-warmup/u);
assert.doesNotMatch(home, /ShangguSans-(?:Regular|Bold)\.woff2/u);
assert.match(home, /NotoSerifTibetan-Regular\.woff2\?v=full-20260810/u);
assert.match(home, /NotoSerifTangut-Regular\.woff2\?v=full-20260810/u);
assert.match(home, /id="input"/u);
assert.match(home, /id="output"/u);

const elements = new Map([...home.matchAll(/id="([^"]+)"/gu)].map(match => [match[1], {
  value: "", textContent: "", innerHTML: "", href: "", hidden: false, checked: false,
  listeners: {}, classList: { toggle() {} }, setAttribute() {}, focus() {}, select() {},
  addEventListener(type, listener) { this.listeners[type] = listener; }
}]));
const metaDescription = { content: "" };
const converterContext = {
  GxTibetan: require("../converter/converter.js"),
  navigator: { language: "en-US", clipboard: { writeText: async () => {} } },
  localStorage: { getItem: () => "", setItem() {} },
  document: {
    title: "", documentElement: { lang: "" }, execCommand() {},
    querySelector(selector) { return selector === 'meta[name="description"]' ? metaDescription : elements.get(selector.slice(1)); }
  },
  setTimeout() {}
};
const converterInline = [...home.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/giu)].at(-1)[1];
new vm.Script(converterInline).runInNewContext(converterContext);
assert.equal(elements.get("page-title").textContent, "Tangut–Tibetan Converter");
assert.match(elements.get("instruction-tangut").innerHTML, /static <code>tangut,tibetan/u);
assert.match(elements.get("instruction-punctuation").innerHTML, /Sentence-final/u);
elements.get("language").listeners.change({ target: { value: "zh-Hant" } });
assert.equal(elements.get("page-title").textContent, "西夏文–藏文轉換器");
assert.match(elements.get("instruction-xunpin").innerHTML, /勳拼/u);

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
assert.doesNotMatch(scheme, /R\.\d+[^\n]*†/u, "GX rhyme inventory uncertainty must remain ? rather than †");
const schemeExamples = scheme.slice(scheme.indexOf('<section id="tests">'), scheme.indexOf('<section id="rhymes">'));
assert.doesNotMatch(schemeExamples, /ཝྭ|ྭྭ/u);
assert.match(scheme, /聲調存疑/u);
assert.match(scheme, /其他存疑/u);
assert.match(schemeEn, /uncertain tone/u);
assert.match(schemeEn, /other uncertainty/u);
assert.match(scheme, /<h3>段落測試<\/h3>/u);
assert.match(scheme, /shanggu-web\.css\?v=shanggu-web-v7/u);
assert.doesNotMatch(scheme, /shanggu-web-manifest|webfont-loader|data-font-warmup/u);
assert.match(scheme, /rel="preload" href="fonts\/NotoSerifTangut-Page\.woff2\?v=tangut-page-20260811"[^>]*fetchpriority="high"/u);
assert.match(scheme, /scheme\.css\?v=20260811/u);
assert.doesNotMatch(scheme, /ShangguSans-(?:Regular|Bold)\.woff2/u);
assert.doesNotMatch(scheme, /GX 自動轉換|rtś\\ər¹/u);

const sectionIds = html => [...html.matchAll(/<section id="([^"]+)"/gu)].map(match => match[1]);
const rhymeRows = html => html.match(/^R\.\d+\|.*$/gmu) || [];
const scriptCharacters = html => (html.match(/[\u0F00-\u0FFF\u{17000}-\u{18DFF}]/gu) || []).join("");
const testAndInventory = html => html.slice(html.indexOf('<section id="tests">'));
const constantBody = (html, name) => html.match(new RegExp(`const ${name} = ([\\s\\S]*?);\\n`, "u"))?.[1];
const conversionCore = require("../converter/converter.js");
const tangutTable = conversionCore.parseTangutCsv(fs.readFileSync("converter/data/tangut-tibetan.csv", "utf8"));
const parseConstant = (html, name) => vm.runInNewContext(`(${constantBody(html, name)})`);
assert.match(schemeEn, /scheme\.css\?v=20260811/u);
assert.doesNotMatch(scheme, /<style>/u);
assert.doesNotMatch(schemeEn, /<style>/u);
assert.deepEqual(sectionIds(schemeEn), sectionIds(scheme), "Chinese and English scheme sections must match");
assert.deepEqual(rhymeRows(schemeEn), rhymeRows(scheme), "Chinese and English R.1–105 data must match");
assert.equal(rhymeRows(schemeEn).length, 105, "English scheme must contain the complete rhyme inventory");
for (const row of [
  "R.3|1.03 𗔠|2.03 𘆶|-u|ཨཡུ",
  "R.11|1.11 𗣣|2.10 𘒇|-i|ཨཡི",
  "R.20|1.20 𘅄|2.17 𗾥|-a|ཨཡ",
  "R.31|1.30 𗝚|2.28 𗸹|-ə|ཨཡྀ",
  "R.37|1.36 𘒋|2.33 𗆎|-e|ཨཡེ",
  "R.47|1.46 𗪲||-iw|ཨཡིག༹"
]) {
  assert.ok(rhymeRows(scheme).includes(row), `${row.split("|")[0]} must retain the Grade-IV spelling`);
}
assert.equal(scriptCharacters(testAndInventory(schemeEn)), scriptCharacters(testAndInventory(scheme)), "Chinese and English tests and rhyme data must match");
assert.equal(constantBody(schemeEn, "words"), constantBody(scheme, "words"), "word tests must match exactly");
assert.equal(constantBody(schemeEn, "sentences"), constantBody(scheme, "sentences"), "sentence tests must match exactly");
for (const [tangut, , tibetan] of [...parseConstant(scheme, "words"), ...parseConstant(scheme, "sentences")]) {
  assert.equal(conversionCore.tangutToTibetan(tangut, tangutTable).output.trimEnd(), tibetan, `${tangut} example must match the Tangut converter`);
}
const paragraph = schemeExamples.match(/<tr><th>西夏文<\/th><td class="tangut">([\s\S]*?)<\/td><\/tr>\s*<tr><th>GX<\/th><td class="phonetic">[\s\S]*?<\/td><\/tr>\s*<tr><th>藏文<\/th><td class="tibetan">([\s\S]*?)<\/td><\/tr>/u);
assert.ok(paragraph, "paragraph example must be present");
assert.equal(conversionCore.tangutToTibetan(paragraph[1], tangutTable).output.trimEnd(), paragraph[2], "paragraph example must match the Tangut converter");
assert.match(schemeEn, /<h3>Paragraph test<\/h3>/u);
assert.doesNotMatch(schemeEn, /automatic GX conversion|rtś\\ər¹/u);

const root = fs.readFileSync("index.html", "utf8");
assert.match(root, /url=converter\//u);

for (const file of ["党項語藏文轉寫方案-en.html", "ghc-comparison/index.html", "ghc-comparison/index-en.html"]) {
  assert.ok(fs.existsSync(file), `${file} should exist`);
  const html = fs.readFileSync(file, "utf8");
  assert.match(html, /converter\//u, `${file} should link the converter`);
}

const ghcZh = fs.readFileSync("ghc-comparison/index.html", "utf8");
const ghcEn = fs.readFileSync("ghc-comparison/index-en.html", "utf8");
for (const html of [ghcZh, ghcEn]) {
  assert.match(html, /\.\.\/scheme\.css\?v=20260811/u);
  assert.match(html, /class="layout"/u);
  assert.match(html, /class="rail"/u);
  assert.match(html, /class="hero"/u);
  assert.doesNotMatch(html, /<style>/u);
  assert.doesNotMatch(html, /…ར/u);
}
assert.match(ghcZh, /<td class="tibetan">ཨེ<\/td>/u);
assert.match(ghcZh, /<td class="tibetan">འརྸྀ<\/td>/u);
assert.match(ghcZh, /後置 <span class="tibetan">ཡ<\/span><\/td><td>四等/u);
assert.match(ghcEn, /postposed <span class="tibetan">ཡ<\/span><\/td><td>Grade IV/u);
assert.doesNotMatch(ghcZh, /GX 輸入|-\\e|-\\ə/u);
assert.doesNotMatch(ghcEn, /GX input|-\\e|-\\ə/u);
assert.equal((ghcEn.match(/<tr>/gu) || []).length, (ghcZh.match(/<tr>/gu) || []).length, "GHC table rows must match");
assert.equal(scriptCharacters(ghcEn), scriptCharacters(ghcZh), "Chinese and English GHC data must match");
assert.deepEqual([...ghcEn.matchAll(/<code>(.*?)<\/code>/gu)].map(match => match[1]), [...ghcZh.matchAll(/<code>(.*?)<\/code>/gu)].map(match => match[1]), "Chinese and English GHC values must match");

const texZh = fs.readFileSync("tex/main.tex", "utf8");
const texEn = fs.readFileSync("tex/main-en.tex", "utf8");
assert.match(texEn, /^\\documentclass\[12pt\]\{nextart\}$/mu);
assert.doesNotMatch(texEn, /nextart_zh/u);
assert.doesNotMatch(texEn, /automatic GX conversion|textbackslash ər/u);
assert.equal((texEn.match(/^R\.\d+ &/gmu) || []).length, 105, "English TeX must contain R.1–105");
assert.deepEqual(texEn.match(/^R\.\d+ &.*$/gmu), texZh.match(/^R\.\d+ &.*$/gmu), "Chinese and English TeX rhyme rows must match");
assert.equal(scriptCharacters(texEn.slice(texEn.indexOf("\\section{Spelling tests}"))), scriptCharacters(texZh.slice(texZh.indexOf("\\section{拼寫測試}"))), "Chinese and English TeX examples and rhyme data must match");
const ghcTexEn = fs.readFileSync("ghc-comparison/tex/main-en.tex", "utf8");
assert.match(ghcTexEn, /^\\documentclass\[12pt\]\{nextart\}$/mu);
assert.doesNotMatch(ghcTexEn, /nextart_zh/u);

const sharedCss = fs.readFileSync("scheme.css", "utf8");
assert.match(sharedCss, /font-family: "Libertinus Sans Web"/u);
assert.match(sharedCss, /code \{ font-family: "Libertinus Sans Web"/u);
for (const file of ["README.md", "converter/index.html", "converter/converter.js", "党項語藏文轉寫方案.html", "党項語藏文轉寫方案-en.html", "ghc-comparison/index.html", "ghc-comparison/index-en.html", "tex/main.tex", "tex/main-en.tex", "ghc-comparison/tex/main.tex", "ghc-comparison/tex/main-en.tex"]) {
  assert.doesNotMatch(fs.readFileSync(file, "utf8"), /\uFF0F/u, `${file} must not use the fullwidth slash`);
}

console.log("ok - bilingual HTML/TeX structure, CSS, and complete data remain aligned");

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("党項語藏文轉寫方案.html", "utf8");
const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/giu)];
assert.ok(inlineScripts.length > 0, "the page should contain its inline application script");
for (const [index, match] of inlineScripts.entries()) {
  assert.doesNotThrow(() => new vm.Script(match[1]), `inline script ${index + 1} should compile`);
}
assert.match(html, /<script src="converter\.js"><\/script>/u);
assert.match(html, /id="converter-input"/u);
assert.match(html, /id="converter-output"/u);

console.log(`ok - ${inlineScripts.length} inline HTML script compiled`);

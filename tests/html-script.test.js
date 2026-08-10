"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

for (const file of ["index.html", "党項語藏文轉寫方案.html"]) {
  const html = fs.readFileSync(file, "utf8");
  const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/giu)];
  assert.ok(inlineScripts.length > 0, `${file} should contain its inline application script`);
  for (const [index, match] of inlineScripts.entries()) {
    assert.doesNotThrow(() => new vm.Script(match[1]), `${file} inline script ${index + 1} should compile`);
  }
  assert.match(html, /<script src="converter\.js"><\/script>/u);
}
const home = fs.readFileSync("index.html", "utf8");
assert.doesNotMatch(home, /http-equiv="refresh"|location\.replace/u);
assert.match(home, /id="input"/u);
assert.match(home, /id="output"/u);

console.log("ok - both HTML application scripts compiled");

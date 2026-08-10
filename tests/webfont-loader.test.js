"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("fonts/webfont-loader.js", "utf8");
const appended = [];
const listeners = new Map();
const idleTasks = [];
let intersectionCallback;

const document = {
  currentScript: { src: "https://example.test/fonts/webfont-loader.js" },
  head: { append(link) { appended.push(link); } },
  createElement() { return {}; },
  querySelector() { return {}; },
  addEventListener(type, callback) { listeners.set(type, callback); },
  removeEventListener(type) { listeners.delete(type); }
};
const window = {
  SHANGGU_WEBFONT_CHUNKS: [
    { file: "regular-core.woff2", core: true },
    ...Array.from({ length: 6 }, (_, index) => ({ file: `chunk-${index}.woff2`, core: false }))
  ],
  addEventListener(type, callback) { listeners.set(type, callback); },
  requestIdleCallback(callback) { idleTasks.push(callback); }
};
class IntersectionObserver {
  constructor(callback) { intersectionCallback = callback; }
  observe() {}
  disconnect() {}
}
window.IntersectionObserver = IntersectionObserver;

vm.runInNewContext(source, { window, document, URL, IntersectionObserver });
assert.equal(appended.length, 0, "non-core chunks should not load during script evaluation");
listeners.get("load")();
assert.equal(idleTasks.length, 1, "load should schedule idle warming");
idleTasks.shift()({ timeRemaining: () => 10 });
assert.equal(appended.length, 1, "idle warming should request one low-priority chunk at a time");
assert.equal(appended[0].fetchPriority, "low");
assert.equal(appended[0].href, "https://example.test/fonts/shanggu-web/chunk-0.woff2");

intersectionCallback([{ isIntersecting: true }]);
assert.equal(appended.length, 5, "approaching the converter should immediately request a larger batch");
assert.equal(appended[1].fetchPriority, "high");

console.log("ok - Shanggu chunks warm lazily and gain priority near the converter");

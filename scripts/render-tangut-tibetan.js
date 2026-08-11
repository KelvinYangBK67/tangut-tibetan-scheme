"use strict";

const fs = require("node:fs");
const converter = require("../converter/converter.js");

const entries = JSON.parse(fs.readFileSync(0, "utf8"));
const rows = [];
const errors = [];
const ghcInitials = [
  ["tśh", "tśh"], ["tsh", "tsh"], ["dź", "dź"], ["ph", "ph"], ["th", "th"],
  ["kh", "kh"], ["lh", "lh"], ["ts", "ts"], ["dz", "dz"], ["tś", "tś"],
  ["ś", "ś"], ["ɣ", "gh"], ["p", "p"], ["t", "t"], ["b", "b"], ["d", "d"],
  ["m", "m"], ["n", "n"], ["k", "k"], ["g", "g"], ["ŋ", "ŋ"], ["s", "s"],
  ["z", "z"], ["l", "l"], ["r", "r"], ["x", "h"], ["j", "y"], ["w", "w"], ["·", "Ø"]
];

function fallbackGxOnset(ghc, tone) {
  const initial = ghcInitials.find(([spelling]) => ghc.startsWith(spelling));
  if (!initial) throw new Error("GHC bootstrap reading has no recognizable onset");
  return initial[1] + "a" + tone;
}

for (const entry of entries) {
  try {
    const tone = entry.tone === "1" ? "¹" : entry.tone === "2" ? "²" : "?";
    let canonicalGx = entry.gx;
    if (!canonicalGx) {
      try {
        canonicalGx = converter.ghcSyllableToGx(entry.ghc + tone);
      } catch (_) {
        canonicalGx = fallbackGxOnset(entry.ghc, tone);
      }
    }
    const tibetan = converter.rhymeClassToTibetan(entry.rhyme, canonicalGx, entry.tone, {
      initialClass: entry.initialClass
    });
    rows.push([entry.tangut, tibetan]);
  } catch (error) {
    errors.push({ tangut: entry.tangut, gx: entry.gx, ghc: entry.ghc, rhyme: entry.rhyme, message: error.message });
  }
}

process.stdout.write(JSON.stringify({ rows, errors }));

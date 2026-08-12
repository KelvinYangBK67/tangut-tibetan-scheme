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

function onsetOnly(gx, tone) {
  const parsed = converter.parseGxSyllable(gx);
  const preinitial = parsed.preinitial ? parsed.preinitial.gx : "";
  return preinitial + parsed.main.gx + "a" + tone;
}

for (const entry of entries) {
  try {
    const tone = entry.tone === "1" ? "¹" : entry.tone === "2" ? "²" : "?";
    const candidates = new Set();
    for (const onset of entry.onsets) {
      let canonicalGx = onset.reading;
      if (onset.kind === "ghc") {
        try {
          canonicalGx = converter.ghcSyllableToGx(onset.reading + tone);
        } catch (_) {
          canonicalGx = fallbackGxOnset(onset.reading, tone);
        }
      }
      if (onset.source.includes("反切上字")) canonicalGx = onsetOnly(canonicalGx, tone);
      candidates.add(converter.rhymeClassToTibetan(entry.rhyme, canonicalGx, entry.tone, {
        initialClass: entry.initialClass
      }));
    }
    if (candidates.size !== 1) throw new Error("Onset evidence conflicts");
    let tibetan = [...candidates][0];
    if (entry.uncertain && !tibetan.endsWith("?")) tibetan += "?";
    rows.push([entry.tangut, tibetan]);
  } catch (error) {
    errors.push({ tangut: entry.tangut, rhyme: entry.rhyme, message: error.message });
  }
}

process.stdout.write(JSON.stringify({ rows, errors }));

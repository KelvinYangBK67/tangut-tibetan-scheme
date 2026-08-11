"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const converter = require("../converter/converter.js");

const xunpinExamples = [
  ["tjiw", "tśiw¹"], ["sjihx", "śih²"],
  ["gghweerx", "rġhwe̱r²"], ["ngqhaii", "ŋqhai̱¹"],
  ["gom", "goṃ¹"], ["nraeemx", "ṇae̱ṃ²"]
];
for (const [xunpin, gx] of xunpinExamples) {
  assert.equal(converter.parseXunpin(xunpin), gx, `${xunpin} canonical GX`);
  assert.equal(converter.gxToTibetan(xunpin).output, converter.gxSyllableToTibetan(gx), `${xunpin} forward`);
}
assert.equal(
  converter.gxToTibetan("tjiw sjihx tśiw¹ śih²").output,
  ["tśiw¹", "śih²", "tśiw¹", "śih²"].map(converter.gxSyllableToTibetan).join("་")
);
for (const invalid of ["hello", "tśiw", "tjiw¹", "tjiw?", "abxc"]) {
  assert.ok(converter.gxToTibetan(invalid).errors.length, `${invalid} must be rejected`);
}
assert.throws(() => converter.parseXunpin("tśiw"), /ASCII/u);

const markedRhymes = [
  ["rtś\\ər¹", "འརྕྀ", "rtśər¹", "tśjɨɨr¹"],
  ["rts\\er¹", "འརྩེ", "rtser¹", "tsjiir¹"]
];
for (const [extendedGx, tibetan, standardGx, ghc] of markedRhymes) {
  assert.equal(converter.gxSyllableToTibetan(extendedGx), tibetan);
  assert.equal(converter.tibetanSyllableToGx(tibetan), standardGx);
  assert.equal(converter.tibetanSyllableToGx(tibetan, { preserveRhymeClassMarker: true }), extendedGx);
  assert.equal(converter.tibetanSyllableToGhc(tibetan), ghc);
  assert.equal(converter.ghcSyllableToTibetan(ghc), tibetan);
}
assert.equal(converter.gxToTibetan("rtś\\ər¹ rts\\er¹").output, "འརྕྀ་འརྩེ");
const gradeFourRhymes = [
  ["s\\u¹", "སཡུ"], ["tś\\i¹", "ཅཡི"], ["t\\a¹", "ཏཡ"],
  ["t\\ə¹", "ཏཡྀ"], ["t\\e¹", "ཏཡེ"], ["tś\\iw¹", "ཅཡིག༹"]
];
for (const [gx, tibetan] of gradeFourRhymes) {
  assert.equal(converter.gxSyllableToTibetan(gx), tibetan, `${gx} Grade IV forward`);
  assert.equal(converter.tibetanSyllableToGx(tibetan, { preserveRhymeClassMarker: true }), gx, `${gx} Grade IV reverse`);
}
assert.throws(() => converter.gxSyllableToTibetan("rtś\\i¹"));
assert.equal(converter.ghcSyllableToGx("tś\\ji¹"), "tś\\i¹");
assert.equal(converter.ghcSyllableToTibetan("tś\\ji¹"), "ཅཡི");
assert.equal(converter.ghcSyllableToGx("\\nji¹"), "ṇi¹");
assert.equal(converter.ghcSyllableToTibetan("\\nji¹"), "ཎི");

const tangutTable = converter.parseTangutCsv(fs.readFileSync("converter/data/tangut-tibetan.csv", "utf8"));
assert.equal(tangutTable.size, 5713);
assert.equal(tangutTable.get("𗸈"), "དཡུ", "native R.3 must retain Grade IV");
assert.equal(tangutTable.get("𗂴"), "འརྕྀ", "native R.100 must differ from R.92");
assert.equal(tangutTable.get("𗎫"), "འརྩེས", "native R.101 must differ from R.79");
assert.equal(tangutTable.get("𘆵"), "ཎི", "native Class IV must use ཎ");
assert.deepEqual(
  converter.tangutToTibetan("𗹦𗼻𗯨𗐯𗂥，", tangutTable),
  { output: "མའྀ་སྡྀ༹ས་རྸུ་སྐཨེས་ནཡེས། ", errors: [] }
);

const ghcExamples = [
  ["tśja¹", "ཅ"], ["śjij²", "ཤེས"], ["tśjɨr¹", "རྕྀ"],
  ["muu¹", "འམའུ"], ["ɣjij¹", "གེ༹"]
];
for (const [ghc, tibetan] of ghcExamples) {
  assert.equal(converter.ghcSyllableToTibetan(ghc), tibetan, `${ghc} GHC forward`);
  assert.equal(converter.tibetanSyllableToGhc(tibetan), ghc, `${ghc} GHC reverse`);
}
assert.equal(converter.ghcToTibetan("tśjɨr¹ tśjɨɨr¹").output, "རྕྀ་འརྕྀ");
assert.equal(converter.tibetanToGhc("རྕྀ་ འརྕྀ").output, "tśjɨr¹ tśjɨɨr¹");
assert.ok(converter.ghcToTibetan("hello").errors.length);

const examples = [
  ["nye¹", "ནྱེ"], ["phu²", "ཕུས"], ["dźə?", "ཇྀ?"],
  ["świ¹", "ཤྭི"], ["baa̱¹", "བཨ"], ["śeṃ¹", "ཤེམ"],
  ["li̱w¹", "ལའིག༹"], ["śih²", "སྴིས"],
  ["hae̱ṃ²", "ཧཨེམས"], ["ġhai̱h²", "སྒ༹ཨིས"],
  ["rŋo̱ṃr²", "རྔའོམས"], ["llo̱ṃh²", "སྡ༹འོམས"],
  ["rġhwe̱r²", "རྒྭ༹འེས"]
];

for (const [gx, tibetan] of examples) {
  assert.equal(converter.gxSyllableToTibetan(gx), tibetan, `${gx} forward`);
  assert.equal(converter.tibetanSyllableToGx(tibetan), gx, `${gx} reverse`);
}

const shapingPairs = [
  ["རྒ༹ྭའེས", "རྒྭ༹འེས"],
  ["སྒ༹ྭཨིས", "སྒྭ༹ཨིས"]
];
for (const [semanticOrder, shapingOrder] of shapingPairs) {
  assert.equal(converter.normalizeTibetan(semanticOrder), shapingOrder);
}

assert.equal(converter.tibetanSyllableToGx("ས"), "sa¹");
assert.equal(converter.tibetanSyllableToGx("སས"), "sa²");
assert.equal(converter.gxSyllableToTibetan("wo̱²"), "ཨྭའོས");
assert.equal(converter.tibetanSyllableToGx("ཨྭའོས"), "wo̱²");
assert.equal(converter.gxSyllableToTibetan("hwo̱²"), "ཧྭའོས");
assert.equal(converter.tibetanSyllableToGx("ཧྭའོས"), "hwo̱²");
assert.equal(converter.gxSyllableToTibetan("wa¹"), "ཨྭ");
assert.equal(converter.tibetanSyllableToGx("ཨྭ"), "wa¹");
assert.equal(converter.gxSyllableToTibetan("hwa¹"), "ཧྭ");
assert.equal(converter.tibetanSyllableToGx("ཧྭ"), "hwa¹");

const wVowels = [
  ["a", ""], ["e", "ེ"], ["i", "ི"], ["o", "ོ"], ["u", "ུ"], ["ə", "ྀ"],
  ["a̱", "འ"], ["e̱", "འེ"], ["i̱", "འི"], ["o̱", "འོ"], ["u̱", "འུ"], ["ə̱", "འྀ"],
  ["aa̱", "ཨ"], ["ae̱", "ཨེ"], ["ai̱", "ཨི"], ["ao̱", "ཨོ"], ["au̱", "ཨུ"], ["aə̱", "ཨྀ"],
  ["uo", "ོུ"]
];
for (const [vowel, suffix] of wVowels) {
  for (const [gxOnset, tibetanOnset] of [["w", "ཨྭ"], ["hw", "ཧྭ"]]) {
    const gx = `${gxOnset}${vowel}¹`;
    const tibetan = tibetanOnset + suffix;
    assert.equal(converter.gxSyllableToTibetan(gx), tibetan, `${gxOnset} across ${vowel}`);
    assert.equal(converter.tibetanSyllableToGx(tibetan), gx, `${tibetanOnset} across ${vowel}`);
  }
}
const wDerivedForms = [
  ["wah²", "སྸྭས"], ["hwah²", "སྷྭས"],
  ["rwar?", "རྸྭ?"], ["rhwar?", "རྷྭ?"],
  ["mbah¹", "འསྦ"], ["byah¹", "སྦྱ"], ["rbahr¹", "རསྦ"]
];
for (const [gx, tibetan] of wDerivedForms) {
  assert.equal(converter.gxSyllableToTibetan(gx), tibetan, `${gx} derived forward`);
  assert.equal(converter.tibetanSyllableToGx(tibetan), gx, `${gx} derived reverse`);
}
assert.throws(() => converter.tibetanSyllableToGx("ཨྷི"), /不是本方案/u);

const sentenceGx = "mə̱¹ lləh² rur¹ qae̱h² ne²,";
const sentenceTibetan = "མའྀ་སྡྀ༹ས་རྸུ་སྐཨེས་ནེས། ";
assert.equal(converter.gxToTibetan(sentenceGx).output, sentenceTibetan);
assert.equal(converter.tibetanToGx(sentenceTibetan).output, sentenceGx);
assert.equal(converter.tibetanToGx("ནེས།ཕུས").output, "ne², phu²");
assert.equal(converter.tibetanToGx("ནེས།།ཕུས").output, "ne². phu²");

const sentences = [
  ["bi̱² lhih² tśhə¹ zoh² śa².", "བའིས་སྠི༹ས་ཆྀ་སྯོས་ཤས༎ "],
  ["swi̱w¹ na̱¹ ẓaə̱h¹ rtṣai̱r¹ dẓae̱²,", "སྭའིག༹་ནའ་སྮཨྀ་རྕཨི་ཇཨེས། "],
  ["tsa¹ da̱h² phu² bi² ŋwe̱².", "ཙ་སྡའས་ཕུས་བིས་ངྭའེས༎ "]
];
for (const [gx, tibetan] of sentences) {
  assert.equal(converter.gxToTibetan(gx).output, tibetan, `${gx} sentence forward`);
  assert.equal(converter.tibetanToGx(tibetan).output, gx, `${gx} sentence reverse`);
}

const punctuationCases = [
  ["ba¹: \"za¹?\"", "བ། ཟ༎ "],
  ["ba¹, za¹", "བ། ཟ"],
  ["ba¹。za¹！", "བ༎ ཟ༎ "],
  ["śeṃ¹\"yə²", "ཤེམ་ཡྀས"],
  ["ba¹「za¹」", "བ་ཟ"],
  ["ba¹…za¹", "བ…ཟ"],
  ["ba¹……za¹", "བ……ཟ"],
  ["ba¹...za¹", "བ...ཟ"],
  ["ba¹□za¹", "བ□ཟ"],
  ["ba??", "བ?༎ "],
  ["ba¹?", "བ༎ "],
  ["dźə?", "ཇྀ?"],
  ["dźə??", "ཇྀ?༎ "],
  ["foo\\?", converter.gxSyllableToTibetan("fo̱¹") + "༎ "]
];
for (const [input, expected] of punctuationCases) {
  assert.equal(converter.gxToTibetan(input).output, expected, `${input} punctuation`);
}
assert.equal(converter.normalizeTibetan("ཤེམ\"ཡྀས"), "ཤེམ་ཡྀས");
assert.equal(converter.tibetanToGx("ཤེམ\"ཡྀས").output, "śeṃ¹ yə²");
assert.equal(converter.tibetanToGx("ནེས༎ཕུས").output, "ne². phu²");

const roundTrips = [
  "bu̱¹", "bu¹", "bau̱¹", "bi̱¹", "bai̱¹", "bi¹", "bi̱ṃ¹", "biṃ¹",
  "ba̱¹", "baa̱¹", "ba¹", "baw¹", "ba̱ṃ¹", "baa̱ṃ¹", "baṃ¹",
  "bə̱¹", "baə̱¹", "bə¹", "be̱¹", "bae̱¹", "be¹", "be̱ṃ¹", "bae̱ṃ¹", "beṃ¹",
  "bi̱w¹", "bai̱w¹", "biw¹", "bow¹", "bo̱¹", "bao̱¹", "bo¹",
  "bo̱ṃ¹", "bao̱ṃ¹", "boṃ¹", "buo¹",
  "bu̱h¹", "bau̱h¹", "buh¹", "be̱h¹", "bae̱h¹", "beh¹", "beṃh¹",
  "ba̱h¹", "baa̱h¹", "bah¹", "bi̱h¹", "bai̱h¹", "bih¹", "bə̱h¹", "baə̱h¹", "bəh¹",
  "bo̱ṃh¹", "bo̱h¹", "boh¹",
  "rbe̱r¹", "rbae̱r¹", "rber¹", "rbu̱r¹", "rbur¹", "rbi̱r¹", "rbai̱r¹", "rbir¹",
  "rba̱r¹", "rbaa̱r¹", "rbar¹", "rbawr¹", "rbə̱r¹", "rbaə̱r¹", "rbər¹",
  "rbi̱wr¹", "rbiwr¹", "rbo̱r¹", "rbao̱r¹", "rbor¹", "rbo̱ṃr¹",
  "nto¹", "ndzu̱²", "mpho²", "mbu̱²", "ŋkhu²", "ŋgu²", "ŋqhe̱¹", "ŋġa̱²",
  "mme¹", "nne¹", "ŋŋwu̱¹", "nvu¹", "nse²", "nzi̱w²", "nświ²",
  "kha¹", "qha̱¹", "ga¹", "ġu̱²", "tśa¹", "tṣao̱ṃ¹", "dźe¹", "dẓae̱²",
  "vwi̱²", "dya²", "hwaa̱ṃ¹", "rir¹", "rġhwe̱r²"
];
for (const gx of roundTrips) {
  assert.doesNotThrow(() => {
    const tibetan = converter.gxSyllableToTibetan(gx);
    assert.equal(converter.tibetanSyllableToGx(tibetan), gx, `${gx} generated round-trip via ${tibetan}`);
  }, `${gx} should parse and round-trip`);
}

console.log(`ok - ${64 + examples.length + shapingPairs.length + 14 + wVowels.length * 4 + wDerivedForms.length * 2 + sentences.length * 2 + roundTrips.length} converter checks`);

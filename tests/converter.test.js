"use strict";

const assert = require("node:assert/strict");
const converter = require("../converter.js");

const examples = [
  ["nye¹", "ནྱེ"], ["phu²", "ཕུས"], ["dźə?", "ཇྀ?"],
  ["świ¹", "ཤྭི"], ["baa̱¹", "བཨ"], ["śeṃ¹", "ཤེམ"],
  ["li̱w¹", "ལའིག༹"], ["śih²", "ཤྷིས"],
  ["hae̱ṃ²", "ཧཨེམས"], ["ġhai̱h²", "གྷ༹ཨིས"],
  ["rŋo̱ṃr²", "རྔའོམས"], ["llo̱ṃh²", "དྷ༹འོམས"],
  ["rġhwe̱r²", "རྒྭ༹འེས"]
];

for (const [gx, tibetan] of examples) {
  assert.equal(converter.gxSyllableToTibetan(gx), tibetan, `${gx} forward`);
  assert.equal(converter.tibetanSyllableToGx(tibetan), gx, `${gx} reverse`);
}

const shapingPairs = [
  ["ད༹ྷའོམས", "དྷ༹འོམས"],
  ["རྒ༹ྭའེས", "རྒྭ༹འེས"],
  ["ག༹ྷཨིས", "གྷ༹ཨིས"]
];
for (const [semanticOrder, shapingOrder] of shapingPairs) {
  assert.equal(converter.normalizeTibetan(semanticOrder), shapingOrder);
}

assert.equal(converter.tibetanSyllableToGx("ས"), "sa¹");
assert.equal(converter.tibetanSyllableToGx("སས"), "sa²");
assert.equal(converter.gxSyllableToTibetan("wo̱²"), "ཧྭའོས");
assert.equal(converter.tibetanSyllableToGx("ཧྭའོས"), "wo̱²");

const sentenceGx = "mə̱¹ lləh² rur¹ qae̱h² ne²,";
const sentenceTibetan = "མའྀ་དྷྀ༹ས་རྸུ་ཀྷཨེས་ནེས།";
assert.equal(converter.gxToTibetan(sentenceGx).output, sentenceTibetan);
assert.equal(converter.tibetanToGx(sentenceTibetan).output, sentenceGx);

const sentences = [
  ["bi̱² lhih² tśhə¹ zoh² śa².", "བའིས་ཐྷི༹ས་ཆྀ་ཟྷོས་ཤས།།"],
  ["swi̱w¹ na̱¹ ẓaə̱h¹ rtṣai̱r¹ dẓae̱²,", "སྭའིག༹་ནའ་ཞྷཨྀ་རྕཨི་ཇཨེས།"],
  ["tsa¹ da̱h² phu² bi² ŋwe̱².", "ཙ་དྷའས་ཕུས་བིས་ངྭའེས།།"]
];
for (const [gx, tibetan] of sentences) {
  assert.equal(converter.gxToTibetan(gx).output, tibetan, `${gx} sentence forward`);
  assert.equal(converter.tibetanToGx(tibetan).output, gx, `${gx} sentence reverse`);
}

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

console.log(`ok - ${examples.length + shapingPairs.length + 5 + sentences.length * 2 + roundTrips.length} converter checks`);

// GX202411 ↔ canonical Tibetan conversion core.
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.GxTibetan = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const TSA_PHRU = "༹";
  const TSHEG = "་";
  const SHAD = "།";
  const NYIS_SHAD = "༎";
  const SUB_WA = "ྭ";
  const SUB_FIXED_WA = "ྺ";
  const SUB_FIXED_YA = "ྻ";
  const SUB_FIXED_RA = "ྼ";
  const SUB_YA = "ྱ";
  const FIXED_SUBJOINED = new Map([
    ["v", SUB_FIXED_WA],
    ["y", SUB_FIXED_YA],
    ["r", SUB_FIXED_RA]
  ]);
  const SUB_A = "ྸ";
  const SUPER_SA = "ས";
  const GRADE_FOUR_MARK = "ཡ";
  const GRADE_FOUR_RHYMES = new Map([
    ["u", 3], ["i", 11], ["a", 20], ["ə", 31], ["e", 37], ["iw", 47]
  ]);
  const QUOTES = new Set(['"', "“", "”", "'", "‘", "’", "「", "」", "『", "』"]);
  const BOX_MARKS = new Set([
    "□", "■", "▢", "▣", "▤", "▥", "▦", "▧", "▨", "▩", "▪", "▫",
    "◧", "◨", "◩", "◪", "◫", "◰", "◱", "◲", "◳", "◻", "◼",
    "⬜", "⬛", "☐", "☒", "☑", "〓", "�"
  ]);

  const initials = [
    ["tśh", "ཆ"], ["tṣh", "ཆ"], ["tsh", "ཚ"],
    ["dź", "ཇ"], ["dẓ", "ཇ"], ["gh", "ག", true], ["ġh", "ག", true],
    ["ph", "ཕ"], ["th", "ཐ"], ["kh", "ཁ"], ["qh", "ཁ"],
    ["lh", "ཐ", true], ["ll", "ད", true], ["ts", "ཙ"], ["dz", "ཛ"],
    ["tś", "ཅ"], ["tṣ", "ཅ"], ["ś", "ཤ"], ["ṣ", "ཤ"],
    ["ź", "ཞ"], ["ẓ", "ཞ"], ["ġ", "ག"], ["ṇ", "ཎ"], ["ŋ", "ང"],
    ["p", "པ"], ["t", "ཏ"], ["b", "བ"], ["d", "ད"],
    ["f", "ཕ", true], ["s", "ས"], ["z", "ཟ"], ["k", "ཀ"],
    ["q", "ཀ"], ["g", "ག"], ["v", "ཝ"], ["l", "ལ"],
    ["y", "ཡ"], ["r", "ར"], ["h", "ཧ"], ["w", "ཨ", false, true],
    ["m", "མ"], ["n", "ན"], ["Ø", "ཨ"]
  ].map(([gx, letter, tsaPhru = false, builtInWa = false]) => ({ gx, letter, tsaPhru, builtInWa }));

  const initialByGx = new Map(initials.map(item => [item.gx, item]));
  const subjoined = new Map([
    ["ཀ", "ྐ"], ["ཁ", "ྑ"], ["ག", "ྒ"], ["ང", "ྔ"],
    ["ཅ", "ྕ"], ["ཆ", "ྖ"], ["ཇ", "ྗ"], ["ཎ", "ྞ"],
    ["ཏ", "ྟ"], ["ཐ", "ྠ"], ["ད", "ྡ"], ["ན", "ྣ"],
    ["པ", "ྤ"], ["ཕ", "ྥ"], ["བ", "ྦ"], ["མ", "ྨ"],
    ["ཙ", "ྩ"], ["ཚ", "ྪ"], ["ཛ", "ྫ"], ["ཝ", "ྭ"],
    ["ཞ", "ྮ"], ["ཟ", "ྯ"], ["ཡ", "ྱ"], ["ར", "ྲ"],
    ["ལ", "ླ"], ["ཤ", "ྴ"], ["ས", "ྶ"], ["ཧ", "ྷ"], ["ཨ", SUB_A]
  ]);

  const vowels = [
    ["aə̱", "ཨྀ", 2], ["aa̱", "ཨ", 2], ["ae̱", "ཨེ", 2],
    ["ai̱", "ཨི", 2], ["ao̱", "ཨོ", 2], ["au̱", "ཨུ", 2],
    ["a̱", "འ", 1], ["e̱", "འེ", 1], ["i̱", "འི", 1],
    ["o̱", "འོ", 1], ["u̱", "འུ", 1], ["ə̱", "འྀ", 1],
    ["uo", "ོུ", 3], ["a", "", 3], ["e", "ེ", 3],
    ["i", "ི", 3], ["o", "ོ", 3], ["u", "ུ", 3], ["ə", "ྀ", 3]
  ].map(([gx, tibetan, grade]) => ({ gx, tibetan, grade }));
  const vowelByGx = new Map(vowels.map(item => [item.gx, item]));

  // Native rhyme-book classes are the authority for Tangut-character input.
  // Each value is "vowel+coda:flags"; N adds preposed འ, T superscribed ས,
  // R the rhotic stack, and 4 the postposed Grade-IV marker ཡ.
  const rhymeClassData = `
1|u̱ 2|u 3|u:4 4|u̱ 5|u̱:N 6|au̱:N 7|u:N
8|i̱ 9|ai̱ 10|i 11|i:4 12|i̱:N 13|ai̱:N 14|i:N 15|i̱ṃ 16|iṃ
17|a̱ 18|aa̱ 19|a 20|a:4 21|aw 22|a̱:N 23|aa̱:N 24|a:N 25|a̱ṃ 26|aa̱ṃ 27|aṃ
28|ə̱ 29|aə̱ 30|ə 31|ə:4 32|ə̱:N 33|ə:N
34|e̱ 35|ae̱ 36|e 37|e:4 38|e̱:N 39|ae̱:N 40|e:N 41|e̱ṃ 42|ae̱ṃ 43|eṃ
44|i̱w 45|ai̱w 46|iw 47|iw:4 48|i̱w:N 49|iw:N 50|ow
51|o̱ 52|ao̱ 53|o 54|o̱:N 55|ao̱:N;o:N 56|o̱ṃ 57|ao̱ṃ;oṃ 58|oṃ 59|uo 60|uo
61|u̱:T 62|au̱:T;u:T 63|e̱:T;ae̱:T 64|e:T 65|eṃ:T 66|a̱:T 67|aa̱:T;a:T
68|i̱:T 69|ai̱:T 70|i:T 71|ə̱:T 72|aə̱:T;ə:T 73|o̱ṃ:T 74|o̱:T 75|o:T 76|ae̱ṃ:T
77|e̱:R 78|ae̱:R 79|e:R 80|u̱:R 81|u:R 82|i̱:R 83|ai̱:R 84|i:R
85|a̱:R 86|aa̱:R 87|a:R 88|a̱:NR 89|aw:R 90|ə̱:R 91|aə̱:R 92|ə:R
93|i̱w:R 94|iw:R 95|o̱:R 96|ao̱:R;o:R 97|o̱ṃ:R 98|oṃ:R
99|e̱:NR 100|ə:NR 101|e:NR 102|o:R 103|o:R 104|u̱ṃ 105|a:R`;
  const rhymeClasses = new Map();
  for (const entry of rhymeClassData.trim().split(/\s+/u)) {
    const [number, encodedCandidates] = entry.split("|");
    const candidates = encodedCandidates.split(";").map(encoded => {
      const [body, flags = ""] = encoded.split(":");
      const vowel = vowels.find(item => body.startsWith(item.gx));
      if (!vowel) throw new Error(`Internal rhyme mapping error: R.${number}`);
      return { vowel, coda: body.slice(vowel.gx.length), flags };
    });
    rhymeClasses.set(Number(number), candidates);
  }

  const xunpinInitials = new Map([
    ["tśh", "tjh"], ["tṣh", "trh"], ["dź", "dj"], ["dẓ", "dr"],
    ["tś", "tj"], ["tṣ", "tr"], ["ś", "sj"], ["ṣ", "sr"],
    ["ź", "zj"], ["ẓ", "zr"], ["ṇ", "nr"], ["ġh", "ggh"],
    ["ġ", "gg"], ["ŋ", "ng"], ["Ø", ""]
  ]);

  const xunpinVowels = [
    ["ayy", "aə̱"], ["aaa", "aa̱"], ["aee", "ae̱"],
    ["aii", "ai̱"], ["aoo", "ao̱"], ["auu", "au̱"],
    ["aa", "a̱"], ["ee", "e̱"], ["ii", "i̱"],
    ["oo", "o̱"], ["uu", "u̱"], ["yy", "ə̱"],
    ["uo", "uo"], ["a", "a"], ["e", "e"], ["i", "i"],
    ["o", "o"], ["u", "u"], ["y", "ə"]
  ];

  const ghcInitialFromBase = new Map([
    ["tśh", "tśh"], ["tsh", "tsh"], ["dź", "dź"], ["gh", "ɣ"],
    ["ph", "ph"], ["th", "th"], ["kh", "kh"], ["lh", "lh"],
    ["ll", "l"], ["ts", "ts"], ["dz", "dz"], ["tś", "tś"],
    ["ś", "ś"], ["ź", "z"], ["f", "w"], ["v", "w"],
    ["ṇ", "n"], ["ŋ", "ŋ"], ["y", "j"], ["h", "x"],
    ["w", "w"], ["Ø", ""]
  ]);
  const ghcBaseFromInitial = [
    ["tśh", "tśh"], ["tsh", "tsh"], ["dź", "dź"], ["ph", "ph"],
    ["th", "th"], ["kh", "kh"], ["lh", "lh"], ["ts", "ts"],
    ["dz", "dz"], ["tś", "tś"], ["ś", "ś"], ["ɣ", "gh"],
    ["p", "p"], ["t", "t"], ["b", "b"], ["d", "d"],
    ["m", "m"], ["n", "n"], ["k", "k"], ["g", "g"],
    ["ŋ", "ŋ"], ["s", "s"], ["z", "z"], ["l", "l"],
    ["r", "r"], ["x", "h"], ["j", "y"], ["w", "v"], ["", "Ø"]
  ];

  const conditioned = {
    k: ["k", "q"], kh: ["kh", "qh"], g: ["g", "ġ"], gh: ["gh", "ġh"],
    "tś": ["tś", "tṣ"], "tśh": ["tśh", "tṣh"], "ś": ["ś", "ṣ"],
    "dź": ["dź", "dẓ"], "ź": ["ź", "ẓ"]
  };

  const reverseBaseInitials = [
    ["tśh", "ཆ", false], ["tsh", "ཚ", false], ["dź", "ཇ", false],
    ["gh", "ག", true], ["ph", "ཕ", false], ["th", "ཐ", false],
    ["kh", "ཁ", false], ["lh", "ཐ", true], ["ll", "ད", true],
    ["ts", "ཙ", false], ["dz", "ཛ", false], ["tś", "ཅ", false],
    ["ś", "ཤ", false], ["ź", "ཞ", false], ["p", "པ", false],
    ["t", "ཏ", false], ["b", "བ", false], ["d", "ད", false],
    ["f", "ཕ", true], ["s", "ས", false], ["z", "ཟ", false],
    ["k", "ཀ", false], ["g", "ག", false], ["v", "ཝ", false],
    ["l", "ལ", false], ["y", "ཡ", false], ["r", "ར", false],
    ["h", "ཧ", false], ["w", "ཨ", false, true], ["m", "མ", false],
    ["n", "ན", false], ["ṇ", "ཎ", false], ["ŋ", "ང", false], ["Ø", "ཨ", false]
  ].map(([gx, letter, tsaPhru, builtInWa = false]) => ({ gx, letter, tsaPhru, builtInWa }));

  function normalizeGx(input) {
    return String(input)
      .normalize("NFC")
      .replace(/([aeiouə])[_¯]/gu, "$1̱")
      .replace(/1(?=\s|$|[,.，。;；:：!?！？])/g, "¹")
      .replace(/2(?=\s|$|[,.，。;；:：!?！？])/g, "²");
  }

  function normalizeTibetan(input) {
    // Do not apply NFC/NFD to Tibetan here.  Canonical combining-class
    // reordering can move U+0F39 behind a vowel sign, undoing the shaping
    // order deliberately used by this orthography.
    let value = String(input)
      .replace(/([\u0F40-\u0FBC])[\s"“”'‘’「」『』]+(?=[\u0F40-\u0FBC])/gu, `$1${TSHEG}`)
      .replace(/["“”'‘’「」『』]/gu, "")
      .replace(/ཝྭ/gu, "ཝ")
      .replace(/ྭྭ/gu, "ྭ");
    // U+0F39 interrupts a Tibetan stack.  Move it behind all following
    // subjoined consonants: shaping stability is the canonical rule here.
    let previous;
    do {
      previous = value;
      value = value.replace(/༹([\u0F90-\u0FBC]+)/gu, "$1༹");
    } while (value !== previous);
    return value
      .replace(/[ \t]*་[ \t]*/gu, TSHEG)
      .replace(/་+/gu, TSHEG);
  }

  function chooseBaseInitial(gx) {
    if (["q", "k"].includes(gx)) return "k";
    if (["qh", "kh"].includes(gx)) return "kh";
    if (["ġ", "g"].includes(gx)) return "g";
    if (["ġh", "gh"].includes(gx)) return "gh";
    if (["tṣ", "tś"].includes(gx)) return "tś";
    if (["tṣh", "tśh"].includes(gx)) return "tśh";
    if (["ṣ", "ś"].includes(gx)) return "ś";
    if (["dẓ", "dź"].includes(gx)) return "dź";
    if (["ẓ", "ź"].includes(gx)) return "ź";
    return gx;
  }

  function initialForGrade(base, grade) {
    if (conditioned[base]) return conditioned[base][grade === 3 ? 0 : 1];
    if (base === "v" && grade !== 3) return "vw";
    return base === "Ø" ? "" : base;
  }

  function nasalPrefixFor(base) {
    if (["p", "ph", "b", "m"].includes(base)) return "m";
    if (["k", "kh", "g", "gh", "ŋ"].includes(base)) return "ŋ";
    if (["t", "th", "d", "n", "ts", "tsh", "dz", "tś", "tśh", "dź"].includes(base)) return "n";
    return "n";
  }

  function initialToXunpin(gx) {
    return xunpinInitials.get(gx) ?? gx;
  }

  const xunpinOnsets = new Map();
  function addXunpinOnset(xunpin, candidate) {
    const values = xunpinOnsets.get(xunpin) || [];
    if (!values.some(value => value.gx === candidate.gx && value.base === candidate.base)) values.push(candidate);
    xunpinOnsets.set(xunpin, values);
  }
  for (const spec of initials) {
    for (const medial of ["", "w", "y"]) {
      if (spec.builtInWa && medial === "w") continue;
      const gxInitial = spec.gx === "Ø" ? "" : spec.gx;
      const xunpinInitial = initialToXunpin(spec.gx);
      addXunpinOnset(xunpinInitial + medial, { gx: gxInitial + medial, base: spec.gx, preinitial: false });
      if (spec.gx !== "Ø") {
        const nasal = nasalPrefixFor(chooseBaseInitial(spec.gx));
        addXunpinOnset(initialToXunpin(nasal) + xunpinInitial + medial, {
          gx: nasal + gxInitial + medial,
          base: spec.gx,
          preinitial: true
        });
      }
    }
  }

  function parseXunpin(raw) {
    const source = String(raw).trim();
    if (!/^[a-z]+$/u.test(source)) throw new Error("勳拼只能使用小寫 ASCII 字母");

    const tone = source.endsWith("x") ? "²" : "¹";
    let body = tone === "²" ? source.slice(0, -1) : source;
    if (!body || body.includes("x")) throw new Error("勳拼的 x 只能作爲末尾上聲標記");

    let retroflex = false;
    if (body.endsWith("r")) {
      retroflex = true;
      body = body.slice(0, -1);
    }
    let tight = false;
    if (body.endsWith("h")) {
      tight = true;
      body = body.slice(0, -1);
    }
    let coda = "";
    if (body.endsWith("m") || body.endsWith("w")) {
      coda = body.endsWith("m") ? "ṃ" : "w";
      body = body.slice(0, -1);
    }

    const vowel = xunpinVowels.find(([spelling]) => body.endsWith(spelling));
    if (!vowel) throw new Error("不符合合法勳拼音節結構：無法辨認韻母");
    const onset = body.slice(0, -vowel[0].length);
    const onsetCandidates = xunpinOnsets.get(onset) || [];
    const canonicalCandidates = [];
    for (const candidate of onsetCandidates) {
      let gxOnset = candidate.gx;
      if (retroflex && candidate.base !== "r") gxOnset = "r" + gxOnset;
      const canonical = gxOnset + vowel[1] + coda + (tight ? "h" : "") + (retroflex ? "r" : "") + tone;
      try {
        parseGxSyllable(canonical);
        if (!canonicalCandidates.some(value => value.canonical === canonical)) {
          canonicalCandidates.push({ canonical, preinitial: candidate.preinitial });
        }
      } catch (_) {
        // Candidate generation is deliberately broader than the GX parser;
        // canonical GX remains the final authority on syllable legality.
      }
    }
    if (!canonicalCandidates.length) throw new Error("不符合合法勳拼音節結構：無法辨認聲母或介音");
    const directCandidates = canonicalCandidates.filter(candidate => !candidate.preinitial);
    const preferred = directCandidates.length ? directCandidates : canonicalCandidates;
    if (preferred.length > 1) throw new Error("勳拼音節有多個可能的 GX 分析");
    return preferred[0].canonical;
  }

  function parseGxSyllable(raw) {
    const source = normalizeGx(raw).trim();
    const toneMatch = source.match(/([¹²?])$/u);
    if (!toneMatch) throw new Error("音節須以 ¹、² 或 ? 標示聲調");
    const tone = toneMatch[1];
    let body = source.slice(0, -tone.length);
    let retroflex = false;
    if (body.endsWith("r")) {
      retroflex = true;
      body = body.slice(0, -1);
    }
    let tight = false;
    if (body.endsWith("h")) {
      tight = true;
      body = body.slice(0, -1);
    }
    let coda = "";
    if (body.endsWith("ṃ") || body.endsWith("w")) {
      coda = body.slice(-1);
      body = body.slice(0, -1);
    }

    let vowel;
    for (const candidate of vowels) {
      if (body.endsWith(candidate.gx)) {
        vowel = candidate;
        body = body.slice(0, -candidate.gx.length);
        break;
      }
    }
    if (!vowel) throw new Error("無法辨認元音");
    let markedRhyme = false;
    if (body.endsWith("\\")) {
      markedRhyme = true;
      body = body.slice(0, -1);
    }
    const rhymeKey = vowel.gx + coda;
    const markedRhymeKind = markedRhyme
      ? retroflex && ["e", "ə"].includes(vowel.gx) && !coda
        ? "preposed-a"
        : !retroflex && GRADE_FOUR_RHYMES.has(rhymeKey)
          ? "grade-four"
          : "invalid"
      : "";
    if (markedRhymeKind === "invalid") {
      throw new Error("反斜線只可標記四等韻或 R.100/R.101");
    }

    if (retroflex && body.startsWith("r")) {
      const afterMarker = body.slice(1);
      const startsAsInitial = initials.some(item => item.gx !== "Ø" && afterMarker.startsWith(item.gx));
      if (startsAsInitial) body = afterMarker;
    }

    let preinitial = false;
    let main;
    let medial = "";
    const direct = initials
      .filter(item => body.startsWith(item.gx))
      .map(item => ({ item, rest: body.slice(item.gx.length) }))
      .filter(({ rest }) => rest === "" || rest === "w" || rest === "y")
      .sort((a, b) => b.item.gx.length - a.item.gx.length)[0];

    if (direct) {
      main = direct.item;
      medial = direct.rest;
    } else if (body === "") {
      main = initialByGx.get("Ø");
    } else {
      const candidates = initials
        .filter(item => item.gx !== "Ø")
        .flatMap(item => ["", "w", "y"].map(candidateMedial => {
          const suffix = item.gx + candidateMedial;
          return { item, medial: candidateMedial, prefix: body.slice(0, body.length - suffix.length), rest: body.slice(-suffix.length), suffix };
        }))
        .filter(({ prefix, rest, suffix }) => rest === suffix && ["n", "m", "ŋ"].includes(prefix))
        .sort((a, b) => b.item.gx.length - a.item.gx.length);
      if (!candidates.length) throw new Error("無法辨認聲母或冠音");
      main = candidates[0].item;
      medial = candidates[0].medial;
      preinitial = true;
    }

    if (markedRhyme && preinitial) {
      throw new Error("反斜線標記不可與鼻冠音並用");
    }

    return { source, tone, retroflex, tight, coda, vowel, main, medial, preinitial, markedRhyme, markedRhymeKind };
  }

  function encodeOnset(parsed) {
    const base = chooseBaseInitial(parsed.main.gx);
    const spec = initialByGx.get(base === "" ? "Ø" : base);
    const inherentRetroflexRa = parsed.retroflex && base === "r";
    let onset = parsed.preinitial || parsed.markedRhymeKind === "preposed-a" ? "འ" : "";
    if (parsed.retroflex && !inherentRetroflexRa) onset += "ར";
    if (parsed.tight) onset += SUPER_SA;
    if (parsed.tight || parsed.retroflex && !inherentRetroflexRa) {
      onset += base === "Ø"
        ? SUB_A
        : FIXED_SUBJOINED.get(base) || subjoined.get(spec.letter);
    } else {
      onset += spec.letter;
    }
    if (spec.builtInWa) onset += SUB_WA;
    // GX vw is the Grade-I/II conditioned realization of v, not a separate
    // w medial. The Tibetan ཝ / subjoined ྭ already expresses it.
    const conditionedVw = base === "v" && parsed.medial === "w" && [1, 2].includes(parsed.vowel.grade);
    if (parsed.medial === "w" && !conditionedVw) onset += SUB_WA;
    if (parsed.medial === "y") onset += SUB_YA;
    if (spec.tsaPhru) onset += TSA_PHRU;
    return onset;
  }

  function gxSyllableToTibetan(raw) {
    const parsed = parseGxSyllable(raw);
    let result = encodeOnset(parsed)
      + (parsed.markedRhymeKind === "grade-four" ? GRADE_FOUR_MARK : "")
      + parsed.vowel.tibetan;
    if (parsed.coda === "w") result += "ག༹";
    if (parsed.coda === "ṃ") result += "མ";
    if (parsed.tone === "²") result += "ས";
    if (parsed.tone === "?") result += "?";
    return normalizeTibetan(result);
  }

  function rhymeClassToTibetan(rhymeClass, onsetSource, tone, options = {}) {
    const number = Number(String(rhymeClass).replace(/^R\./iu, ""));
    const candidates = rhymeClasses.get(number);
    if (!candidates) throw new Error(`無法辨認韻類 R.${rhymeClass}`);
    if (!/^(?:1|2|\?)$/u.test(String(tone))) throw new Error("聲調須爲 1、2 或 ?");
    const toneMark = String(tone) === "1" ? "¹" : String(tone) === "2" ? "²" : "?";
    const source = /[¹²?]$/u.test(String(onsetSource)) ? String(onsetSource) : String(onsetSource) + toneMark;
    const bootstrap = parseGxSyllable(source);
    const sourceRhyme = bootstrap.vowel.gx + bootstrap.coda;
    const rhyme = candidates.find(candidate => candidate.vowel.gx + candidate.coda === sourceRhyme) || candidates[0];
    const nativeClass = String(options.initialClass || "").toUpperCase();
    const main = ["4", "IV", "Ⅳ"].includes(nativeClass) ? initialByGx.get("ṇ") : bootstrap.main;
    const parsed = {
      ...bootstrap,
      main,
      tone: toneMark,
      vowel: rhyme.vowel,
      coda: rhyme.coda,
      preinitial: rhyme.flags.includes("N"),
      tight: rhyme.flags.includes("T"),
      retroflex: rhyme.flags.includes("R"),
      markedRhyme: false,
      markedRhymeKind: ""
    };
    let result = encodeOnset(parsed) + (rhyme.flags.includes("4") ? GRADE_FOUR_MARK : "") + rhyme.vowel.tibetan;
    if (rhyme.coda === "w") result += "ག༹";
    if (rhyme.coda === "ṃ") result += "མ";
    if (toneMark === "²") result += "ས";
    if (toneMark === "?") result += "?";
    return normalizeTibetan(result);
  }

  function onsetCandidates(vowel) {
    const candidates = [];
    for (const baseSpec of reverseBaseInitials) {
      for (const medial of ["", "w", "y"]) {
        if (baseSpec.builtInWa && medial === "w") continue;
        for (const tight of [false, true]) {
          for (const retroflex of [false, true]) {
            for (const preinitial of [false, true]) {
              const fake = {
                main: initialByGx.get(baseSpec.gx), medial, tight, retroflex, preinitial,
                markedRhyme: false, markedRhymeKind: "", vowel, coda: "", tone: "¹"
              };
              const tibetan = encodeOnset(fake);
              let gxInitial = initialForGrade(baseSpec.gx, vowel.grade);
              let gxMedial = medial;
              if (gxInitial === "vw") {
                gxInitial = "v";
                gxMedial = gxMedial || "w";
              }
              let bareGx = gxInitial + gxMedial;
              if (retroflex && baseSpec.gx !== "r") bareGx = "r" + bareGx;
              const prefix = preinitial ? nasalPrefixFor(baseSpec.gx) : "";
              let gx = prefix + gxInitial + gxMedial;
              if (retroflex && baseSpec.gx !== "r") gx = "r" + gx;
              candidates.push({ tibetan, gx, bareGx, base: baseSpec.gx, medial, tight, retroflex, preinitial });
            }
          }
        }
      }
    }
    return candidates;
  }

  const reverseOnsetsByGrade = new Map();
  for (const grade of [1, 2, 3]) {
    const representative = vowels.find(item => item.grade === grade);
    const map = new Map();
    for (const candidate of onsetCandidates(representative)) {
      if (!map.has(candidate.tibetan)) map.set(candidate.tibetan, candidate);
      else {
        const old = map.get(candidate.tibetan);
        // Resolve spelling collisions in favour of the canonical scheme: tight
        // fixed forms, genuine initials over nasal prefixes, and rVr as an
        // inherent retroflex r initial rather than an unmarked r syllable.
        if (candidate.tight && !old.tight
          || old.preinitial && !candidate.preinitial
          || candidate.base === "r" && candidate.retroflex && !candidate.tight
            && old.base === "r" && !old.retroflex) {
          map.set(candidate.tibetan, candidate);
        }
      }
    }
    reverseOnsetsByGrade.set(grade, map);
  }

  function tibetanSyllableToGx(raw, options = {}) {
    const source = normalizeTibetan(raw).replace(/^་|་$/gu, "").trim();
    if (!source) return "";
    const matches = [];
    const toneOptions = source.endsWith("?")
      ? [{ body: source.slice(0, -1), tone: "?" }]
      : source.endsWith("ས")
        ? [{ body: source.slice(0, -1), tone: "²" }, { body: source, tone: "¹" }]
        : [{ body: source, tone: "¹" }];
    for (const toneOption of toneOptions) {
      const codaOptions = [{ body: toneOption.body, coda: "" }];
      if (toneOption.body.endsWith("ག༹")) codaOptions.unshift({ body: toneOption.body.slice(0, -2), coda: "w" });
      if (toneOption.body.endsWith("མ")) codaOptions.unshift({ body: toneOption.body.slice(0, -1), coda: "ṃ" });
      for (const codaOption of codaOptions) {
        for (const vowel of vowels) {
          if (!codaOption.body.endsWith(vowel.tibetan)) continue;
          const onset = codaOption.body.slice(0, codaOption.body.length - vowel.tibetan.length);
          const candidate = reverseOnsetsByGrade.get(vowel.grade).get(onset);
          if (candidate) matches.push({ vowel, candidate, coda: codaOption.coda, tone: toneOption.tone, gradeFour: false });
          const rhymeKey = vowel.gx + codaOption.coda;
          if (onset.endsWith(GRADE_FOUR_MARK) && GRADE_FOUR_RHYMES.has(rhymeKey)) {
            const gradeFourOnset = onset.slice(0, -GRADE_FOUR_MARK.length);
            const gradeFourCandidate = reverseOnsetsByGrade.get(3).get(gradeFourOnset);
            if (gradeFourCandidate) {
              matches.push({ vowel, candidate: gradeFourCandidate, coda: codaOption.coda, tone: toneOption.tone, gradeFour: true });
            }
          }
        }
      }
    }
    if (!matches.length) throw new Error("不是本方案可辨認的規範藏文音節");
    matches.sort((a, b) => {
      if (a.tone !== b.tone) return a.tone === "²" ? -1 : 1;
      if (a.coda !== b.coda) return a.coda ? -1 : 1;
      return b.vowel.tibetan.length - a.vowel.tibetan.length;
    });
    const { vowel, candidate, coda, tone, gradeFour } = matches[0];
    const markedRhyme = gradeFour || candidate.preinitial && candidate.retroflex && ["e", "ə"].includes(vowel.gx);
    const gxOnset = markedRhyme ? candidate.bareGx : candidate.gx;
    const marker = markedRhyme && options.preserveRhymeClassMarker ? "\\" : "";
    return gxOnset + marker + vowel.gx + coda + (candidate.tight ? "h" : "") + (candidate.retroflex ? "r" : "") + tone;
  }

  const ghcBaseRhymes = new Map([
    ["a̱", "a"], ["aa̱", "ia"], ["a", "ja"],
    ["e̱", "ej"], ["ae̱", "iej"], ["e", "jij"],
    ["i̱", "e"], ["ai̱", "ie"], ["i", "ji"],
    ["o̱", "o"], ["ao̱", "io"], ["o", "jo"],
    ["u̱", "u"], ["au̱", "iu"], ["u", "ju"],
    ["ə̱", "ə"], ["aə̱", "iə"], ["ə", "jɨ"], ["uo", "ioow"]
  ]);
  const ghcPreinitialRhymes = new Map([
    ["u̱", "uu"], ["au̱", "juu"], ["u", "juu"],
    ["i̱", "ee"], ["ai̱", "iee"], ["i", "jii"],
    ["a̱", "aa"], ["aa̱", "iaa"], ["a", "jaa"],
    ["ə̱", "əə"], ["ə", "jɨɨ"],
    ["e̱", "eej"], ["ae̱", "ieej"], ["e", "jiij"],
    ["i̱w", "eew"], ["iw", "jiiw"],
    ["o̱", "oo"], ["ao̱", "ioo"], ["o", "joo"]
  ]);
  const ghcCodaRhymes = new Map([
    ["i̱ṃ", "ẽ"], ["ai̱ṃ", "iẽ"], ["iṃ", "jĩ"],
    ["a̱ṃ", "ã"], ["aa̱ṃ", "iã"], ["aṃ", "jã"],
    ["e̱ṃ", "əj"], ["ae̱ṃ", "iəj"], ["eṃ", "jɨj"],
    ["o̱ṃ", "ow"], ["ao̱ṃ", "iow"], ["oṃ", "jow"], ["u̱ṃ", "ũ"],
    ["i̱w", "ew"], ["ai̱w", "iew"], ["iw", "jiw"], ["ow", "jwo"]
  ]);
  const ghcTightRhymes = new Map([
    ["u̱", "ụ"], ["au̱", "jụ"], ["u", "jụ"],
    ["e̱", "iẹj"], ["ae̱", "iẹj"], ["e", "jịj"], ["eṃ", "jɨ̣j"],
    ["a̱", "ạ"], ["aa̱", "jạ"], ["a", "jạ"],
    ["i̱", "ẹ"], ["ai̱", "iẹ"], ["i", "jị"],
    ["ə̱", "ə̣"], ["aə̱", "jɨ̣"], ["ə", "jɨ̣"],
    ["o̱ṃ", "ọ"], ["o̱", "iọ"], ["o", "jọ"], ["ae̱ṃ", "iə̣j"]
  ]);
  const ghcRetroflexRhymes = new Map([
    ["e̱", "ejr"], ["ae̱", "iejr"], ["e", "jijr"],
    ["u̱", "ur"], ["u", "jur"],
    ["i̱", "er"], ["ai̱", "ier"], ["i", "jir"],
    ["a̱", "ar"], ["aa̱", "iar"], ["a", "jar"], ["aw", "jaar"],
    ["ə̱", "ər"], ["aə̱", "iər"], ["ə", "jɨr"],
    ["i̱w", "ewr"], ["iw", "jiwr"],
    ["o̱", "or"], ["ao̱", "ior"], ["o", "jor"],
    ["o̱ṃ", "owr"], ["oṃ", "jowr"]
  ]);

  function ghcRhymeFor(parsed) {
    const vowel = parsed.vowel.gx;
    const withCoda = vowel + parsed.coda;
    if (parsed.markedRhymeKind === "grade-four") {
      return ghcBaseRhymes.get(withCoda) || ghcCodaRhymes.get(withCoda) || null;
    }
    if (parsed.markedRhyme) return vowel === "e" ? "jiir" : vowel === "ə" ? "jɨɨr" : null;
    if (parsed.preinitial && parsed.retroflex) {
      if (vowel === "e̱") return "eer";
      if (vowel === "a̱") return "aar";
      return null;
    }
    if (parsed.preinitial) return ghcPreinitialRhymes.get(withCoda) || null;
    if (parsed.tight) return ghcTightRhymes.get(withCoda) || null;
    if (parsed.retroflex) return ghcRetroflexRhymes.get(withCoda) || null;
    if (parsed.coda) return ghcCodaRhymes.get(withCoda) || null;
    return ghcBaseRhymes.get(vowel) || null;
  }

  function ghcInitialFor(parsed) {
    const base = chooseBaseInitial(parsed.main.gx);
    let initial = ghcInitialFromBase.get(base) ?? base;
    let medial = parsed.medial === "y" ? "j" : parsed.medial;
    if (base === "v" && medial === "w" && parsed.vowel.grade !== 3) medial = "";
    return initial + medial;
  }

  function gxSyllableToGhc(raw) {
    const parsed = parseGxSyllable(raw);
    const rhyme = ghcRhymeFor(parsed);
    if (!rhyme) throw new Error("此 GX 韻母沒有唯一的 GHC 對應");
    return (ghcInitialFor(parsed) + rhyme + parsed.tone).normalize("NFC");
  }

  const ghcRhymeAnalyses = [];
  for (const vowel of vowels) {
    for (const coda of ["", "w", "ṃ"]) {
      for (const tight of [false, true]) {
        for (const retroflex of [false, true]) {
          for (const preinitial of [false, true]) {
            const candidate = { vowel, coda, tight, retroflex, preinitial, markedRhyme: false, markedRhymeKind: "" };
            const ghc = ghcRhymeFor(candidate);
            if (ghc) ghcRhymeAnalyses.push({ ghc, ...candidate });
          }
        }
      }
    }
  }
  for (const vowel of vowels.filter(item => ["e", "ə"].includes(item.gx))) {
    ghcRhymeAnalyses.push({
      ghc: vowel.gx === "e" ? "jiir" : "jɨɨr",
      vowel, coda: "", tight: false, retroflex: true, preinitial: false, markedRhyme: true, markedRhymeKind: "preposed-a"
    });
  }
  ghcRhymeAnalyses.sort((a, b) => b.ghc.length - a.ghc.length);

  function ghcOnsetCandidates(value) {
    const candidates = [];
    for (const [spelling, base] of ghcBaseFromInitial) {
      for (const [suffix, medial] of [["", ""], ["w", "w"], ["j", "y"]]) {
        if (spelling + suffix === value) candidates.push({ base, medial, explicitInitial: spelling !== "" });
      }
    }
    return candidates.sort((a, b) => Number(b.explicitInitial) - Number(a.explicitInitial));
  }

  function ghcSyllableToGx(raw) {
    const source = String(raw).normalize("NFC").trim();
    const toneMatch = source.match(/([¹²?])$/u);
    if (!toneMatch) throw new Error("GHC 音節須以 ¹、² 或 ? 標示聲調");
    const tone = toneMatch[1];
    let body = source.slice(0, -1);
    let forceClassFourInitial = false;
    if (body.startsWith("\\n")) {
      forceClassFourInitial = true;
      body = "n" + body.slice(2);
    }
    const markerIndex = body.indexOf("\\");
    const markedGradeFour = markerIndex >= 0;
    if (markedGradeFour) {
      if (body.indexOf("\\", markerIndex + 1) >= 0) throw new Error("GHC 音節含有多個反斜線標記");
      body = body.slice(0, markerIndex) + body.slice(markerIndex + 1);
    }
    const canonicalCandidates = [];
    for (const analysis of ghcRhymeAnalyses) {
      if (!body.endsWith(analysis.ghc)) continue;
      const onset = body.slice(0, -analysis.ghc.length);
      for (const onsetCandidate of ghcOnsetCandidates(onset)) {
        if (forceClassFourInitial && onset !== "n") continue;
        const onsetBase = forceClassFourInitial ? "ṇ" : onsetCandidate.base;
        let gxInitial = initialForGrade(onsetBase, analysis.vowel.grade);
        let medial = onsetCandidate.medial;
        if (gxInitial === "vw") {
          gxInitial = "v";
          medial = medial || "w";
        }
        let gxOnset = (analysis.preinitial ? nasalPrefixFor(onsetBase) : "") + gxInitial + medial;
        if (analysis.retroflex && onsetBase !== "r") gxOnset = "r" + gxOnset;
        if (markedGradeFour && markerIndex !== onset.length) continue;
        const rhymeKey = analysis.vowel.gx + analysis.coda;
        if (markedGradeFour && (analysis.preinitial || analysis.tight || analysis.retroflex || !GRADE_FOUR_RHYMES.has(rhymeKey))) continue;
        const marker = analysis.markedRhyme || markedGradeFour ? "\\" : "";
        const canonical = gxOnset + marker + analysis.vowel.gx + analysis.coda
          + (analysis.tight ? "h" : "") + (analysis.retroflex ? "r" : "") + tone;
        try {
          parseGxSyllable(canonical);
          if (!canonicalCandidates.includes(canonical)) canonicalCandidates.push(canonical);
        } catch (_) {
          // Only canonical GX structures are admitted.
        }
      }
      if (canonicalCandidates.length) break;
    }
    if (!canonicalCandidates.length) throw new Error("不符合可辨認的 GHC 音節結構");
    return canonicalCandidates[0];
  }

  function ghcSyllableToTibetan(raw) {
    return gxSyllableToTibetan(ghcSyllableToGx(raw));
  }

  function tibetanSyllableToGhc(raw) {
    return gxSyllableToGhc(tibetanSyllableToGx(raw, { preserveRhymeClassMarker: true }));
  }

  function parseTangutCsv(text) {
    const table = new Map();
    const lines = String(text).replace(/^\uFEFF/u, "").split(/\r?\n/u);
    if ((lines.shift() || "").trim() !== "tangut,tibetan") throw new Error("西夏文轉寫表缺少 tangut,tibetan 表頭");
    for (const line of lines) {
      if (!line.trim()) continue;
      const separator = line.indexOf(",");
      if (separator < 1) throw new Error("西夏文轉寫表含有無效資料列");
      const tangut = line.slice(0, separator);
      const tibetan = line.slice(separator + 1);
      if ([...tangut].length !== 1 || !tibetan) throw new Error("西夏文轉寫表含有無效字元映射");
      if (table.has(tangut) && table.get(tangut) !== tibetan) throw new Error(`西夏字 ${tangut} 有衝突映射`);
      table.set(tangut, tibetan);
    }
    return table;
  }

  function tangutToTibetan(input, table) {
    if (!(table instanceof Map)) throw new Error("西夏文轉寫表尚未載入");
    const source = String(input);
    const token = /[\u{17000}-\u{187FF}\u{18D00}-\u{18D8F}]/gu;
    let output = "";
    let cursor = 0;
    let converted = 0;
    let previousWasSyllable = false;
    const errors = [];
    for (const match of source.matchAll(token)) {
      const gap = source.slice(cursor, match.index);
      const tibetan = table.get(match[0]);
      const currentIsSyllable = Boolean(tibetan);
      if (previousWasSyllable && currentIsSyllable && isSyllableSeparator(gap)) output += TSHEG;
      else output += punctuationToTibetan(gap);
      if (tibetan) {
        output += tibetan;
        converted += 1;
        if (tibetan === "☐") errors.push(`${match[0]}：此字讀音尚未解決`);
      } else {
        output += match[0];
        errors.push(`${match[0]}：轉寫表未收錄此字`);
      }
      previousWasSyllable = currentIsSyllable;
      cursor = match.index + match[0].length;
    }
    output += punctuationToTibetan(source.slice(cursor));
    if (!converted && source.trim() && !errors.length) errors.push("找不到可辨認的西夏字");
    return { output, errors };
  }

  function gxToTibetan(input) {
    const source = normalizeGx(input);
    const token = /(?:[\p{L}\p{M}Ø]|\\(?=[\p{L}\p{M}]))+[¹²?]?/gu;
    let output = "";
    let cursor = 0;
    let converted = 0;
    let previousWasSyllable = false;
    const errors = [];
    for (const match of source.matchAll(token)) {
      const gap = source.slice(cursor, match.index);
      let tokenOutput = match[0];
      let currentIsSyllable = false;
      try {
        const canonicalGx = /[¹²?]$/u.test(match[0]) ? match[0] : parseXunpin(match[0]);
        tokenOutput = gxSyllableToTibetan(canonicalGx);
        currentIsSyllable = true;
      } catch (error) {
        errors.push(`${match[0]}：${error.message}`);
      }
      if (previousWasSyllable && currentIsSyllable && isSyllableSeparator(gap)) output += TSHEG;
      else output += punctuationToTibetan(gap);
      output += tokenOutput;
      converted += 1;
      previousWasSyllable = currentIsSyllable;
      cursor = match.index + match[0].length;
    }
    output += punctuationToTibetan(source.slice(cursor));
    if (!converted && source.trim()) errors.push("找不到可辨認的 GX 或勳拼音節");
    return { output, errors };
  }

  function ghcToTibetan(input) {
    const source = String(input).normalize("NFC");
    const token = /[\p{L}\p{M}·\\]+[¹²?]/gu;
    let output = "";
    let cursor = 0;
    let converted = 0;
    let previousWasSyllable = false;
    const errors = [];
    for (const match of source.matchAll(token)) {
      const gap = source.slice(cursor, match.index);
      let tokenOutput = match[0];
      let currentIsSyllable = false;
      try {
        tokenOutput = ghcSyllableToTibetan(match[0]);
        currentIsSyllable = true;
      } catch (error) {
        errors.push(`${match[0]}：${error.message}`);
      }
      if (previousWasSyllable && currentIsSyllable && isSyllableSeparator(gap)) output += TSHEG;
      else output += punctuationToTibetan(gap);
      output += tokenOutput;
      converted += 1;
      previousWasSyllable = currentIsSyllable;
      cursor = match.index + match[0].length;
    }
    output += punctuationToTibetan(source.slice(cursor));
    if (!converted && source.trim()) errors.push("找不到以 ¹、² 或 ? 結尾的 GHC 音節");
    return { output, errors };
  }

  function isSyllableSeparator(value) {
    return [...value].every(character => /\s/u.test(character) || QUOTES.has(character));
  }

  function punctuationToTibetan(value) {
    let output = "";
    for (let index = 0; index < value.length;) {
      if (value.startsWith("\\?", index)) {
        output += NYIS_SHAD + " ";
        index += 2;
        continue;
      }
      if (value.startsWith("...", index)) {
        let end = index + 3;
        while (value[end] === ".") end += 1;
        output += value.slice(index, end);
        index = end;
        continue;
      }
      const character = String.fromCodePoint(value.codePointAt(index));
      index += character.length;
      if (/\s/u.test(character) || QUOTES.has(character)) continue;
      if (character === "…" || BOX_MARKS.has(character)) {
        output += character;
      } else if (/[.。?？!！]/u.test(character)) {
        output += NYIS_SHAD + " ";
      } else if (/[,，;；:：、]/u.test(character) || /\p{P}/u.test(character)) {
        output += SHAD + " ";
      } else {
        output += character;
      }
    }
    return output;
  }

  function tibetanToTranscription(input, convertSyllable) {
    const source = normalizeTibetan(input);
    const parts = source.split(/(༎|།།|།|་|\s+)/u);
    const errors = [];
    const output = [];
    let needSpace = false;
    for (const part of parts) {
      if (!part) continue;
      if (/^(་|\s+)$/u.test(part)) {
        needSpace = output.length > 0;
        continue;
      }
      if (part === "༎" || part === "།།" || part === "།") {
        if (output.length && output[output.length - 1] === " ") output.pop();
        output.push(part === "།" ? "," : ".");
        needSpace = true;
        continue;
      }
      if (needSpace && output.length && output[output.length - 1] !== " ") output.push(" ");
      try {
        const uncertain = part.endsWith("†");
        const syllable = uncertain ? part.slice(0, -1) : part;
        output.push(convertSyllable(syllable) + (uncertain ? "†" : ""));
      } catch (error) {
        errors.push(`${part}：${error.message}`);
        output.push(part);
      }
      needSpace = false;
    }
    return { output: output.join("").trim(), errors };
  }

  function tibetanToGx(input, options = {}) {
    return tibetanToTranscription(input, part => tibetanSyllableToGx(part, options));
  }

  function tibetanToGhc(input) {
    return tibetanToTranscription(input, tibetanSyllableToGhc);
  }

  return {
    normalizeGx,
    normalizeTibetan,
    parseGxSyllable,
    parseXunpin,
    ghcSyllableToGx,
    gxSyllableToTibetan,
    rhymeClassToTibetan,
    gxSyllableToGhc,
    ghcSyllableToTibetan,
    tibetanSyllableToGx,
    tibetanSyllableToGhc,
    parseTangutCsv,
    tangutToTibetan,
    gxToTibetan,
    ghcToTibetan,
    tibetanToGx,
    tibetanToGhc
  };
});

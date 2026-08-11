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
  const SUB_YA = "ྱ";
  const SUB_A = "ྸ";
  const SUPER_SA = "ས";
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
      .replace(/["“”'‘’「」『』]/gu, "");
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

    return { source, tone, retroflex, tight, coda, vowel, main, medial, preinitial };
  }

  function encodeOnset(parsed) {
    const base = chooseBaseInitial(parsed.main.gx);
    const spec = initialByGx.get(base === "" ? "Ø" : base);
    let onset = parsed.preinitial ? "འ" : "";
    if (parsed.retroflex) onset += "ར";
    if (parsed.tight) onset += SUPER_SA;
    if (parsed.retroflex || parsed.tight) {
      onset += base === "Ø" || (parsed.retroflex && base === "r")
        ? SUB_A
        : subjoined.get(spec.letter);
    } else {
      onset += spec.letter;
    }
    if (spec.builtInWa) onset += SUB_WA;
    if (parsed.medial === "w") onset += SUB_WA;
    if (parsed.medial === "y") onset += SUB_YA;
    if (spec.tsaPhru) onset += TSA_PHRU;
    return onset;
  }

  function gxSyllableToTibetan(raw) {
    const parsed = parseGxSyllable(raw);
    let result = encodeOnset(parsed) + parsed.vowel.tibetan;
    if (parsed.coda === "w") result += "ག༹";
    if (parsed.coda === "ṃ") result += "མ";
    if (parsed.tone === "²") result += "ས";
    if (parsed.tone === "?") result += "?";
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
                vowel, coda: "", tone: "¹"
              };
              const tibetan = encodeOnset(fake);
              let gxInitial = initialForGrade(baseSpec.gx, vowel.grade);
              let gxMedial = medial;
              if (gxInitial === "vw") {
                gxInitial = "v";
                gxMedial = gxMedial || "w";
              }
              const prefix = preinitial ? nasalPrefixFor(baseSpec.gx) : "";
              let gx = prefix + gxInitial + gxMedial;
              if (retroflex && baseSpec.gx !== "r") gx = "r" + gx;
              candidates.push({ tibetan, gx, base: baseSpec.gx, medial, tight, retroflex, preinitial });
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
        // Prefer the analysis used by the published examples: nye = n + y,
        // and prefer a real initial over a nasal-prefix analysis on collisions.
        if (old.preinitial && !candidate.preinitial) map.set(candidate.tibetan, candidate);
      }
    }
    reverseOnsetsByGrade.set(grade, map);
  }

  function tibetanSyllableToGx(raw) {
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
          if (candidate) matches.push({ vowel, candidate, coda: codaOption.coda, tone: toneOption.tone });
        }
      }
    }
    if (!matches.length) throw new Error("不是本方案可辨認的規範藏文音節");
    matches.sort((a, b) => {
      if (a.tone !== b.tone) return a.tone === "²" ? -1 : 1;
      if (a.coda !== b.coda) return a.coda ? -1 : 1;
      return b.vowel.tibetan.length - a.vowel.tibetan.length;
    });
    const { vowel, candidate, coda, tone } = matches[0];
    return candidate.gx + vowel.gx + coda + (candidate.tight ? "h" : "") + (candidate.retroflex ? "r" : "") + tone;
  }

  function gxToTibetan(input) {
    const source = normalizeGx(input);
    const token = /[\p{L}\p{M}Ø]+[¹²?]?/gu;
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

  function tibetanToGx(input) {
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
        output.push(tibetanSyllableToGx(part));
      } catch (error) {
        errors.push(`${part}：${error.message}`);
        output.push(part);
      }
      needSpace = false;
    }
    return { output: output.join("").trim(), errors };
  }

  return {
    normalizeGx,
    normalizeTibetan,
    parseGxSyllable,
    parseXunpin,
    gxSyllableToTibetan,
    tibetanSyllableToGx,
    gxToTibetan,
    tibetanToGx
  };
});

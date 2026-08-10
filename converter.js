(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.GxTibetan = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const TSA_PHRU = "༹";
  const TSHEG = "་";
  const SHAD = "།";
  const SUB_WA = "ྭ";
  const SUB_YA = "ྱ";
  const SUB_HA = "ྷ";
  const SUB_A = "ྸ";

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
    ["y", "ཡ"], ["r", "ར"], ["h", "ཧ"], ["w", "ཧ", false, true],
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
    ["h", "ཧ", false], ["w", "ཧ", false, true], ["m", "མ", false],
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
    let value = String(input);
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
    if (parsed.retroflex) {
      onset += "ར";
      onset += base === "r" || base === "Ø" ? SUB_A : subjoined.get(spec.letter);
    } else {
      onset += spec.letter;
    }
    if (spec.builtInWa) onset += SUB_WA;
    if (parsed.medial === "w") onset += SUB_WA;
    if (parsed.medial === "y") onset += SUB_YA;
    if (parsed.tight) onset += SUB_HA;
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
    let gxOnset = candidate.gx;
    if (!candidate.preinitial && !candidate.retroflex && candidate.base === "h" && candidate.medial === "w" &&
        ["o̱", "u̱"].includes(vowel.gx)) gxOnset = "w";
    return gxOnset + vowel.gx + coda + (candidate.tight ? "h" : "") + (candidate.retroflex ? "r" : "") + tone;
  }

  function gxToTibetan(input) {
    const source = normalizeGx(input);
    const token = /[\p{L}\p{M}Ø]+[¹²?]/gu;
    let output = "";
    let cursor = 0;
    let converted = 0;
    const errors = [];
    for (const match of source.matchAll(token)) {
      const gap = source.slice(cursor, match.index);
      if (converted && /^\s*$/u.test(gap)) output += TSHEG;
      else output += punctuationToTibetan(gap);
      try {
        output += gxSyllableToTibetan(match[0]);
      } catch (error) {
        errors.push(`${match[0]}：${error.message}`);
        output += match[0];
      }
      converted += 1;
      cursor = match.index + match[0].length;
    }
    output += punctuationToTibetan(source.slice(cursor));
    if (!converted && source.trim()) errors.push("找不到以 ¹、² 或 ? 結尾的 GX 音節");
    return { output, errors };
  }

  function punctuationToTibetan(value) {
    return value
      .replace(/\s+/gu, "")
      .replace(/[，,；;]/gu, SHAD)
      .replace(/[。\.]/gu, SHAD + SHAD);
  }

  function tibetanToGx(input) {
    const source = normalizeTibetan(input);
    const parts = source.split(/(།།|།|་|\s+)/u);
    const errors = [];
    const output = [];
    let needSpace = false;
    for (const part of parts) {
      if (!part) continue;
      if (/^(་|\s+)$/u.test(part)) {
        needSpace = output.length > 0;
        continue;
      }
      if (part === "།།" || part === "།") {
        if (output.length && output[output.length - 1] === " ") output.pop();
        output.push(part === "།།" ? "." : ",");
        needSpace = true;
        continue;
      }
      if (needSpace && output.length && !/[,.]$/u.test(output[output.length - 1])) output.push(" ");
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
    gxSyllableToTibetan,
    tibetanSyllableToGx,
    gxToTibetan,
    tibetanToGx
  };
});

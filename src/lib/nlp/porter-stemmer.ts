/**
 * Porter Stemmer (Porter, 1980) — TypeScript port.
 * Reduces inflected words to their root form (e.g. "running" -> "run",
 * "happily" -> "happili", "organizations" -> "organ").
 *
 * Reference: M.F. Porter, "An algorithm for suffix stripping", 1980.
 * This is a compact, correct implementation of the classic 5-step algorithm.
 */

function isConsistentLetter(word: string, i: number): boolean {
  const ch = word[i];
  if (ch === 'a' || ch === 'e' || ch === 'i' || ch === 'o' || ch === 'u') return false;
  if (ch === 'y') {
    if (i === 0) return true;
    return !isConsistentLetter(word, i - 1);
  }
  return true;
}

/** Count "measure" m — number of VC sequences between 0 and j. */
function measure(word: string, j: number): number {
  let n = 0;
  let i = 0;
  while (i < j) {
    if (!isConsistentLetter(word, i)) break;
    i++;
  }
  if (i >= j) return 0;
  i++;
  while (i < j) {
    while (i < j && isConsistentLetter(word, i)) i++;
    if (i >= j) break;
    n++;
    while (i < j && !isConsistentLetter(word, i)) i++;
  }
  return n;
}

/** Has vowel in stem [0, j)? */
function containsVowel(word: string, j: number): boolean {
  for (let i = 0; i < j; i++) if (!isConsistentLetter(word, i)) return true;
  return false;
}

/** Stem ends with double consonant at position j-1, j? */
function endsDoubleConsonant(word: string, j: number): boolean {
  if (j < 2) return false;
  if (word[j - 1] !== word[j - 2]) return false;
  return isConsistentLetter(word, j - 1);
}

/** Stem ends with "cvc" where the last c is not w, x, or y? */
function endsCvc(word: string, j: number): boolean {
  if (j < 3) return false;
  if (isConsistentLetter(word, j - 1)) return false;
  if (!isConsistentLetter(word, j - 2)) return true;
  if (!isConsistentLetter(word, j - 3)) return false;
  const last = word[j - 1];
  if (last === 'w' || last === 'x' || last === 'y') return false;
  return true;
}

/**
 * Apply the Porter stemming algorithm.
 * @param word lowercase alphabetic word
 * @returns stemmed word
 */
export function porterStemmer(word: string): string {
  if (word.length <= 2) return word;
  let w = word;

  // ---- Step 1a ----
  if (w.endsWith('sses')) w = w.slice(0, -2);
  else if (w.endsWith('ies')) w = w.slice(0, -2);
  else if (w.endsWith('ss')) { /* keep */ }
  else if (w.endsWith('s')) w = w.slice(0, -1);

  // ---- Step 1b ----
  let flag = false;
  if (w.endsWith('eed')) {
    const j = w.length - 3;
    if (measure(w, j) > 0) w = w.slice(0, -1);
  } else if (w.endsWith('ed')) {
    const j = w.length - 2;
    if (containsVowel(w, j)) {
      w = w.slice(0, -2);
      flag = true;
    }
  } else if (w.endsWith('ing')) {
    const j = w.length - 3;
    if (containsVowel(w, j)) {
      w = w.slice(0, -3);
      flag = true;
    }
  }
  if (flag) {
    if (w.endsWith('at') || w.endsWith('bl') || w.endsWith('iz')) {
      w = w + 'e';
    } else if (endsDoubleConsonant(w, w.length) && !'lsz'.includes(w[w.length - 1])) {
      w = w.slice(0, -1);
    } else if (measure(w, w.length) === 1 && endsCvc(w, w.length)) {
      w = w + 'e';
    }
  }

  // ---- Step 1c ----
  if (w.endsWith('y') && containsVowel(w, w.length - 1)) {
    w = w.slice(0, -1) + 'i';
  }

  // ---- Step 2 ----
  const step2: [string, string][] = [
    ['ational', 'ate'], ['tional', 'tion'], ['enci', 'ence'], ['anci', 'ance'],
    ['izer', 'ize'], ['abli', 'able'], ['alli', 'al'], ['entli', 'ent'],
    ['eli', 'e'], ['ousli', 'ous'], ['ization', 'ize'], ['ation', 'ate'],
    ['ator', 'ate'], ['alism', 'al'], ['iveness', 'ive'], ['fulness', 'ful'],
    ['ousness', 'ous'], ['aliti', 'al'], ['iviti', 'ive'], ['biliti', 'ble'],
  ];
  for (const [suf, repl] of step2) {
    if (w.endsWith(suf)) {
      const j = w.length - suf.length;
      if (measure(w, j) > 0) w = w.slice(0, j) + repl;
      break;
    }
  }

  // ---- Step 3 ----
  const step3: [string, string][] = [
    ['icate', 'ic'], ['ative', ''], ['alize', 'al'], ['iciti', 'ic'],
    ['ical', 'ic'], ['ful', ''], ['ness', ''],
  ];
  for (const [suf, repl] of step3) {
    if (w.endsWith(suf)) {
      const j = w.length - suf.length;
      if (measure(w, j) > 0) w = w.slice(0, j) + repl;
      break;
    }
  }

  // ---- Step 4 ----
  const step4 = [
    'al', 'ance', 'ence', 'er', 'ic', 'able', 'ible', 'ant', 'ement',
    'ment', 'ent', 'ou', 'ism', 'ate', 'iti', 'ous', 'ive', 'ize',
  ];
  let didStep4 = false;
  for (const suf of step4) {
    if (w.endsWith(suf)) {
      const j = w.length - suf.length;
      if (measure(w, j) > 1) {
        w = w.slice(0, j);
        didStep4 = true;
      }
      break;
    }
  }
  // Special "ion" rule — only if preceded by s or t.
  if (!didStep4 && w.endsWith('ion')) {
    const j = w.length - 3;
    if (measure(w, j) > 1 && (w[j - 1] === 's' || w[j - 1] === 't')) {
      w = w.slice(0, j);
    }
  }

  // ---- Step 5a ----
  if (w.endsWith('e')) {
    const j = w.length - 1;
    const m = measure(w, j);
    if (m > 1 || (m === 1 && !endsCvc(w, j))) {
      w = w.slice(0, -1);
    }
  }

  // ---- Step 5b ----
  if (measure(w, w.length) > 1 && endsDoubleConsonant(w, w.length) && w.endsWith('l')) {
    w = w.slice(0, -1);
  }

  return w;
}

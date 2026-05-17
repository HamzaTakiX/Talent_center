import { normalizeText } from './normalizeText';

export interface FuzzyMatchResult {
  score: number;
  matchedIndices: number[];
}

const WORD_BOUNDARY_BONUS = 12;
const STARTS_WITH_BONUS = 18;
const EXACT_BONUS = 40;
const CONSECUTIVE_BONUS = 3;

/** Subsequence fuzzy match with scoring — fast enough for hundreds of items */
export const fuzzyMatch = (query: string, target: string): FuzzyMatchResult | null => {
  const q = normalizeText(query);
  const t = normalizeText(target);

  if (!q) return { score: 0, matchedIndices: [] };
  if (!t) return null;

  if (t === q) {
    return { score: EXACT_BONUS + t.length, matchedIndices: Array.from({ length: t.length }, (_, i) => i) };
  }

  if (t.startsWith(q)) {
    return {
      score: STARTS_WITH_BONUS + q.length * 2,
      matchedIndices: Array.from({ length: q.length }, (_, i) => i),
    };
  }

  if (t.includes(q)) {
    const start = t.indexOf(q);
    return {
      score: 20 + q.length,
      matchedIndices: Array.from({ length: q.length }, (_, i) => start + i),
    };
  }

  const words = t.split(/\s+/);
  let wordBonus = 0;
  const wordIndices: number[] = [];
  let offset = 0;
  for (const word of words) {
    if (word.startsWith(q)) {
      wordBonus += WORD_BOUNDARY_BONUS;
      for (let i = 0; i < q.length; i++) wordIndices.push(offset + i);
    }
    offset += word.length + 1;
  }
  if (wordBonus > 0) {
    return { score: wordBonus + q.length, matchedIndices: wordIndices };
  }

  let qi = 0;
  let consecutive = 0;
  let maxConsecutive = 0;
  const indices: number[] = [];
  let score = 0;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      indices.push(ti);
      if (ti > 0 && indices.length > 1 && indices[indices.length - 2] === ti - 1) {
        consecutive++;
        maxConsecutive = Math.max(maxConsecutive, consecutive);
      } else {
        consecutive = 0;
      }
      if (ti === 0 || t[ti - 1] === ' ' || t[ti - 1] === '-' || t[ti - 1] === '/') {
        score += 4;
      }
      qi++;
    }
  }

  if (qi < q.length) return null;

  score += maxConsecutive * CONSECUTIVE_BONUS + indices.length;
  const spread = (indices[indices.length - 1] ?? 0) - (indices[0] ?? 0);
  score -= spread * 0.5;

  return { score, matchedIndices: indices };
};

const scoreSingleToken = (
  token: string,
  title: string,
  subtitle: string | undefined,
  keywords: string[],
  priority: number
): FuzzyMatchResult | null => {
  const titleMatch = fuzzyMatch(token, title);
  if (titleMatch) {
    return {
      score: titleMatch.score + priority + (subtitle ? 0 : 5),
      matchedIndices: titleMatch.matchedIndices,
    };
  }

  if (subtitle) {
    const subMatch = fuzzyMatch(token, subtitle);
    if (subMatch) {
      return {
        score: subMatch.score * 0.85 + priority,
        matchedIndices: [],
      };
    }
  }

  for (const kw of keywords) {
    const kwMatch = fuzzyMatch(token, kw);
    if (kwMatch) {
      return {
        score: kwMatch.score * 0.7 + priority,
        matchedIndices: [],
      };
    }
  }

  return null;
};

/** Every query token must match at least one field (title, subtitle, or keyword). */
export const scoreSearchItem = (
  query: string,
  title: string,
  subtitle: string | undefined,
  keywords: string[],
  priority: number
): FuzzyMatchResult | null => {
  const normalized = normalizeText(query);
  if (!normalized) return { score: priority, matchedIndices: [] };

  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (tokens.length <= 1) {
    return scoreSingleToken(tokens[0] ?? normalized, title, subtitle, keywords, priority);
  }

  let totalScore = 0;
  let titleIndices: number[] = [];

  for (const token of tokens) {
    const match = scoreSingleToken(token, title, subtitle, keywords, priority);
    if (!match) return null;
    totalScore += match.score;
    if (match.matchedIndices.length > 0) titleIndices = match.matchedIndices;
  }

  return {
    score: totalScore + tokens.length * 2,
    matchedIndices: titleIndices,
  };
};

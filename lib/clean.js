/**
 * TOFLIT18 Cleaner Utility
 * =========================
 *
 * Simple data cleaning function (@gdaudin).
 */
const DOUBLE_QUOTES = /[«»„‟“”"]/g,
  SIMPLE_QUOTES = /[’‘`‛']/g;

export function cleanText(str) {
  return (str || "")
    .trim()
    .replace(/…/g, "...")
    .replace(/–/g, "-")
    .replace(DOUBLE_QUOTES, '"')
    .replace(SIMPLE_QUOTES, "'")
    .replace(/\s+/g, " ");
}

export function cleanNumber(nb) {
  nb = "" + nb.trim();

  // No nb, let's return null
  if (!nb) return null;

  // Cleaning the string representation
  nb = nb.replace(/[,，、،﹐﹑]/g, ".").replace(/\s/g, "");

  // Can we coerce correctly
  const coerced = +nb;

  // If the number is invalid, we drop it
  if (isNaN(coerced)) return null;
  else return coerced;
}

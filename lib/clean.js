/**
 * TOFLIT18 Cleaner Utility
 * =========================
 *
 * Simple data cleaning function (@gdaudin).
 */
const DOUBLE_QUOTES = /[«»„‟“”"]/g,
      SIMPLE_QUOTES = /[’‘`‛']/g;

export function cleanText(str) {
  return (str || '')
    .trim()
    .replace(/…/g, '...')
    .replace(DOUBLE_QUOTES, '"')
    .replace(SIMPLE_QUOTES, '\'')
    .replace(/\s+/g, ' ');
}

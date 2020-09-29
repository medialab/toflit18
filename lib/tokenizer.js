/**
 * TOFLIT18 Tokenizer
 * ===================
 *
 * Some tokenizers to apply on the project's data.
 */
import { capitalize, words } from "lodash";

const DIGITS = /\d/;

const BLACK_LIST = new Set([
  "a",
  "à",
  "d",
  "de",
  "des",
  "du",
  "en",
  "et",
  "le",
  "la",
  "les",
  "ou",
  "pour",
  "un",
  "une",
  "dont",
]);

BLACK_LIST.forEach(item => {
  BLACK_LIST.add(capitalize(item));
});

export function tokenizeTerms(expression) {
  return words(expression)
    .map(capitalize)
    .filter(word => !BLACK_LIST.has(word))
    .filter(word => !DIGITS.test(word));
}

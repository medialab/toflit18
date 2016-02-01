/**
 * TOFLIT18 Tokenizer
 * ===================
 *
 * Some tokenizers to apply on the project's data.
 */
import _, {words} from 'lodash';

const BLACK_LIST = new Set([
  'à',
  'd',
  'de',
  'des',
  'du',
  'en',
  'et',
  'le',
  'la',
  'les',
  'ou',
  'pour',
  'un',
  'une'
]);

export function tokenizeTerms(expression) {
  return words(expression).filter(word => !BLACK_LIST.has(word));
}

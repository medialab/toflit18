/**
 * TOFLIT18 Tokenizer
 * ===================
 *
 * Some tokenizers to apply on the project's data.
 */
import _, {words} from 'lodash';

export function tokenizeTerms(expression) {
  return words(expression);
}

/**
 * TOFLIT18 Tokenizer
 * ===================
 *
 * Some tokenizers to apply on the project's data.
 */
import _, {words} from 'lodash';

export function tokenizeTerms(expressions) {
  const terms = _(expressions)
    .map(words)
    .flatten()
    .uniq()
    .value();

  return terms;
}

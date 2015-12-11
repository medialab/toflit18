/**
 * TOFLIT18 API Helpers
 * =====================
 */
import regexEscape from 'escape-regexp';

export function searchRegex(query) {
  return '(?ius).*' + regexEscape(query) + '.*';
}

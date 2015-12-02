/**
 * TOFLIT18 Client Helpers
 * ========================
 *
 * Miscellaneous client helper functions.
 */
import {chunk} from 'lodash';

/**
 * Flatten a recursive classification tree.
 */
export function flattenTree(branch, list=[], level=0) {

  if (!Object.keys(branch).length)
    return list;

  list.push({...branch, level});

  (branch.children || []).forEach(c => flattenTree(c, list, level + 1));

  return list;
}

/**
 * Pretty print the given number: 10000.50 => "10 000.50"
 */
export function prettyPrint(nb) {
  const [beforeDecimal, afterDecimal] = ('' + nb).split('.');

  const pretty = chunk(('' + beforeDecimal).split('').reverse(), 3)
    .reverse()
    .map(s => s.reverse().join(''))
    .join(' ');

  return pretty + (afterDecimal ? '.' + afterDecimal : '');
}

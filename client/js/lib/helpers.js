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
 * Pretty print the given number: 10000 => "10 000"
 */
export function prettyPrint(nb) {
  return chunk(('' + nb).split('').reverse(), 3)
    .reverse()
    .map(s => s.reverse().join(''))
    .join(' ');
}

/**
 * TOFLIT18 Client Helpers
 * ========================
 *
 * Miscellaneous client helper functions.
 */
import {chunk, union} from 'lodash';

/**
 * Flatten a recursive classification tree.
 */
export function flattenTree(branch, list = [], level = 0) {

  if (!Object.keys(branch).length)
    return list;

  list.push({...branch, level});

  (branch.children || []).forEach(c => flattenTree(c, list, level + 1));

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

  return pretty + (afterDecimal ? '.' + afterDecimal.slice(0, 2) : '');
}

/**
 * Returns the deep difference between two objects.
 * Example:
 * > diff(
 * >   {a: {b: 1, c: 2}, d: 3, e: 4},
 * >   {a: {b: 1, c: 'abc', G: 'def'}, e: 4}
 * > )
 * would return:
 * > {a: {c: 'abc', G: 'def'}, d: undefined}
 */
export function diff(o1, o2) {
  if (!o1 || !o2) return o2;

  return union(Object.keys(o1), Object.keys(o2))
    .filter(key => o1[key] !== o2[key])
    .reduce(
      (iter, key) => {
        const v1 = o1[key];
        const v2 = o2[key];
        return {
          ...iter,
          [key]: (
            v1 && v2 &&
            typeof v1 === 'object' && typeof v2 === 'object' &&
            !Array.isArray(v1) && !Array.isArray(v2)
          ) ? diff(v1, v2) : v2
        };
      },
      {}
    );
}


/**
 * Helpers to manipulate regex select values (when the user uses a custom string
 * rather than an existing product or partner in some selector):
 */
export function stringToRegexId(str) {
  return 're::' + str;
}
export function stringToRegexLabel(str, type) {
  let query = ` '${str}'`;
  if (str === '') {
    query = '...';
  }
  return `${type} matching${query}`;
}
export function regexIdToString(str) {
  return (str.match(/^re::(.*)/) || [])[1];
}
export function getValueFromString(str, type, valueKey) {
  return {
    [valueKey]: stringToRegexId(str),
    name: stringToRegexLabel(str, type),
    disabled: str === ''
  };
}

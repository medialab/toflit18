/**
 * TOFLIT18 Client Helpers
 * ========================
 *
 * Miscellaneous client helper functions.
 */
import {chunk} from 'lodash';
import specs from '../../specs.json';

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
 * Build dates selector
 */
export function buildDateMin(dateMin, dateMax) {
  const minArray = [];

  if (dateMin && dateMax) {
    for (let i = dateMin; i < dateMax; i++) {
      minArray.push({name: i, id: i});
    }
  }

  if (dateMin && dateMin.length > 0 && !dateMax) {
    for (let i = dateMin; i < specs.limits.maxYear; i++) {
      minArray.push({name: i, id: i});
    }
  }

  if (!dateMin && dateMax) {
    for (let i = specs.limits.minYear; i < dateMax; i++) {
      minArray.push({name: i, id: i});
    }
  }

  if (!dateMax && dateMin) {
    for (let i = dateMin; i < specs.limits.maxYear; i++) {
      minArray.push({name: i, id: i});
    }
  }

  if (!dateMax && !dateMin) {
    for (let i = specs.limits.minYear; i < specs.limits.maxYear; i++) {
      minArray.push({name: i, id: i});
    }
  }

  return minArray;
}

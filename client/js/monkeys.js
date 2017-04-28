/**
 * TOFLIT18 Client Monkeys
 * =======================
 *
 * Simple functions describing computed data nodes for the state tree.
 */
import {flattenTree} from './lib/helpers';
import {keyBy} from 'lodash';

export function classificationsIndex(data) {
  const {product = [], country = []} = (data || {});
  return keyBy(product.concat(country), 'id');
}

export function flatClassifications(data) {
  const {product, country} = (data || {});

  return {
    product: flattenTree(product || {}),
    country: flattenTree(country || {})
  };
}

export function isLogged(user) {
  return !!user;
}

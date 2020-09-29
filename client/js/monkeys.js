/**
 * TOFLIT18 Client Monkeys
 * =======================
 *
 * Simple functions describing computed data nodes for the state tree.
 */
import { flattenTree } from "./lib/helpers";
import { keyBy } from "lodash";

export function classificationsIndex(data) {
  const { product = [], partner = [] } = data || {};
  return keyBy(product.concat(partner), "id");
}

export function flatClassifications(data) {
  const { product, partner } = data || {};

  return {
    product: flattenTree(product || {}),
    partner: flattenTree(partner || {}),
  };
}

/**
 * TOFLIT18 Globals Actions
 * =========================
 *
 * Actions related to the globals' view.
 */
import { two as palette } from "../lib/palettes";
import { forIn, values } from "lodash";
import { regexIdToString, stringToRegexLabel } from "../lib/helpers";

const ROOT = ["explorationNetworkState"];

/**
 * Selecting a partner classification.
 */
export function selectClassification(tree, classification) {
  const cursor = tree.select(ROOT);

  cursor.set("classification", classification);
}

/**
 * Selecting a node size.
 */
export function selectNodeSize(tree, key) {
  tree.set(ROOT.concat("nodeSize"), key);
}

/**
 * Selecting an edge size.
 */
export function selectEdgeSize(tree, key) {
  tree.set(ROOT.concat("edgeSize"), key);
}

/**
 * Adding a network.
 */
export function addNetwork(tree) {
  const cursor = tree.select(ROOT);

  cursor.set("graph", null);

  // set params for request
  const paramsRequest = {};

  // get selectors choosen
  forIn(cursor.get("selectors"), (v, k) => {
    if (v && k === "product")
      paramsRequest[k] = v.map(id => {
        // Detect custom regex values:
        const regex = regexIdToString(id);
        if (regex) {
          return {
            id: -1,
            name: stringToRegexLabel(regex, k),
            value: regex,
          };
        }
        return cursor.get("groups", "product", { id });
      });
    else paramsRequest[k] = v;
  });

  const classification = cursor.get("classification");

  if (!classification) return;

  cursor.set("loading", true);

  // Fetching data
  tree.client.network({ params: { id: encodeURIComponent(classification) }, data: paramsRequest }, function(err, data) {
    cursor.set("loading", false);

    // NOTE: the API should probably return an empty array somehow
    const result = data.result || [];

    if (data) cursor.set("data", result);

    if (err) return;

    // Treating
    const nodes = {},
      edges = [];

    const kind = cursor.get("selectors", "kind");

    result.forEach(function(row) {
      const regionId = "$d$" + row.region,
        partnerId = "$c$" + row.partner;

      if (!nodes[regionId]) {
        nodes[regionId] = {
          id: regionId,
          label: row.region,
          community: "region",
          color: palette[0],
          size: row.count,
          flows: row.count,
          value: row.value,
          degree: 1,
          x: Math.random(),
          y: Math.random(),
        };
      } else {
        nodes[regionId].degree++;
        nodes[regionId].size += row.count;
        nodes[regionId].flows += row.count;
        nodes[regionId].value += row.value;
      }

      if (!nodes[partnerId]) {
        nodes[partnerId] = {
          id: partnerId,
          label: row.partner,
          community: "partner",
          color: palette[1],
          size: row.count,
          flows: row.count,
          value: row.value,
          degree: 1,
          x: Math.random(),
          y: Math.random(),
        };
      } else {
        nodes[partnerId].degree++;
        nodes[partnerId].size += row.count;
        nodes[partnerId].flows += row.count;
        nodes[partnerId].value += row.value;
      }

      edges.push({
        id: "e" + edges.length,
        size: row.count,
        flows: row.count,
        value: row.value,
        source: kind === "import" ? partnerId : regionId,
        target: kind === "import" ? regionId : partnerId,
      });
    });

    const directed = kind === "import" || kind === "export";

    cursor.set("graph", { nodes: values(nodes), edges, directed });
  });
}

/**
 * Updating a selector.
 */
function fetchGroups(tree, cursor, id) {
  tree.client.groups({ params: { id: encodeURIComponent(id) } }, function(err, data) {
    if (err) return;

    cursor.set(data.result.map(d => ({ ...d, value: d.id })));
  });
}

// see meta or indicator view to change and adapt this function
export function updateSelector(tree, name, item) {
  const selectors = tree.select([...ROOT, "selectors"]),
    groups = tree.select([...ROOT, "groups"]);

  // Updating the correct selector
  selectors.set(name, item);

  // If we updated a classification, we need to reset some things
  if (/classification/i.test(name)) {
    const model = name.match(/(.*?)Classification/)[1];

    selectors.set(model, null);
    groups.set(model, []);

    if (item) {
      fetchGroups(tree, groups.select(model), item);
    }
  }
}

export function selectLabelSizeRatio(tree, key) {
  tree.set(ROOT.concat("labelSizeRatio"), key);
}

export function selectLabelThreshold(tree, key) {
  tree.set(ROOT.concat("labelThreshold"), key);
}

export function checkDefaultState(tree, defaultState) {
  for (const key in defaultState) {
    const path = key.split(".");
    const val = tree.get([...ROOT, ...path]);

    if (!val) {
      tree.set([...ROOT, ...path], defaultState[key]);
    }
  }
}

/**
 * TOFLIT18 Globals Actions
 * =========================
 *
 * Actions related to the globals' view.
 */

import { uniq, forIn } from "lodash";

import { regexIdToString, stringToRegexLabel } from "../lib/helpers";


const ROOT = ["explorationFlowsState"];


/**
 * Updating a selector.
 */
function fetchGroups(tree, cursor, id, callback) {
  tree.client.groups({ params: { id: encodeURIComponent(id) } }, function(err, data) {
    if (err) return callback ? callback(err) : null;
    
    cursor.set(data.result.map(d => ({ ...d, value: d.id })));

    if (callback) callback();
  });
}

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

    if (item) fetchGroups(tree, groups.select(model), item);
  }
}

function prepareParams(tree){

  const cursor = tree.select(ROOT), groups = cursor.get("groups");
   // set params for request
   const params = {},
   paramsRequest = {};

 // get selectors choosen
 forIn(cursor.get("selectors"), (v, k) => {
   if (v) {
     params[k] = v;
   }
 });

 // keep only params !== null for request
 forIn(params, (v, k) => {
   if (v && (k === "product" || k === "partner")){
     paramsRequest[k] = v
       .map(id => {
         // Detect custom regex values:
         const regex = regexIdToString(id);
         if (regex) {
           return {
             id: -1,
             name: stringToRegexLabel(regex, "partner"),
             value: regex,
           };
         }
         return (groups[k] || []).find(o => o.id === id);
       })
       .filter(o => o);}
   else paramsRequest[k] = v;
 });
 return paramsRequest;
}

export function initFlowTable(tree) {
  const cursor = tree.select(ROOT);
 

  cursor.set("flows", null);
  cursor.set("nbFlows", null);

  const paramsRequest = prepareParams(tree);

  cursor.set("loading", true);
  // load total number of flows
 
    // load data table
    tree.client.flows(({ data: paramsRequest }, function(err, flowsData) {
     
      if (err) return;
      if (flowsData)
        cursor.set("flows", flowsData.result);
      tree.client.countFlows({ data: paramsRequest }, function(err, nbFlowsData) {
        if (err) return;
    
        if (nbFlowsData) {
          cursor.set("nbFlows", nbFlowsData.result[0].nbFlows);
        }
        cursor.set("loading", false);
      });
    
    }));

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

export function checkGroups(tree, callback) {
  const cursor = tree.select(ROOT);
  let loading = 0;
  const handleFetched = () => {
    if (!--loading && callback) callback();
  };

  ["partner", "product"].forEach(type => {
    const classification = cursor.get("selectors", type + "Classification");
    const groups = cursor.select("groups", type);

    if (classification && !(groups.get() || []).length) {
      loading++;
      fetchGroups(tree, groups, classification, handleFetched);
    }
  });

  if (!loading && callback) callback();
}

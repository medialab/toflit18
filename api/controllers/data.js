/**
 * TOFLIT18 Data Controller
 * =========================
 *
 */
import model from "../model/data";
import mapValues from "lodash/mapValues";
import { formatItemsParams } from "./viz";

const controller = [
  {
    url: "/directions",
    method: "GET",
    action(req, res) {
      model.directions(function(err, directions) {
        if (err) return res.serverError(err);

        return res.ok(directions);
      });
    },
  },
  {
    url: "/source_types",
    method: "GET",
    cache: "sourceTypes",
    action(req, res) {
      model.sourceTypes(function(err, sourceTypes) {
        if (err) return res.serverError(err);

        return res.ok(sourceTypes);
      });
    },
  },
  {
    url: "/flows",
    method: "POST",
    // validate: {
    //   query: {
    //     sourceType: '?string',
    //     productClassification: '?string',
    //     product: '?string',
    //     partnerClassification: '?string',
    //     partner: '?string',
    //     direction: '?string',
    //     kind: '?string'
    //     dateMin: '?string',
    //     dateMax: '?string',
    //     valueMin: '?string',
    //     valueMax: '?string',
    //     skip: '?number',
    //     limit: '?number',
    //     orders: '?{key:string, order:string}[]
    //     columns: '?string[]'
    //   }
    //   }
    // },
    action(req, res) {
      const payloadFlows = mapValues(req.body, (v, k) => {
        if (k === "product" || k === "partner") {
          // separate filters on id from those on name trhough regexp
          return formatItemsParams(v);
        }

        return v;
      });
      return model.flows(payloadFlows, function(err, data) {
        if (err) return res.serverError(err);

        return res.ok(data);
      });
    },
  },
  {
    url: "/countFlows",
    method: "POST",
    // validate: {
    //   query: {
    //     sourceType: '?string',
    //     productClassification: '?string',
    //     product: '?string',
    //     partnerClassification: '?string',
    //     partner: '?string',
    //     direction: '?string',
    //     kind: '?string'
    //     dateMin: '?string',
    //     dateMax: '?string',
    //     valueMin: '?string',
    //     valueMax: '?string'
    //   }
    //   }
    // },
    action(req, res) {
      const payloadFlows = mapValues(req.body, (v, k) => {
        if (k === "product" || k === "partner") {
          // separate filters on id from those on name trhough regexp
          return formatItemsParams(v);
        }

        return v;
      });
      return model.countFlows(payloadFlows, function(err, data) {
        if (err) return res.serverError(err);

        return res.ok(data);
      });
    },
  },
  {
    url: "/lastCommits",
    method: "GET",
    action(req, res) {
      model.lastCommits(function(err, commits) {
        if (err) return res.serverError(err);
        return res.ok(commits.map(c => c.c.properties));
      });
    },
  },
];

export default controller;

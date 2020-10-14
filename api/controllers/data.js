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
      // TODO : remove this force limit max to 500
      console.log(payloadFlows)
      payloadFlows.limit = 500
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
];

export default controller;

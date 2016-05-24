/**
 * TOFLIT18 Classification Controller
 * ===================================
 *
 */
import model from '../model/viz';
import modelFlowsPerYear from '../model/flowsPerYear';
import modelAvailableData from '../model/availableData';
import {mapValues} from 'lodash';

const controller = [
  {
    url: '/per_year/:type',
    method: 'GET',
    validate: {
      query: {
        sourceType: '?string',
        productClassification: '?string',
        product: '?string',
        countryClassification: '?string',
        country: '?string',
        direction: '?string',
        kind: '?string'
      }
    },
    // cache: {
    //   key: 'perYear',
    //   hasher(req) {
    //     return req.params.type;
    //   }
    // },
    action(req, res) {
      const payloadPerYear = mapValues(req.query, (v, k) => {
        if (v !== 'null') {
          return k !== 'kind' && k !== 'sourceType' ? +v : v;
        }
        else
          console.log(v, k);

      });

      return modelAvailableData.availableDataTypePerYear(req.params.type, payloadPerYear, function(err, data) {
        if (err) return res.serverError(err);

        return res.ok(data);
      });
    }
  },
  {
    url: '/flows_per_year/:type',
    method: 'GET',
    validate: {
      query: {
        sourceType: '?string',
        productClassification: '?string',
        product: '?string',
        countryClassification: '?string',
        country: '?string',
        direction: '?string',
        kind: '?string'
      }
    },
    // cache: {
    //   key: 'flowsPerYear',
    //   hasher(req) {
    //     console.log("hash req", req.params)
    //     return req.params.type;
    //   }
    // },
    action(req, res) {
      const payloadFlows = mapValues(req.query, (v, k) => {
        if (v !== 'null') {
          return k !== 'kind' && k !== 'sourceType' ? +v : v;
        }
        else
          console.log(v, k);

      });

      return modelFlowsPerYear.flowsPerYearPerDataType(req.params.type, payloadFlows, function(err, data) {
        if (err) return res.serverError(err);

        return res.ok(data);
      });
    }
  },
  {
    url: '/line',
    method: 'GET',
    validate: {
      query: {
        sourceType: '?string',
        productClassification: '?string',
        product: '?string',
        countryClassification: '?string',
        country: '?string',
        direction: '?string',
        kind: '?string'
      }
    },
    action(req, res) {
      const payload = mapValues(req.query, (v, k) => {
        return k !== 'kind' && k !== 'sourceType' ? +v : v;
      });

      return model.createLine(payload, function(err, data) {
        if (err) return res.serverError(err);

        return res.ok(data);
      });
    }
  },
  {
    url: '/network/:id',
    method: 'GET',
    cache: {
      key: 'network',
      hasher(req) {
        return req.params.id;
      }
    },
    action(req, res) {
      return model.network(+req.params.id, function(err, data) {
        if (err) return res.serverError(err);

        return res.ok(data);
      });
    }
  },
  {
    url: '/terms/:id',
    method: 'GET',
    cache: {
      key: 'terms',
      hasher(req) {
        return req.params.id;
      }
    },
    action(req, res) {
      return model.terms(+req.params.id, function(err, terms) {
        if (err) return res.serverError(err);
        if (!terms) return res.notFound();

        return res.ok(terms);
      });
    }
  }
];

export default controller;

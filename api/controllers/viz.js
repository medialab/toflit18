/* eslint no-console: 0 */
/**
 * TOFLIT18 Classification Controller
 * ===================================
 *
 */
import modelFlowsPerYear from '../model/flowsPerYear';
import modelCreateLine from '../model/createLine';
import modelTerms from '../model/terms';
import modelNetwork from '../model/country';
import {mapValues} from 'lodash';

const controller = [
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
        else {
          console.log(v, k);
        }
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

      return modelCreateLine.createLine(payload, function(err, data) {
        if (err) return res.serverError(err);

        return res.ok(data);
      });
    }
  },
  {
    url: '/network/:id',
    method: 'GET',
    validate: {
      query: {
        dataType: '?string',
        productClassification: '?string',
        product: '?string',
        countryClassification: '?string',
        kind: '?string',
        dateMin: '?string',
        dateMax: '?string'
      }
    // cache: {
    //   key: 'network',
    //   hasher(req) {
    //     return req.params.id;
    //   }
    },
    action(req, res) {
      const payloadNetwork = mapValues(req.query, (v, k) => {
        if (v !== 'null') {
          return k !== 'kind' && k !== 'sourceType' ? +v : v;
        }
        else {
          console.log(v, k);
        }
      });

      return modelNetwork.network(+req.params.id, payloadNetwork, function(err, data) {
        if (err) return res.serverError(err);

        return res.ok(data);
      });
    }
  },
  {
    url: '/terms/:id',
    method: 'GET',
    validate: {
      query: {
        sourceType: '?string',
        productClassification: '?string',
        product: '?string',
        countryClassification: '?string',
        country: '?string',
        childClassification: '?string',
        child: '?string',
        direction: '?string',
        kind: '?string',
        dateMin: '?string',
        dateMax: '?string'
      }
    },
    // cache: {
    //   key: 'terms',
    //   hasher(req) {
    //     return req.params.id;
    //   }
    // },
    action(req, res) {
      const payloadTerms = mapValues(req.query, (v, k) => {
        if (v !== 'null') {
          return k !== 'kind' && k !== 'sourceType' ? +v : v;
        }
        else {
          console.log(v, k);
        }
      });

      return modelTerms.terms(+req.params.id, payloadTerms, function(err, terms) {
        if (err) return res.serverError(err);
        if (!terms) return res.notFound();

        return res.ok(terms);
      });
    }
  }
];

export default controller;

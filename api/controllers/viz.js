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

const formatItemsParams = (items) => {
    // separate filters on id from those on name trhough regexp
    return items.length > 0 ? {
      ids: items.filter(e => e.id !== -1).map(e => +e.id),
      regexps: items.filter(e => e.id === -1).map(e => e.value)
    } : null
}

const controller = [
  {
    url: '/flows_per_year/:type',
    method: 'POST',
    // validate: {
    //   query: {
    //     sourceType: '?string',
    //     productClassification: '?string',
    //     product: '?string',
    //     countryClassification: '?string',
    //     country: '?string',
    //     direction: '?string',
    //     kind: '?string'
    //   }
    // },
    action(req, res) {
      const payloadFlows = mapValues(req.body, (v, k) => {
        if (k === 'product' || k === 'country'){
          // separate filters on id from those on name trhough regexp
          return formatItemsParams(v)
        }
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
    method: 'POST',
    action(req, res) {
      const payload = mapValues(req.body, (v, k) => {

        if (k === 'product' || k === 'country'){
          // separate filters on id from those on name trhough regexp
          return formatItemsParams(v)
        }

        if (k !== 'kind' && k !== 'sourceType')
          return +v

        return v;
      });

      return modelCreateLine.createLine(payload, function(err, data) {
        if (err) return res.serverError(err);

        return res.ok(data);
      });
    }
  },
  {
    url: '/network/:id',
    method: 'POST',
    // validate: {
    //   query: {
    //     sourceType: '?string',
    //     productClassification: '?string',
    //     product: '?string',
    //     countryClassification: '?string',
    //     kind: '?string',
    //     dateMin: '?string',
    //     dateMax: '?string'
    //   }
    // },
    action(req, res) {
      const payloadNetwork = mapValues(req.body, (v, k) => {
        if (k === 'product' || k === 'country'){
          // separate filters on id from those on name trhough regexp
          return formatItemsParams(v)
        }

        if (v !== 'null') {
          return k !== 'kind' && k !== 'sourceType' ? +v : v;
        }
        else {
          console.log(v, k);
        }
      });

      return modelNetwork.network(req.params.id, payloadNetwork, function(err, data) {
        if (err) return res.serverError(err);

        return res.ok(data);
      });
    }
  },
  {
    url: '/terms/:id',
    method: 'POST',
    // validate: {
    //   query: {
    //     sourceType: '?string',
    //     productClassification: '?string',
    //     product: '?string',
    //     countryClassification: '?string',
    //     country: '?string',
    //     childClassification: '?string',
    //     child: '?string',
    //     direction: '?string',
    //     kind: '?string',
    //     dateMin: '?string',
    //     dateMax: '?string'
    //   }
    // },
    action(req, res) {
      const payloadTerms = mapValues(req.body, (v, k) => {
        if (k === 'child' || k === 'country'){
          // separate filters on id from those on name trhough regexp
          return formatItemsParams(v)
        }
        if (v !== 'null') {
          return k !== 'kind' && k !== 'sourceType' ? +v : v;
        }
        else {
          console.log(v, k);
        }
      });
      return modelTerms.terms(req.params.id, payloadTerms, function(err, terms) {
        if (err) return res.serverError(err);
        if (!terms) return res.notFound();

        return res.ok(terms);
      });
    }
  }
];

export default controller;

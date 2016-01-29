/**
 * TOFLIT18 Classification Controller
 * ===================================
 *
 */
import model from '../model/viz';
import {mapValues} from 'lodash';

const controller = [
  {
    url: '/per_year/:type',
    method: 'GET',
    cache: {
      key: 'perYear',
      hasher(req) {
        return req.params.type;
      }
    },
    action(req, res) {
      return model.availableDataTypePerYear(req.params.type, function(err, data) {
        if (err) return res.serverError(err);

        return res.ok(data);
      });
    }
  },
  {
    url: '/flows_per_year/:type',
    method: 'GET',
    cache: {
      key: 'flowsPerYear',
      hasher(req) {
        return req.params.type;
      }
    },
    action(req, res) {
      return model.flowsPerYearPerDataType(req.params.type, function(err, data) {
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
  }
];

export default controller;

/**
 * TOFLIT18 Classification Controller
 * ===================================
 *
 */
import model from '../model/viz';
import {mapValues} from 'lodash';

const controller = [
  {
    url: '/directions_per_year',
    cache: 'directionsPerYear',
    action(req, res) {
      return model.availableDirectionsPerYear(function(err, data) {
        if (err) return res.serverError(err);

        return res.ok(data);
      });
    }
  },
  {
    url: '/sources_per_directions',
    cache: 'sourcesPerDirections',
    action(req, res) {
      return model.sourcesPerDirections(function(err, data) {
        if (err) return res.serverError(err);

        return res.ok(data);
      });
    }
  },
  {
    url: '/line',
    validate: {
      query: {
        productClassification: '?string',
        product: '?string',
        countryClassification: '?string',
        country: '?string',
        direction: '?string',
        kind: '?string'
      }
    },
    action(req, res) {
      const payload = mapValues(req.query, (v, k) => k !== 'kind' ? +v : v);

      return model.createLine(payload, function(err, data) {
        if (err) return res.serverError(err);

        return res.ok(data);
      });
    }
  },
  {
    url: '/network/:id',
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

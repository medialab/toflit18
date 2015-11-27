/**
 * TOFLIT18 Classification Controller
 * ===================================
 *
 */
import model from '../model/viz';

const controller = [
  {
    url: '/sources_per_directions',
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
      productClassification: '?string',
      product: '?string',
      countryClassification: '?string',
      country: '?string',
      direction: '?string',
      kind: '?string'
    },
    action(req, res) {
      return model.createLine(req.body, function(err, data) {
        if (err) return res.serverError(err);

        return res.ok(data);
      });
    }
  }
];

export default controller;

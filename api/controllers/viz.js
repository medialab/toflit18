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
  }
];

export default controller;

/**
 * TOFLIT18 Data Controller
 * =========================
 *
 */
import model from '../model/data';

const controller = [
  {
    url: '/directions',
    method: 'GET',
    action(req, res) {
      model.directions(function(err, directions) {
        if (err) return res.serverError(err);

        return res.ok(directions);
      });
    }
  }
];

export default controller;

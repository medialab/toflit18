/**
 * TOFLIT18 Classification Controller
 * ===================================
 *
 */
import model from '../model/classification';

const controller = [
  {
    url: '/test',
    action: function(req, res) {
      model.test((err, data) => res.json(data.map(e => ({classified: e.cp.properties}))));
    }
  }
];

export default controller;

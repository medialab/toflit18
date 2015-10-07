/**
 * TOFLIT18 Classification Controller
 * ===================================
 *
 */
import model from '../model/classification';

const controller = [
  {
    url: '/',
    action: function(req, res) {
      return model.getAll(function(err, classifications) {
        if (err) return res.serverError(err);

        return res.ok(classifications);
      });
    }
  },
  {
    url: '/:id/groups',
    action: function(req, res) {
      return model.groups(+req.params.id, {}, function(err, groups) {
        if (err) return res.serverError(err);

        return res.ok(groups);
      });
    }
  }
];

export default controller;

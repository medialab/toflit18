/**
 * TOFLIT18 Classification Controller
 * ===================================
 *
 */
import model from '../model/classification';

const controller = [
  {
    url: '/',
    action(req, res) {
      return model.getAll(function(err, classifications) {
        if (err) return res.serverError(err);

        return res.ok(classifications);
      });
    }
  },
  {
    url: '/:id/groups',
    action(req, res) {
      return model.groups(+req.params.id, {}, function(err, groups) {
        if (err) return res.serverError(err);

        return res.ok(groups);
      });
    }
  },
  {
    url: '/:id/export.:ext',
    validate(req) {
      const ext = req.params.ext;

      return ext === 'json' || ext === 'csv';
    },
    action(req, res) {
      return model.export(+req.params.id, function(err, result) {
        if (err) return res.serverError(err);
        if (!result) return res.notFound();

        const {csv, name, model} = result,
              filename = `classification_${model}_${name}.csv`;

        if (req.params.ext === 'csv') {
          res.status(200);
          res.header('Content-type', 'text/csv');
          res.header('Content-disposition', 'attachement; filename=' + filename);
          res.charset = 'utf-8';
          return res.send(csv);
        }
        else {
          return res.ok({csv, name, model, filename});
        }
      });
    }
  }
];

export default controller;

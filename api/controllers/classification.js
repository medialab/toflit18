/**
 * TOFLIT18 Classification Controller
 * ===================================
 *
 */
import model from '../model/classification';
import {api as apiConfig} from '../../config.json';

const limits = apiConfig.limits;

const controller = [
  {
    url: '/',
    method: 'GET',
    cache: 'classifications',
    action(req, res) {
      return model.getAll(function(err, classifications) {
        if (err) return res.serverError(err);

        return res.ok(classifications);
      });
    }
  },
  {
    url: '/:id/groups',
    method: 'GET',
    action(req, res) {
      return model.groups(+req.params.id, function(err, groups) {
        if (err) return res.serverError(err);
        if (!groups) return res.notFound();

        return res.ok(groups);
      });
    }
  },
  {
    url: '/:id/search',
    method: 'GET',
    validate: {
      query: {
        limit: '?string',
        offset: '?string',
        query: '?string'
      }
    },
    action(req, res) {
      const opts = {
        limit: +(req.query.limit || limits.groups),
        offset: +(req.query.offset || 0),
        query: req.query.query || null
      };

      return model.search(+req.params.id, opts, function(err, groups) {
        if (err) return res.serverError(err);

        return res.ok(groups);
      });
    }
  },
  {
    url: '/:id/export.:ext',
    method: 'GET',
    validate: {
      params: ({ext}) => ext === 'json' || ext === 'csv'
    },
    action(req, res) {
      return model.export(+req.params.id, function(err, result) {
        if (err) return res.serverError(err);
        if (!result) return res.notFound();

        const {csv, name, model: classificationModel} = result,
              filename = `classification_${classificationModel}_${name}.csv`;

        if (req.params.ext === 'csv') {
          res.status(200);
          res.header('Content-type', 'text/csv');
          res.header('Content-disposition', 'attachement; filename=' + filename);
          res.charset = 'utf-8';
          return res.send(csv);
        }
        else {
          return res.ok({csv, name, filename, model: classificationModel});
        }
      });
    }
  },
  {
    url: '/:id/patch/review',
    method: 'POST',
    validate: {
      body: {
        patch: 'array'
      }
    },
    action(req, res) {
      return model.review(+req.params.id, req.body.patch, function(err, result) {
        if (err) return res.serverError(err);
        if (!result) return res.notFound();

        return res.ok(result);
      });
    }
  },
  {
    url: '/:id/patch/commit',
    method: 'POST',
    validate: {
      body: {
        operations: 'array'
      }
    },
    action(req, res) {
      return model.commit(+req.params.id, req.body.operations, function(err, result) {
        if (err) return res.serverError(err);
        if (!result) return res.notFound();

        return res.ok();
      });
    }
  }
];

export default controller;

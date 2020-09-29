/**
 * TOFLIT18 Classification Controller
 * ===================================
 *
 */
import config from "config";
import model from "../model/classification";

const limits = config.get("api.limits");

const controller = [
  {
    url: "/",
    method: "GET",
    cache: "classifications",
    action(req, res) {
      return model.getAll(function(err, classifications) {
        if (err) return res.serverError(err);

        return res.ok(classifications);
      });
    },
  },
  {
    url: "/:id/groups",
    method: "GET",
    action(req, res) {
      return model.groups(req.params.id, function(err, groups) {
        if (err) return res.serverError(err);
        if (!groups) return res.notFound();

        return res.ok(groups);
      });
    },
  },
  {
    url: "/group/:id",
    method: "GET",
    validate: {
      query: {
        queryItem: "?string",
        queryItemFrom: "?string",
        limitItem: "?string",
        offsetItem: "?string",
      },
    },
    action(req, res) {
      const opts = {
        queryItem: req.query.queryItem || null,
        queryItemFrom: req.query.queryItemFrom || null,
        limitItem: +(req.query.limitItem || limits.items),
        offsetItem: +(req.query.offsetItem || 0),
      };

      return model.group(req.params.id, opts, function(err, group) {
        if (err) return res.serverError(err);
        if (!group) return res.notFound();

        return res.ok(group);
      });
    },
  },
  {
    url: "/:id/search",
    method: "GET",
    validate: {
      query: {
        source: "?string",
        limit: "?string",
        offset: "?string",
        queryGroup: "?string",
        queryItem: "?string",
        queryItemFrom: "?string",
        limitItem: "?string",
        offsetItem: "?string",
        orderBy: "?string",
      },
    },
    action(req, res) {
      const opts = {
        source: req.query.source === "true",
        limit: +(req.query.limit || limits.groups),
        offset: +(req.query.offset || 0),
        queryGroup: req.query.queryGroup || null,
        queryItem: req.query.queryItem || null,
        queryItemFrom: req.query.queryItemFrom || null,
        limitItem: +(req.query.limitItem || limits.items),
        offsetItem: +(req.query.offsetItem || 0),
        orderBy: req.query.orderBy || null,
      };

      return model.search(req.params.id, opts, function(err, groups) {
        if (err) return res.serverError(err);

        return res.ok(groups);
      });
    },
  },
  {
    url: "/:id/export.:ext",
    method: "GET",
    validate: {
      params: ({ ext }) => ext === "json" || ext === "csv",
    },
    action(req, res) {
      return model.export(req.params.id, function(err, result) {
        if (err) return res.serverError(err);
        if (!result) return res.notFound();

        const { csv, name, model: classificationModel } = result,
          filename = `classification_${classificationModel}_${name}.csv`;

        if (req.params.ext === "csv") {
          res.status(200);
          res.header("Content-type", "text/csv");
          res.header("Content-disposition", "attachement; filename=" + filename);
          res.charset = "utf-8";
          return res.send(csv);
        } else {
          return res.ok({ csv, name, filename, model: classificationModel });
        }
      });
    },
  },
  {
    url: "/:id/patch/review",
    method: "POST",
    validate: {
      body: {
        patch: "array",
      },
    },
    action(req, res) {
      return model.review(req.params.id, req.body.patch, function(err, result) {
        if (err) return res.serverError(err);
        if (!result) return res.notFound();

        return res.ok(result);
      });
    },
  },
  {
    url: "/:id/patch/commit",
    method: "POST",
    validate: {
      body: {
        operations: "array",
      },
    },
    action(req, res) {
      return model.commit(req.params.id, req.body.operations, function(err, result) {
        if (err) return res.serverError(err);
        if (!result) return res.notFound();

        return res.ok();
      });
    },
  },
];

export default controller;

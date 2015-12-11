/**
 * TOFLIT18 Express Middlewares
 * =============================
 *
 * Middlewares covering such things as cache or data validation.
 */
import types from 'typology';

// Helpers
function param(req, key) {
  if (key in req.body)
    return req.body[key];
  if (key in req.query)
    return req.query[key];
  if (key in req.params)
    return req.params[key];
}

const CACHE = {};

// Middlewares
const middlewares = {

  // Verify the user's authentication before proceeding
  authenticate: function(req, res, next) {
    if (!req.session.authenticated)
      return res.unauthorized();
    else
      return next();
  },

  // Basic response caching
  cache: function(params) {
    if (typeof params === 'string')
      params = {key: params};

    const {key, hasher = () => '$nohash$'} = params;

    CACHE[key] = {};

    return function(req, res, next) {
      const hash = hasher(req);

      // Do we have the data already?
      if (CACHE[key][hash])
        return res.ok(CACHE[key][hash]);

      // Flagging
      res.shouldBeCached = true;

      // Catching response
      res.on('finish', function() {
        CACHE[key][hash] = res.sentData;
        delete res.sentData;
      });

      return next();
    };
  },

  // Validate the parameters of the query
  validate: function(def) {
    return function(req, res, next) {

      if (typeof def === 'function') {
        if (!def(req))
          return res.badRequest();
        else
          return next();
      }

      // Retrieving params
      const data = {};
      for (const k in def)
        data[k] = param(req, k);

      // Validating params
      if (!types.check(def, data)) {
        return res.badRequest(def);
      }

      return next();
    };
  }
};

export default middlewares;

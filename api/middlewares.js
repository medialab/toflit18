/**
 * TOFLIT18 Express Middlewares
 * =============================
 *
 * Middlewares covering such things as cache or data validation.
 */

// Middlewares
export function authenticate(req, res, next) {
  if (!req.session.authenticated)
    return res.unauthorized();
  else
    return next();
}

/**
 * TOFLIT18 Login Controller
 * ==========================
 *
 */
import model from '../model/user';

const controller = [
  {
    url: '/session',
    name: 'session',
    method: 'GET',
    action(req, res) {
      if (req.session.authenticated)
        return res.ok({name: req.session.user.name});
      else
        return res.ok(null);
    }
  },
  {
    url: '/login',
    name: 'login',
    method: 'POST',
    validate: {
      body: {
        name: 'string',
        password: 'string'
      }
    },
    action(req, res) {
      model.authenticate(req.body.name, req.body.password, function(err, user) {
        if (err) return res.serverError(err);
        if (!user) return res.unauthorized();

        // Setting session
        req.session.user = user;
        req.session.authenticated = true;

        // Sending response
        return res.ok({name: user.name});
      });
    }
  },
  {
    url: '/logout',
    name: 'logout',
    method: 'POST',
    action(req, res) {
      req.session.destroy(err => {
        if (err) return res.serverError(err);

        return res.ok();
      });
    }
  }
];

export default controller;

/**
 * TOFLIT18 Login Controller
 * ==========================
 *
 */
import model from '../model/user';

const controller = [
  {
    url: '/login',
    methods: ['POST'],
    validate: {
      name: 'string',
      password: 'string'
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
  }
];

export default controller;

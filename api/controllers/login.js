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
      return res.ok({hello: 'world'});
    }
  }
];

export default controller;

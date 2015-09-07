/**
 * TOFLIT18 User Model
 * ====================
 *
 */
import database from '../database';
import {hash} from '../../lib/crypto';
import {user as queries} from '../queries';

const model = {

  /**
   * Authentication.
   */
  authenticate(name, password, callback) {
    return database.cypher(
      {
        query: queries.login,
        params: {
          name: name,
          hash: hash(password)
        }
      },
      function(err, results) {
        if (err) return err;

        return callback(null, results[0].user);
      }
    );
  }
};

export default model;

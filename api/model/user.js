/**
 * TOFLIT18 User Model
 * ====================
 *
 */
import database from '../connection';
import {hash} from '../../lib/crypto';
import {user as queries} from '../queries';

const Model = {

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

        const user = results[0] ? results[0].user.properties : null;
        return callback(null, user);
      }
    );
  }
};

export default Model;

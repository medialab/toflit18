/**
 * TOFLIT18 Client Parrot
 * =======================
 *
 * Defining data fetching rules.
 */
import Parrot from './lib/parrot';

export default function(state, client) {
  return new Parrot(state, {
    rules: [
      {
        path: ['data', 'classifications'],
        get() {
          return client.classifications(function(err, {result}) {
            if (err) return;

            state.set(['data', 'classifications'], result);
            state.set(['states', 'classification', 'browser', 'selected'], result.product.id);
          });
        }
      }
    ]
  });
}

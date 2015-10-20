/**
 * TOFLIT18 Client Parrot
 * =======================
 *
 * Defining data fetching rules.
 */
import Parrot from './lib/parrot';
import * as browser from './actions/browser';

export default function(state, client) {
  return new Parrot(state, {
    rules: [
      {
        path: ['data', 'classifications', 'flat'],
        expect: data => {
          return Object.keys(data.product).length ||
                 Object.keys(data.country).length;
        },
        get() {
          return client.classifications(function(err, data) {
            if (err) return;

            const result = data.result;

            state.set(['data', 'classifications', 'raw'], result);

            const selection = state.select('states', 'classification', 'browser', 'selected');

            if (selection.get() === null)
              browser.select(state, result.product.id);
          });
        }
      }
    ]
  });
}

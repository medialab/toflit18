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
              selection.set(result.product.id);
          });
        }
      }
    ]
  });
}

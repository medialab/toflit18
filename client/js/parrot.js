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
        path: ['counter']
      }
    ]
  });
}

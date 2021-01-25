/**
 * TOFLIT18 Client Parrot
 * =======================
 *
 * Defining data fetching rules.
 */
import Parrot from "./lib/parrot";

export default function(state, client) {
  return new Parrot(state, {
    rules: [
      // Accessing the classifications' list
      {
        path: ["data", "classifications", "flat"],
        expect: data => {
          return Object.keys(data.product).length || Object.keys(data.partner).length;
        },
        get() {
          return client.classifications(function(err, data) {
            if (err) return;

            state.set(["data", "classifications", "raw"], data.result);
          });
        },
      },

      // Accessing the regions' list
      {
        path: ["data", "regions"],
        get() {
          return client.regions(function(err, data) {
            if (err) return;

            state.set(["data", "regions"], data.result);
          });
        },
      },

      // Accessing the source types' list
      {
        path: ["data", "sourceTypes"],
        get() {
          return client.sourceTypes(function(err, data) {
            if (err) return;

            state.set(["data", "sourceTypes"], data.result);
          });
        },
      },
      // Accessing the last commits list
      {
        path: ["data", "lastCommits"],
        get() {
          return client.lastCommits(function(err, data) {
            if (err) return;

            state.set(["data", "lastCommits"], data.result);
          });
        },
      },
    ],
  });
}

/**
 * TOFLIT18 Client Main Entry
 * ===========================
 *
 * Launching the app.
 */
import React from "react";
import { root } from "baobab-react/higher-order";
import { render } from "react-dom";
import Root from "./components/Root.jsx";
import makeParrot from "./parrot";
import client from "./client";
import state from "./state";

// Stylesheet
import "ladda/dist/ladda-themeless.min.css";
import "react-select/scss/default.scss";
import "../style/toflit18.scss";
import bindRoutes from "./routing";

// Binding client
let parrot = makeParrot(state, client);
state.client = client;

// Binding routes
let router = bindRoutes(state);
state.router = router;

// Hot-reloading logic
if (module.hot) {
  module.hot.accept("./client", function() {
    parrot.release();

    const newClient = require("./client").default;
    state.client = newClient;
    parrot = state.parrot = makeParrot(state, newClient);
  });

  module.hot.accept("./parrot", function() {
    parrot.release();
    parrot = state.parrot = require("./parrot").default(state, state.client);
  });

  module.hot.accept("./routing", function() {
    router.kill();
    router = state.router = require("./routing").default(state);
  });
}

// Initialize the app
const RootedApp = root(Root, state);
render(<RootedApp />, document.getElementById("mount"));

module.exports = state;

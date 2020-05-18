/**
 * TOFLIT18 Client Application Component
 * ======================================
 *
 * Root component for the application.
 */
import React, {Component} from 'react';
import {branch} from "baobab-react/decorators";

import Header from './Header.jsx';
import Home from "./Home.jsx";
import About from "./About.jsx";
import Legal from "./Legal.jsx";
import Classification from "./classification/Classification.jsx";
import ExplorationMeta from "./exploration/ExplorationMeta.jsx";
import ExplorationIndicators from "./exploration/ExplorationIndicators.jsx";
import ExplorationNetwork from "./exploration/ExplorationNetwork.jsx";
import ExplorationTerms from "./exploration/ExplorationTerms.jsx";
import Sources from "./Sources.jsx";
import GlossaryPanel from "./glossary/GlossaryPanel.jsx";
import Concepts from "./Concepts.jsx";

const COMPONENTS = {
  home: Home,
  about: About,
  legal: Legal,
  classification: Classification,
  explorationMeta: ExplorationMeta,
  explorationIndicators: ExplorationIndicators,
  explorationNetwork: ExplorationNetwork,
  explorationTerms: ExplorationTerms,
  explorationSources: Sources,
  glossaryPanel: GlossaryPanel,
  concepts: Concepts,
}

@branch({
  cursors: {
    view: ['view']
  }
})
export default class App extends Component {
  render() {
    const {view} = this.props;
    const Component = COMPONENTS[view];

    return (
      <div id="main">
        <Header />
        {Component && <Component />}
      </div>
    );
  }
}

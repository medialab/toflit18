/**
 * TOFLIT18 Network Component
 * ===========================
 *
 * Component displaying a sigma.js network showing the relations between
 * countries and directions.
 */
import React, {Component} from 'react';
import {six as palette} from '../../../lib/palettes';

/**
 * Sigma wrapper component.
 */
export default class Network extends Component {
  constructor(props, context) {
    super(props, context);

    this.sigma = new sigma();
    this.sigma.addCamera('main');
  }

  componentDidMount() {
    this.sigma.addRenderer({
      camera: 'main',
      container: this.refs.mount
    });

    this.componentWillUpdate(this.props);
  }

  componentWillUnmount() {
    this.sigma.kill();
    this.sigma = null;
  }

  componentWillUpdate(nextProps) {
    if (!nextProps.graph)
      return;

    this.sigma.killForceAtlas2();

    const g = this.sigma.graph;

    g.clear();
    g.read(nextProps.graph);

    // Styling
    g.nodes().forEach(function(node) {
      node.size = g.degree(node.id);
      node.color = palette[+(node.kind === 'direction')];
    });

    g.edges().forEach(function(edge) {
      edge.color = '#E7E7E7';
    });

    this.sigma.refresh();
    this.sigma.startForceAtlas2();
  }

  render() {
    return (
      <div id="sigma-graph" ref="mount">
        <Controls instance={this.sigma} />
      </div>
    );
  }
}

/**
 * Controls.
 */
class Controls extends Component {
  rescale() {
    const camera = this.props.instance.cameras.main;

    sigma.misc.animation.camera(
      camera,
      {x: 0, y: 0, angle: 0, ratio: 1},
      {duration: 150}
    );
  }

  render() {
    const instance = this.props.instance;

    return (
      <div className="controls">
        <div className="control" onClick={() => this.rescale()}>
          <button>Rescale</button>
        </div>
        <div className="control" onClick={() => instance.stopForceAtlas2()}>
          <button>Stop</button>
        </div>
      </div>
    );
  }
}

/**
 * TOFLIT18 Network Component
 * ===========================
 *
 * Component displaying a sigma.js network showing the relations between
 * countries and directions.
 */
import React, {Component} from 'react';

/**
 * Settings.
 */
const SIGMA_SETTINGS = {
  labelThreshold: 7,
  minNodeSize: 2,
  maxEdgeSize: 6,
  edgeColor: 'default',
  defaultEdgeType: 'arrow',
  defaultEdgeColor: '#D1D1D1',
  maxArrowSize: 5,
  minArrowSize: 3,
  sideMargin: 10
};

const LAYOUT_SETTINGS = {
  strongGravityMode: true,
  gravity: 0.05,
  scalingRatio: 10,
  slowDown: 2
};

/**
 * Sigma wrapper component.
 */
export default class Network extends Component {
  constructor(props, context) {
    super(props, context);

    this.sigma = new sigma({
      settings: SIGMA_SETTINGS
    });
    this.sigma.addCamera('main');
    this.layoutSettings = LAYOUT_SETTINGS;
  }

  componentDidMount() {
    this.sigma.addRenderer({
      camera: 'main',
      container: this.refs.mount
    });

    this.componentWillUpdate(this.props);
  }

  componentWillUpdate(nextProps) {
    this.sigma.killForceAtlas2();

    const g = this.sigma.graph;

    // We only reset the graph if it is structurally different
    if (nextProps.graph && nextProps.graph !== this.props.graph) {
      g.clear();

      // Updating layout
      this.layoutSettings.barnesHutOptimize = nextProps.graph.nodes.length > 1000;

      g.read(nextProps.graph);

      // Styling
      const nodes = g.nodes(),
            N = nodes.length;

      nodes.forEach(function(node, i) {
        node.size = g.degree(node.id);

        node.x = 100 * Math.cos(2 * i * Math.PI / N);
        node.y = 100 * Math.sin(2 * i * Math.PI / N);
      });
    }

    if (!nextProps.graph) {
      g.clear();
      return this.sigma.refresh();
    }

    if (nextProps.colorKey)
      g.nodes().forEach(node => node.color = node[nextProps.colorKey]);

    this.sigma.refresh();
    this.sigma.startForceAtlas2(this.layoutSettings);
  }

  componentWillUnmount() {
    this.sigma.kill();
    this.sigma = null;
  }

  render() {
    return (
      <div id="sigma-graph" ref="mount">
        <Controls instance={this.sigma} layoutSettings={this.layoutSettings} />
      </div>
    );
  }
}

/**
 * Glyph.
 */
class Glyph extends Component {
  render() {
    const name = this.props.name,
          className = `fa fa-${name}`;

    return <i className={className} />;
  }
}

/**
 * Controls.
 */
class Controls extends Component {
  componentDidMount() {
    this.forceUpdate();
  }

  rescale() {
    const camera = this.props.instance.cameras.main;

    sigma.misc.animation.camera(
      camera,
      {x: 0, y: 0, angle: 0, ratio: 1},
      {duration: 150}
    );
  }

  zoom() {
    const camera = this.props.instance.cameras.main;

    sigma.misc.animation.camera(
      camera,
      {ratio: camera.ratio / 1.5},
      {duration: 150}
    );
  }

  unzoom() {
    const camera = this.props.instance.cameras.main;

    sigma.misc.animation.camera(
      camera,
      {ratio: camera.ratio * 1.5},
      {duration: 150}
    );
  }

  render() {
    const instance = this.props.instance,
          running = instance.isForceAtlas2Running(),
          icon = running ? 'pause' : 'play';

    const toggleLayout = () => {
      if (instance.isForceAtlas2Running())
        instance.stopForceAtlas2();
      else
        instance.startForceAtlas2(this.props.layoutSettings);

      this.forceUpdate();
    };

    return (
      <div className="controls">
        <div className="control" onClick={() => this.zoom()}>
          <button><Glyph name="plus" /></button>
        </div>
        <div className="control" onClick={() => this.unzoom()}>
          <button><Glyph name="minus" /></button>
        </div>
        <div className="control" onClick={() => this.rescale()}>
          <button><Glyph name="dot-circle-o" /></button>
        </div>
        <div className="control" onClick={() => toggleLayout()}>
          <button><Glyph name={icon} /></button>
        </div>
      </div>
    );
  }
}

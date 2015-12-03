/**
 * TOFLIT18 Network Component
 * ===========================
 *
 * Component displaying a sigma.js network showing the relations between
 * countries and directions.
 */
import React, {Component} from 'react';
import Button from '../../misc/Button.jsx';
import {six as palette} from '../../../lib/palettes';

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
    this.sigma.killForceAtlas2();

    const g = this.sigma.graph;

    g.clear();

    if (!nextProps.graph)
      return this.sigma.refresh();

    g.read(nextProps.graph);

    // Styling
    g.nodes().forEach(function(node) {
      node.size = g.degree(node.id);
      node.color = palette[+(node.kind === 'direction')];
    });

    this.sigma.refresh();
    this.sigma.startForceAtlas2(LAYOUT_SETTINGS);
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
      if (running)
        instance.stopForceAtlas2();
      else
        instance.startForceAtlas2(LAYOUT_SETTINGS);

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

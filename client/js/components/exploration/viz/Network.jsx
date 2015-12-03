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
        instance.startForceAtlas2();

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

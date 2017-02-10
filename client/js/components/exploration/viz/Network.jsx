/**
 * TOFLIT18 Network Component
 * ===========================
 *
 * Component displaying a sigma.js network showing the relations between
 * countries and directions.
 */
import React, {Component} from 'react';
import screenfull from 'screenfull';

/**
 * Settings.
 */
const SIGMA_SETTINGS = {
  labelThreshold: 7,
  labelSize: 'proportional',
  labelSizeRatio: 2,
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

    this.state = {
      labelThreshold: SIGMA_SETTINGS.labelThreshold,
      labelSizeRatio: SIGMA_SETTINGS.labelSizeRatio,
      layoutRunning: true
    };

    this.toggleLayout = () => {
      const running = this.sigma.isForceAtlas2Running();

      if (!running) {
        this.sigma.startForceAtlas2(this.layoutSettings);
      }
      else {
        this.sigma.stopForceAtlas2();
      }

      this.setState({layoutRunning: !running});
    };

    this.toggleFullScreen = () => {
      const mount = this.refs.mount;

      screenfull.toggle(mount);
    };

    this.fullScreenHandler = () => {
      const mount = this.refs.mount;

      if (screenfull.isFullscreen) {
        mount.style.width = '100%';
        mount.style.height = '100%';
      }
      else {
        mount.style.width = null;
        mount.style.height = null;
      }

      this.sigma.refresh();
    };

    this.updateLabelThreshold = e => {
      this.setState({labelThreshold: +e.target.value});
      this.sigma.settings({labelThreshold: +e.target.value});
    };

    this.updateLabelSizeRatio = e => {
      this.setState({labelSizeRatio: +e.target.value});
      this.sigma.settings({labelSizeRatio: +e.target.value});
    };
  }

  componentDidMount() {
    this.sigma.addRenderer({
      camera: 'main',
      container: this.refs.mount
    });

    document.addEventListener(screenfull.raw.fullscreenchange, this.fullScreenHandler);

    this.componentWillUpdate(this.props);
  }

  componentWillUpdate(nextProps) {
    const g = this.sigma.graph;

    // We only reset the graph if it is structurally different
    if (nextProps.graph && nextProps.graph !== this.props.graph) {
      this.sigma.killForceAtlas2();
      g.clear();

      // Updating layout
      this.layoutSettings.barnesHutOptimize = nextProps.graph.nodes.length > 1000;

      g.read(nextProps.graph);

      // Styling
      const nodes = g.nodes(),
            N = nodes.length;

      nodes.forEach(function(node, i) {
        node.size = node.occurrences || node.size;
        node.x = 100 * Math.cos(2 * i * Math.PI / N);
        node.y = 100 * Math.sin(2 * i * Math.PI / N);
      });

      this.sigma.startForceAtlas2(this.layoutSettings);
      this.setState({layoutRunning: true});
    }

    if (!nextProps.graph) {
      g.clear();
      return this.sigma.refresh();
    }

    if (nextProps.colorKey)
      g.nodes().forEach(node => node.color = node[nextProps.colorKey]);

    this.sigma.refresh();
  }

  componentWillUnmount() {
    this.sigma.kill();
    this.sigma = null;

    document.removeEventListener(screenfull.raw.fullscreenchange, this.fullScreenHandler);
  }

  downloadGraphAsSVG() {
    this.sigma.toSVG({
      download: true,
      filename: 'graph.svg',
      labels: true
    });
  }

  render() {
    const graph = this.props.graph,
          isGraphEmpty = graph && (!graph.nodes || !graph.nodes.length);

    return (
      <div id="sigma-graph" ref="mount">
        {isGraphEmpty && <Message text="No Data to display." />}
        <Filters
          threshold={this.state.labelThreshold}
          size={this.state.labelSizeRatio}
          updateThreshold={this.updateLabelThreshold}
          updateSizeRatio={this.updateLabelSizeRatio} />
        <Controls
          camera={this.sigma.cameras.main}
          toggleFullScreen={this.toggleFullScreen}
          toggleLayout={this.toggleLayout}
          layoutRunning={this.state.layoutRunning} />
      </div>
    );
  }
}

/**
 * Message.
 */
class Message extends Component {
  render() {
    return (
      <div className="message">
        {this.props.text}
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
    const camera = this.props.camera;

    sigma.misc.animation.camera(
      camera,
      {x: 0, y: 0, angle: 0, ratio: 1},
      {duration: 150}
    );
  }

  zoom() {
    const camera = this.props.camera;

    sigma.misc.animation.camera(
      camera,
      {ratio: camera.ratio / 1.5},
      {duration: 150}
    );
  }

  unzoom() {
    const camera = this.props.camera;

    sigma.misc.animation.camera(
      camera,
      {ratio: camera.ratio * 1.5},
      {duration: 150}
    );
  }

  render() {
    const toggleFullScreen = this.props.toggleFullScreen,
          toggleLayout = this.props.toggleLayout,
          icon = this.props.layoutRunning ? 'pause' : 'play';

    return (
      <div className="controls">
        <div className="control" onClick={toggleFullScreen}>
          <button><Glyph name="arrows-alt" /></button>
        </div>
        <div className="control" onClick={() => this.zoom()}>
          <button><Glyph name="plus" /></button>
        </div>
        <div className="control" onClick={() => this.unzoom()}>
          <button><Glyph name="minus" /></button>
        </div>
        <div className="control" onClick={() => this.rescale()}>
          <button><Glyph name="dot-circle-o" /></button>
        </div>
        <div className="control" onClick={toggleLayout}>
          <button><Glyph name={icon} /></button>
        </div>
      </div>
    );
  }
}

/**
 * Filters.
 */
class Filters extends Component {
  render() {
    return (
      <div className="filters">
        <input
          name="threshold"
          type="range"
          min="0"
          max="20"
          value={this.props.threshold}
          onChange={this.props.updateThreshold} />
        <label htmlFor="threshold">Label Threshold ({this.props.threshold})</label>
        <br />
        <input
          name="size"
          type="range"
          min="1"
          max="10"
          value={this.props.size}
          onChange={this.props.updateSizeRatio} />
        <label htmlFor="size">Label Size Ratio ({this.props.size})</label>
      </div>
    );
  }
}

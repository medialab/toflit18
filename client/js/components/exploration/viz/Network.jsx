/**
 * TOFLIT18 Network Component
 * ===========================
 *
 * Component displaying a sigma.js network showing the relations between
 * countries and directions.
 */
import React, {Component} from 'react';
import Select from 'react-select';
import cls from 'classnames';

import Icon from '../../misc/Icon.jsx';

/**
 * Settings.
 */
const SIGMA_SETTINGS = {
  labelThreshold: 7,
  labelSize: 'proportional',
  labelSizeRatio: 2,
  minNodeSize: 2,
  maxNodeSize: 9,
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
 * Helper function that moves the camera on the desired node.
 */
function focusNode(camera, node) {
  sigma.misc.animation.camera(
    camera,
    {
      x: node['read_cammain:x'],
      y: node['read_cammain:y'],
      ratio: 0.075
    },
    {
      duration: 150
    }
  );
}

/**
 * Helper function used to rescale the camera.
 */
function rescale(camera) {
  sigma.misc.animation.camera(
    camera,
    {x: 0, y: 0, angle: 0, ratio: 1},
    {duration: 150}
  );
}

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
      layoutRunning: true,
      selectedNode: null
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
      if (typeof this.props.toggleFullscreen === 'function') {
        this.props.toggleFullscreen();
      }
    };

    this.focusNode = node => {
      if (!node) {
        rescale(this.sigma.cameras.main);
      }
      else {
        focusNode(this.sigma.cameras.main, this.sigma.graph.nodes(node.id));
      }
    };

    this.selectNode = node => {
      this.setState({selectedNode: node});
      if (typeof this.props.setSelectedNode === 'function') {
        this.props.setSelectedNode(node);
      }
    };
  }

  componentDidMount() {
    this.sigma.addRenderer({
      camera: 'main',
      container: this.refs.mount
    });

    this.sigma.bind('clickNode', e => {
      this.selectNode(e.data.node);
    });

    this.componentWillUpdate(this.props);
  }

  componentWillUpdate(nextProps) {
    const g = this.sigma.graph;

    // If the graph's directedness changes
    const defaultEdgeType = nextProps.directed ? 'arrow' : 'def';
    this.sigma.settings({defaultEdgeType});

    // We only reset the graph if it is structurally different
    if (nextProps.graph && nextProps.graph !== this.props.graph) {
      this.sigma.killForceAtlas2();
      g.clear();

      this.selectNode(null);

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

    if (nextProps.sizeKey)
      g.nodes().forEach(node => node.size = node[nextProps.sizeKey]);

    if (nextProps.edgeSizeKey)
      g.edges().forEach(edge => edge.size = edge[nextProps.edgeSizeKey]);

    if (nextProps.labelThreshold)
      this.sigma.settings({labelThreshold: +nextProps.labelThreshold});

    if (nextProps.labelSizeRatio)
      this.sigma.settings({labelSizeRatio: +nextProps.labelSizeRatio});

    this.sigma.refresh();
  }

  componentWillUnmount() {
    this.sigma.kill();
    this.sigma = null;
  }

  downloadGraphAsSVG() {
    this.sigma.toSVG({
      download: true,
      filename: 'graph.svg',
      labels: true
    });
  }

  render() {
    const {
      graph,
      alert,
      loading,
      className,
    } = this.props;
    const isGraphEmpty = graph && (!graph.nodes || !graph.nodes.length);

    return (
      <div
        id="sigma-graph"
        ref="mount"
        className={className} >
        {isGraphEmpty && <Message text="No Data to display." />}

        {
          (alert || loading) && (
            <div className="progress-container progress-container-viz">
              {alert && <div className="alert alert-danger" role="alert">{alert}</div>}
              {
                loading && (
                  <div className="progress-line progress-line-viz">
                    <span className="sr-only">Loading...</span>
                  </div>
                )
              }
            </div>
          )
        }

        <Controls
          nodes={graph ? graph.nodes : []}
          camera={this.sigma.cameras.main}
          toggleFullScreen={this.toggleFullScreen}
          toggleLayout={this.toggleLayout}
          layoutRunning={this.state.layoutRunning}
          onChangeQuery={this.focusNode} />
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
 * Controls.
 */
class Controls extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      value: null
    };

    this.handleSelection = this.handleSelection.bind(this);
    this.rescale = this.rescale.bind(this);
    this.zoom = this.zoom.bind(this);
    this.unzoom = this.unzoom.bind(this);
  }

  componentDidMount() {
    this.forceUpdate();
  }

  rescale() {
    const camera = this.props.camera;

    rescale(camera);
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

  handleSelection(value) {
    if (typeof this.props.onChangeQuery === 'function')
      this.props.onChangeQuery(value);
    this.setState({value});
  }

  render() {
    const {
      nodes,
      toggleLayout,
      toggleFullScreen,
      layoutRunning,
    } = this.props;

    return (
      <div className="viz-tools">
        <div className="viz-actions">
          <form onSubmit={e => e.preventDefault()}>
            <div className="form-group form-group-xs">
              <label className="sr-only">Search</label>
              <div className="input-group">
                <Select
                  options={nodes}
                  labelKey="label"
                  placeholder="Search a node in the graph..."
                  onChange={this.handleSelection}
                  value={this.state.value} />
              </div>
            </div>
          </form>
          <button
            className="btn btn-default btn-xs btn-icon"
            onClick={toggleLayout}>
            <Icon name="icon-stop" className={cls(!layoutRunning && 'hidden')} />
            <Icon name="icon-play" className={cls(layoutRunning && 'hidden')} />
          </button>
        </div>
        <div className="viz-nav">
          <button
            className="btn btn-default btn-xs btn-icon"
            onClick={this.rescale}>
            <Icon name="icon-localisation" />
          </button>
          <button
            className="btn btn-default btn-xs btn-icon"
            onClick={this.zoom}>
            <Icon name="icon-zoom-in" />
          </button>
          <button
            className="btn btn-default btn-xs btn-icon"
            onClick={this.unzoom}>
            <Icon name="icon-zoom-out" />
          </button>
          <button
            className="btn btn-default btn-xs btn-icon"
            onClick={toggleFullScreen}>
            <Icon name="icon-full-screen" />
          </button>
        </div>
      </div>
    );
  }
}

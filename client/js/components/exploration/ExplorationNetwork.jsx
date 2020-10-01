/**
 * TOFLIT18 Client Network Viz Display
 * ====================================
 *
 * Displaying a network of places linked by their trade.
 */
import React, {Component} from 'react';
import {format} from 'd3-format';
import {range} from 'lodash';
import Select from 'react-select';
import {branch} from 'baobab-react/decorators';
import {ExportButton} from '../misc/Button.jsx';
import {ClassificationSelector, ItemSelector} from '../misc/Selectors.jsx';
import Network from './viz/Network.jsx';
import VizLayout from '../misc/VizLayout.jsx';
import {exportCSV, exportSVG} from '../../lib/exports';
import {
  addNetwork,
  checkDefaultState,
  selectClassification,
  selectEdgeSize,
  selectLabelSizeRatio,
  selectLabelThreshold,
  selectNodeSize,
  updateSelector,
} from '../../actions/network';
import Icon from '../misc/Icon.jsx';

import specs from '../../../specs.json';

const defaultSelectors = require('../../../config/defaultVizSelectors.json');

const NUMBER_FIXED_FORMAT = format(',.2f'),
  NUMBER_FORMAT = format(',');

export default class ExplorationGlobals extends Component {
  render() {
    return (
      <div>
        <NetworkPanel />
      </div>
    );
  }
}

@branch({
  actions: {
    addNetwork,
    selectClassification,
    selectNodeSize,
    selectEdgeSize,
    selectLabelSizeRatio,
    selectLabelThreshold,
    updateSelector,
    checkDefaultState,
  },
  cursors: {
    alert: ['ui', 'alert'],
    classifications: ['data', 'classifications', 'flat'],
    directions: ['data', 'directions'],
    sourceTypes: ['data', 'sourceTypes'],
    state: ['explorationNetworkState'],
  },
})
class NetworkPanel extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {selected: null, fullscreen: false};
    this.setSelectedNode = this.setSelectedNode.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
  }

  componentDidMount() {
    // Check for initial values:
    const state = this.props.state;
    const initialState = defaultSelectors.network.initialValues;
    const hasInitialState = Object.keys(initialState).some(key =>
      key.split('.').reduce((iter, step) => iter && iter[step], state),
    );

    if (!hasInitialState) {
      this.props.actions.checkDefaultState(defaultSelectors.network.initialValues);
    }

    this.props.actions.addNetwork();
  }

  componentDidUpdate() {
    // Check for defaults:
    this.props.actions.checkDefaultState(defaultSelectors.network.defaultValues);
  }

  exportCsv() {
    const now = new Date();
    exportCSV({
      data: this.props.state.data,
      name: `TOFLIT18_Locations_${now.toLocaleString('se-SE').replace(' ', '_')}.csv`,
    });
  }

  exportGraph() {
    const now = new Date();
    const graphSvg = sigma.instances(0).toSVG({
      labels: true,
    });
    exportSVG({
      nodes: [this.legend, graphSvg],
      name: `TOFLIT18_Locations_${now.toLocaleString('se-SE').replace(' ', '_')}.svg`,
    });
  }

  setSelectedNode(selectedNode) {
    this.setState({selectedNode});
  }

  toggleFullscreen() {
    this.setState({fullscreen: !this.state.fullscreen});
  }

  render() {
    const {
      alert,
      actions,
      classifications,
      sourceTypes,
      state: {graph, classification, nodeSize, edgeSize, labelSizeRatio, labelThreshold, loading, selectors, groups},
    } = this.props;

    const {selectedNode, fullscreen} = this.state;

    const dateMin = selectors.dateMin;
    const dateMaxOptions = range(dateMin || specs.limits.minYear, specs.limits.maxYear).map(d => ({
      name: '' + d,
      id: '' + d,
    }));

    const dateMax = selectors.dateMax;
    const dateMinOptions = range(specs.limits.minYear, dateMax ? +dateMax + 1 : specs.limits.maxYear).map(d => ({
      name: '' + d,
      id: '' + d,
    }));

    const sourceTypesOptions = (sourceTypes || []).map(type => {
      return {
        name: type,
        value: type,
      };
    });

    const directed = selectors.kind !== 'total';

    return (
      <VizLayout
        title="Locations"
        description="Choose a partner classification and display a graph showing relations between partners & directions."
        leftPanelName="Filters"
        rightPanelName="Caption"
        fullscreen={fullscreen}>
        {/* Top of the left panel */}
        <div className="box-selection">
          <h2 className="hidden-xs">
            <span className="hidden-sm hidden-md">Partner</span> classification
          </h2>
          <ClassificationSelector
            valueKey="id"
            type="partner"
            loading={!classifications.partner.length}
            data={classifications.partner}
            onChange={actions.selectClassification}
            selected={classification}
            onUpdate={actions.selectClassification}
            defaultValue={defaultSelectors.network.classification}
          />
        </div>

        {/* Left panel */}
        <div className="aside-filters">
          <h3>Filters</h3>
          <form onSubmit={e => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="sourceType" className="control-label">
                Source Type
              </label>
              <small className="help-block">
                Type of sources the data comes from.{' '}
                <a href="#/exploration/sources">
                  <Icon name="icon-info" />
                </a>
              </small>
              <ItemSelector
                valueKey="value"
                type="sourceType"
                data={sourceTypesOptions}
                loading={!sourceTypesOptions.length}
                onChange={val => actions.updateSelector('sourceType', val)}
                selected={selectors.sourceType}
                onUpdate={val => actions.updateSelector('sourceType', val)}
                defaultValue={defaultSelectors.network['selectors.sourceType']}
              />
            </div>
            <div className="form-group">
              <label htmlFor="product" className="control-label">
                Product
              </label>
              <small className="help-block">
                The type of product being shipped.{' '}
                <a href="#/glossary/concepts">
                  <Icon name="icon-info" />
                </a>
              </small>
              <ClassificationSelector
                valueKey="id"
                type="product"
                placeholder="Child classification..."
                loading={!classifications.product.length}
                data={classifications.product.filter(c => !c.source)}
                onChange={val => actions.updateSelector('productClassification', val)}
                selected={selectors.productClassification}
                onUpdate={val => actions.updateSelector('productClassification', val)}
                defaultValue={defaultSelectors.network['selectors.productClassification']}
              />
              <ItemSelector
                valueKey="id"
                type="product"
                disabled={!selectors.productClassification || !groups.product.length}
                loading={selectors.productClassification && !groups.product.length}
                data={groups.product}
                onChange={val => actions.updateSelector('product', val)}
                selected={selectors.product}
                onUpdate={val => actions.updateSelector('product', val)}
                defaultValue={defaultSelectors.network['selectors.product']}
              />
            </div>
            <div className="form-group">
              <label htmlFor="kind" className="control-label">
                Kind
              </label>
              <small className="help-block">Should we look at import, export, or total?</small>
              <ItemSelector
                type="kind"
                valueKey="id"
                onChange={val => actions.updateSelector('kind', val)}
                selected={selectors.kind}
                onUpdate={val => actions.updateSelector('kind', val)}
                defaultValue={defaultSelectors.network['selectors.kind']}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dates" className="control-label">
                Dates
              </label>
              <small className="help-block">Choose one date or a range data</small>
              <div className="row">
                <div className="col-xs-6">
                  <ItemSelector
                    valueKey="id"
                    type="dateMin"
                    data={dateMinOptions}
                    onChange={val => actions.updateSelector('dateMin', val)}
                    selected={selectors.dateMin}
                    onUpdate={val => actions.updateSelector('dateMin', val)}
                    defaultValue={defaultSelectors.network['selectors.dateMin']}
                  />
                </div>
                <div className="col-xs-6">
                  <ItemSelector
                    valueKey="id"
                    type="dateMax"
                    data={dateMaxOptions}
                    onChange={val => actions.updateSelector('dateMax', val)}
                    selected={selectors.dateMax}
                    onUpdate={val => actions.updateSelector('dateMax', val)}
                    defaultValue={defaultSelectors.network['selectors.dateMax']}
                  />
                </div>
              </div>
            </div>
            <div className="form-group-fixed">
              <button
                className="btn btn-default"
                data-loading={loading}
                disabled={!classification}
                onClick={actions.addNetwork}>
                Update
              </button>
            </div>
          </form>
        </div>

        {/* Content panel */}
        <Network
          ref={ref => (this.networkComponent = ref)}
          graph={graph}
          sizeKey={nodeSize}
          directed={directed}
          edgeSizeKey={edgeSize}
          labelThreshold={labelThreshold}
          labelSizeRatio={labelSizeRatio}
          setSelectedNode={this.setSelectedNode}
          toggleFullscreen={this.toggleFullscreen}
          alert={alert}
          loading={loading}
          className="col-xs-12 col-sm-6 col-md-8"
        />

        {/* Right panel */}
        <div
          className="aside-legend"
          ref={el => {
            this.legend = el;
          }}>
          <form onSubmit={e => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="edgeSize" className="control-label">
                Edge
              </label>
              <small className="help-block">Thickness</small>
              <Select
                name="edgeSize"
                valueKey="value"
                clearable={false}
                searchable={false}
                options={[
                  {
                    value: 'flows',
                    label: 'Nb of flows.',
                  },
                  {
                    value: 'value',
                    label: 'Value of flows.',
                  },
                ]}
                value={edgeSize}
                onChange={({value}) => actions.selectEdgeSize(value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="nodeSize" className="control-label">
                Node
              </label>
              <small className="help-block">Size</small>
              <Select
                name="nodeSize"
                valueKey="value"
                clearable={false}
                searchable={false}
                options={[
                  {
                    value: 'flows',
                    label: 'Nb of flows.',
                  },
                  {
                    value: 'value',
                    label: 'Value of flows.',
                  },
                  {
                    value: 'degree',
                    label: 'Degree.',
                  },
                ]}
                value={nodeSize}
                onChange={({value}) => actions.selectNodeSize(value)}
              />
            </div>
            <div className="form-group">
              <label className="control-label">Color</label>
              <ul className="list-unstyled list-legend list-legend-circle">
                <li>
                  <span style={{backgroundColor: '#E6830E'}} />
                  <span>Direction</span>
                </li>
                <li>
                  <span style={{backgroundColor: '#049B9A'}} />
                  <span>Partner</span>
                </li>
              </ul>
            </div>
            <div className="form-group">
              <label htmlFor="labelSize" className="control-label">
                Label
              </label>
              <div className="row">
                <div className="col-xs-6">
                  <small className="help-block">Size</small>
                  <Select
                    valueKey="value"
                    name="labelSize"
                    clearable={false}
                    searchable={false}
                    options={range(1, 10).map(num => ({
                      value: num + '',
                      label: num + '',
                    }))}
                    value={labelSizeRatio + ''}
                    onChange={({value}) => actions.selectLabelSizeRatio(+value)}
                  />
                </div>
                <div className="col-xs-6">
                  <small className="help-block">Threshold</small>
                  <Select
                    valueKey="value"
                    name="labelThreshold"
                    clearable={false}
                    searchable={false}
                    options={range(0, 20).map(num => ({
                      value: num + '',
                      label: num + '',
                    }))}
                    value={labelThreshold + ''}
                    onChange={({value}) => actions.selectLabelThreshold(+value)}
                  />
                </div>
              </div>
            </div>

            {selectedNode ? (
              <div className="node-display">
                <ul className="list-unstyled">
                  <li>
                    <span className="title">{selectedNode.label}</span>
                  </li>
                  <li>
                    Flows: <strong>{NUMBER_FORMAT(selectedNode.flows)}</strong>
                  </li>
                  <li>
                    Value: <strong>{NUMBER_FIXED_FORMAT(selectedNode.value)}</strong>
                  </li>
                  <li>
                    Degree: <strong>{NUMBER_FORMAT(selectedNode.degree)}</strong>
                  </li>
                </ul>
              </div>
            ) : (
              undefined
            )}
          </form>
          <div className="form-group-fixed form-group-fixed-right">
            <ExportButton
              exports={[
                {
                  label: 'Export CSV',
                  fn: () => {
                    this.exportCsv();
                  },
                },
                {
                  label: 'Export SVG',
                  fn: () => {
                    this.exportGraph();
                  },
                },
              ]}
            />
          </div>
        </div>
      </VizLayout>
    );
  }
}

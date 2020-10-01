/**
 * TOFLIT18 Client Terms Network Display
 * ======================================
 *
 * Displaying a network of product terms' decomposition.
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
  selectTerms,
  selectNodeSize,
  selectEdgeSize,
  selectLabelSizeRatio,
  selectLabelThreshold,
  updateSelector as update,
  addChart,
  checkDefaultState,
  checkGroups,
} from '../../actions/terms';
import Icon from '../misc/Icon.jsx';
const defaultSelectors = require('../../../config/defaultVizSelectors.json');

import specs from '../../../specs.json';

/**
 * Helper used to get the child classifications of the given classification.
 */
function getChildClassifications(index, targetId) {
  const children = [];
  const target = index[targetId];

  if (!target || !target.children || !target.children.length) return children;

  const stack = target.children.slice();

  while (stack.length) {
    const child = stack.pop();

    children.push(child);

    if (child.children) stack.push.apply(stack, child.children);
  }

  return children;
}

/**
 * Helper rendering the node information display.
 */
const NUMBER_FIXED_FORMAT = format(',.2f'),
  NUMBER_FORMAT = format(',');

/**
 * Main component.
 */
export default class ExplorationGlobalsTerms extends Component {
  render() {
    return (
      <div>
        <TermsPanel />
      </div>
    );
  }
}

@branch({
  actions: {
    selectTerms,
    selectNodeSize,
    selectEdgeSize,
    selectLabelSizeRatio,
    selectLabelThreshold,
    update,
    addChart,
    checkDefaultState,
    checkGroups,
  },
  cursors: {
    alert: ['ui', 'alert'],
    classifications: ['data', 'classifications', 'flat'],
    classificationIndex: ['data', 'classifications', 'index'],
    directions: ['data', 'directions'],
    sourceTypes: ['data', 'sourceTypes'],
    state: ['explorationTermsState'],
  },
})
class TermsPanel extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {selected: null, fullscreen: false};
    this.setSelectedNode = this.setSelectedNode.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
  }

  componentDidMount() {
    // Check for initial values:
    const state = this.props.state;
    const initialState = defaultSelectors.terms.initialValues;
    const hasInitialState = Object.keys(initialState).some(key =>
      key.split('.').reduce((iter, step) => iter && iter[step], state),
    );

    if (!hasInitialState) {
      this.props.actions.checkDefaultState(defaultSelectors.terms.initialValues);
    }

    this.props.actions.checkGroups(this.props.actions.addChart);
  }

  componentDidUpdate() {
    // Check for defaults:
    this.props.actions.checkDefaultState(defaultSelectors.terms.defaultValues);
  }

  exportCsv() {
    const now = new Date();
    exportCSV({
      data: this.props.state.data,
      name: `TOFLIT18_Product_terms_${now.toLocaleString('se-SE').replace(' ', '_')}.csv`,
    });
  }

  exportGraph() {
    const now = new Date();
    const graphSvg = sigma.instances(0).toSVG({
      labels: true,
    });
    exportSVG({
      nodes: [this.legend, graphSvg],
      name: `TOFLIT18_Product_terms_${now.toLocaleString('se-SE').replace(' ', '_')}.svg`,
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
      classificationIndex,
      directions,
      sourceTypes,
      state: {graph, classification, nodeSize, edgeSize, labelSizeRatio, labelThreshold, loading, selectors, groups},
    } = this.props;

    const {selectedNode, fullscreen} = this.state;

    const sourceTypesOptions = (sourceTypes || []).map(type => {
      return {
        name: type,
        value: type,
      };
    });

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

    let childClassifications = [];

    if (classification) childClassifications = getChildClassifications(classificationIndex, classification);

    return (
      <VizLayout
        title="Product terms"
        description="Choose a product classification and display a graph showing relations between terms of the aforementioned classification."
        leftPanelName="Filters"
        fullscreen={fullscreen}
        rightPanelName="Caption">
        {/* Top of the left panel */}
        <div className="box-selection">
          <h2 className="hidden-xs">
            <span className="hidden-sm hidden-md">Product</span> classification
          </h2>
          <ClassificationSelector
            valueKey="id"
            type="product"
            loading={!classifications.product.length}
            data={classifications.product}
            onChange={actions.selectTerms}
            onUpdate={actions.selectTerms}
            selected={classification}
            defaultValue={defaultSelectors.terms.classification}
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
                onChange={actions.update.bind(null, 'sourceType')}
                selected={selectors.sourceType}
                onUpdate={v => actions.update('sourceType', v)}
                defaultValue={defaultSelectors.terms['selectors.sourceType']}
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
                disabled={!childClassifications.length}
                loading={!classifications.product.length}
                data={childClassifications}
                onChange={actions.update.bind(null, 'childClassification')}
                selected={selectors.childClassification}
                onUpdate={v => actions.update('childClassification', v)}
                defaultValue={defaultSelectors.terms['selectors.childClassification']}
              />
              <ItemSelector
                valueKey="id"
                type="product"
                disabled={!selectors.childClassification || !groups.child.length}
                loading={selectors.childClassification && !groups.child.length}
                data={groups.child}
                onChange={actions.update.bind(null, 'child')}
                selected={selectors.child}
                onUpdate={v => actions.update('child', v)}
                defaultValue={defaultSelectors.terms['selectors.child']}
              />
            </div>
            <div className="form-group">
              <label htmlFor="partner" className="control-label">
                Partner
              </label>
              <small className="help-block">
                Whence products are exchanged.{' '}
                <a href="#/glossary/concepts">
                  <Icon name="icon-info" />
                </a>
              </small>
              <ClassificationSelector
                valueKey="id"
                type="partner"
                loading={!classifications.partner.length}
                data={classifications.partner.filter(c => !c.source)}
                onChange={actions.update.bind(null, 'partnerClassification')}
                selected={selectors.partnerClassification}
                onUpdate={v => actions.update('partnerClassification', v)}
                defaultValue={defaultSelectors.terms['selectors.partnerClassification']}
              />
              <ItemSelector
                valueKey="id"
                type="partner"
                disabled={!selectors.partnerClassification || !groups.partner.length}
                loading={selectors.partnerClassification && !groups.partner.length}
                data={groups.partner}
                onChange={actions.update.bind(null, 'partner')}
                selected={selectors.partner}
                onUpdate={v => actions.update('partner', v)}
                defaultValue={defaultSelectors.terms['selectors.partner']}
              />
            </div>
            <div className="form-group">
              <label htmlFor="direction" className="control-label">
                Direction
              </label>
              <small className="help-block">
                Where, in France, the transactions were recorded.{' '}
                <a href="#/glossary/concepts">
                  <Icon name="icon-info" />
                </a>
              </small>
              <ItemSelector
                valueKey="id"
                type="direction"
                loading={!directions}
                data={directions || []}
                onChange={actions.update.bind(null, 'direction')}
                selected={selectors.direction}
                onUpdate={v => actions.update('direction', v)}
                defaultValue={defaultSelectors.terms['selectors.direction']}
              />
            </div>
            <div className="form-group">
              <label htmlFor="kind" className="control-label">
                Kind
              </label>
              <small className="help-block">Should we look at import, export, or total?</small>
              <ItemSelector
                valueKey="id"
                type="kind"
                onChange={actions.update.bind(null, 'kind')}
                selected={selectors.kind}
                onUpdate={v => actions.update('kind', v)}
                defaultValue={defaultSelectors.terms['selectors.kind']}
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
                    onChange={actions.update.bind(null, 'dateMin')}
                    selected={selectors.dateMin}
                    onUpdate={v => actions.update('dateMin', v)}
                    defaultValue={defaultSelectors.terms['selectors.dateMin']}
                  />
                </div>
                <div className="col-xs-6">
                  <ItemSelector
                    valueKey="id"
                    type="dateMax"
                    data={dateMaxOptions}
                    onChange={actions.update.bind(null, 'dateMax')}
                    selected={selectors.dateMax}
                    onUpdate={v => actions.update('dateMax', v)}
                    defaultValue={defaultSelectors.terms['selectors.dateMax']}
                  />
                </div>
              </div>
            </div>
            <div className="form-group-fixed">
              <button
                className="btn btn-default"
                data-loading={loading}
                disabled={!classification}
                onClick={actions.addChart}>
                Update
              </button>
            </div>
          </form>
        </div>
        {/* Content panel */}
        <Network
          ref={ref => (this.networkComponent = ref)}
          graph={graph}
          directed={false}
          colorKey={'communityColor'}
          sizeKey={nodeSize}
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
              <small className="help-block">Community Louvain</small>
            </div>
            <div className="form-group">
              <label htmlFor="labelSize" className="control-label">
                Label
              </label>
              <div className="row">
                <div className="col-xs-6">
                  <small className="help-block">Size</small>
                  <Select
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

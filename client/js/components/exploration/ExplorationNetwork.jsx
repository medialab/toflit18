 /**
 * TOFLIT18 Client Network Viz Display
 * ====================================
 *
 * Displaying a network of places linked by their trade.
 */
import React, {Component} from 'react';
import {format} from 'd3-format';
import {range} from 'lodash';
import {branch} from 'baobab-react/decorators';
import {ClassificationSelector, ItemSelector} from '../misc/Selectors.jsx';
import Network from './viz/Network.jsx';
import VizLayout from '../misc/VizLayout.jsx';
import {buildDateMin} from '../../lib/helpers';
import {
  selectClassification,
  selectNodeSize,
  selectEdgeSize,
  selectLabelSizeRatio,
  selectLabelThreshold,
  updateSelector,
  addNetwork,
  updateDate
} from '../../actions/network';

const NUMBER_FIXED_FORMAT = format(',.2f'),
      NUMBER_FORMAT = format(',');

function renderNodeDisplay(props) {
  const {
    label,
    flows,
    value,
    degree
  } = props;

  return (
    <div>
      <strong>{label}</strong>
      <br />
      Flows: {NUMBER_FORMAT(flows)}
      <br />
      Value: {NUMBER_FIXED_FORMAT(value)}
      <br />
      Degree: {NUMBER_FORMAT(degree)}
    </div>
  );
}

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
    updateDate
  },
  cursors: {
    classifications: ['data', 'classifications', 'flat'],
    directions: ['data', 'directions'],
    sourceTypes: ['data', 'sourceTypes'],
    state: ['states', 'exploration', 'network']
  }
})
class NetworkPanel extends Component {
  render() {
    const {
      actions,
      classifications,
      sourceTypes,
      state: {
        graph,
        classification,
        nodeSize,
        edgeSize,
        labelSizeRatio,
        labelThreshold,
        loading,
        selectors,
        groups
      }
    } = this.props;

    let {
      state: {
        dateMin,
        dateMax
      }
    } = this.props;

    let dateMaxOptions, dateMinOptions;
    dateMin = actions.updateDate('dateMin');

    if (dateMin) {
      dateMaxOptions = dateMax ? dateMax : buildDateMin(dateMin.id, dateMax);
    }
    else {
      dateMaxOptions = dateMax ? dateMax : buildDateMin(dateMin, dateMax);
    }

    dateMax = actions.updateDate('dateMax');
    if (dateMax) {
      dateMinOptions = dateMin ? dateMin : buildDateMin(dateMin, dateMax.id);
    }
    else {
      dateMinOptions = dateMin ? dateMin : buildDateMin(dateMin, dateMax);
    }

    const sourceTypesOptions = (sourceTypes || []).map(type => {
      return {
        name: type,
        value: type
      };
    });

    return (
      <VizLayout
        title="Countries"
        description="Choose a country classification and display a graph showing relations between countries & directions."
        leftPanelName="Left panel name"
        rightPanelName="Right panel name" >
        { /* Top of the left panel */ }
        <div className="box-selection">
          <h2 className="hidden-xs">
            <span className="hidden-sm hidden-md">Country</span> classification
          </h2>
          <ClassificationSelector
            type="country"
            loading={!classifications.country.length}
            data={classifications.country}
            onChange={actions.selectClassification}
            selected={classification} />
        </div>

        { /* Left panel */ }
        <div className="aside-filters">
          <h3>Filters</h3>
          <form onSubmit={e => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="sourceType" className="control-label">Source Type</label>
              <small className="help-block">From wich sources does the data comes from ?</small>
              <ItemSelector
                type="sourceType"
                data={sourceTypesOptions}
                loading={!sourceTypesOptions.length}
                onChange={val => actions.updateSelector('sourceType', val)}
                selected={selectors.sourceType} />
            </div>
            <div className="form-group">
              <label htmlFor="product" className="control-label">Product</label>
              <small className="help-block">The type of product being shipped.</small>
              <ClassificationSelector
                type="product"
                placeholder="Child classification..."
                loading={!classifications.product.length}
                data={classifications.product.filter(c => !c.source)}
                onChange={val => actions.updateSelector('productClassification', val)}
                selected={selectors.productClassification} />
              <ItemSelector
                type="product"
                disabled={!selectors.productClassification || !groups.product.length}
                loading={selectors.productClassification && !groups.product.length}
                data={groups.product}
                onChange={val => actions.updateSelector('product', val)}
                selected={selectors.product} />
            </div>
            <div className="form-group">
              <label htmlFor="kind" className="control-label">Kind</label>
              <small className="help-block">Should we look at import, export, or total?</small>
              <ItemSelector
                type="kind"
                onChange={val => actions.updateSelector('kind', val)}
                selected={selectors.kind} />
            </div>
            <div className="form-group">
              <label htmlFor="dates" className="control-label">Dates</label>
              <small className="help-block">Choose one date or a range data</small>
              <div className="row">
                <div className="col-xs-6">
                  <ItemSelector
                    type="dateMin"
                    data={dateMinOptions}
                    onChange={val => actions.updateSelector('dateMin', val)}
                    selected={selectors.dateMin} />
                </div>
                <div className="col-xs-6">
                  <ItemSelector
                    type="dateMax"
                    data={dateMaxOptions}
                    onChange={val => actions.updateSelector('dateMax', val)}
                    selected={selectors.dateMax} />
                </div>
              </div>
            </div>
            <div className="form-group-fixed">
              <button
                className="btn btn-default"
                data-loading={loading}
                disabled={!classification}
                onClick={actions.addNetwork} >
                Update
              </button>
            </div>
          </form>
        </div>

        { /* Content panel */ }
        <Network
          ref={ref => this.networkComponent = ref}
          graph={graph}
          directed
          colorKey={'communityColor'}
          sizeKey={nodeSize}
          edgeSizeKey={edgeSize}
          labelThreshold={labelThreshold}
          labelSizeRatio={labelSizeRatio}
          nodeDisplayRenderer={renderNodeDisplay}
          className="col-xs-12 col-sm-6 col-md-8" />

        { /* Right panel */ }
        <div className="aside-legend">
          <form onSubmit={e => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="edgeSize" className="control-label">Edge</label>
              <small className="help-block">Thickness</small>
              <select
                id="edgeSize"
                value={edgeSize}
                onChange={e => actions.selectEdgeSize(e.target.value)} >{
                [
                  {
                    id: 'flows',
                    label: 'Nb of flows.',
                  }, {
                    id: 'value',
                    label: 'Value of flows.',
                  }
                ].map(({id, label}) => (
                  <option
                    key={id}
                    value={id} >{
                      label
                  }</option>
                ))
              }</select>
            </div>
            <div className="form-group">
              <label htmlFor="nodeSize" className="control-label">Node</label>
              <small className="help-block">Size</small>
              <select
                id="nodeSize"
                value={nodeSize}
                onChange={e => actions.selectNodeSize(e.target.value)} >{
                [
                  {
                    id: 'flows',
                    label: 'Nb of flows.',
                  }, {
                    id: 'value',
                    label: 'Value of flows.',
                  }, {
                    id: 'degree',
                    label: 'Degree.',
                  }
                ].map(({id, label}) => (
                  <option
                    key={id}
                    value={id} >{
                      label
                  }</option>
                ))
              }</select>
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
                  <span>Country</span>
                </li>
              </ul>
            </div>
            <div className="form-group">
              <label htmlFor="labelSize" className="control-label">Label</label>
              <div className="row">
                <div className="col-xs-6">
                  <small className="help-block">Size</small>
                  <select
                    id="labelSize"
                    value={labelSizeRatio}
                    onChange={e => actions.selectLabelSizeRatio(+e.target.value)} >{
                    range(1, 10).map(num => (
                      <option
                        key={num}
                        value={num} >{
                          num
                      }</option>
                    ))
                  }</select>
                </div>
                <div className="col-xs-6">
                  <small className="help-block">Threshold</small>
                  <select
                    id="labelThreshold"
                    value={labelThreshold}
                    onChange={e => actions.selectLabelThreshold(+e.target.value)} >{
                    range(0, 20).map(num => (
                      <option
                        key={num}
                        value={num} >{
                          num
                      }</option>
                    ))
                  }</select>
                </div>
              </div>
            </div>
          </form>
          <div className="form-group-fixed form-group-fixed-right">
            <button
              className="btn btn-default"
              onClick={() => this.export()}>
              Export
            </button>
          </div>
        </div>
      </VizLayout>
    );
  }
}

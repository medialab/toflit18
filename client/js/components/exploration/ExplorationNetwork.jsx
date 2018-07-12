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
import {ClassificationSelector, ItemSelector} from '../misc/Selectors.jsx';
import Network from './viz/Network.jsx';
import VizLayout from '../misc/VizLayout.jsx';
import {exportCSV} from '../../lib/exports';
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
import {Link} from 'react-router';
import Icon from '../misc/Icon.jsx';

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
    updateDate
  },
  cursors: {
    alert: ['ui', 'alert'],
    classifications: ['data', 'classifications', 'flat'],
    directions: ['data', 'directions'],
    sourceTypes: ['data', 'sourceTypes'],
    state: ['states', 'exploration', 'network']
  }
})
class NetworkPanel extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {selected: null, fullscreen: false};
    this.setSelectedNode = this.setSelectedNode.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
  }

  export() {
    exportCSV({
      data: this.props.state.data,
      name: 'Toflit18_Global_Trade_Countries_Network_view.csv',
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

    const {
      selectedNode,
      fullscreen
    } = this.state;

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

    const directed = selectors.kind && selectors.kind.id !== 'total';

    
    return (
      <VizLayout
        title="Locations"
        description="Choose a country classification and display a graph showing relations between countries & directions."
        leftPanelName="Filters"
        rightPanelName="Caption"
        fullscreen={fullscreen} >
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
              <small className="help-block">Type of sources the data comes from. <Link to="/exploration/sources"><Icon name="icon-info" /></Link></small>
              <ItemSelector
                type="sourceType"
                data={sourceTypesOptions}
                loading={!sourceTypesOptions.length}
                onChange={val => actions.updateSelector('sourceType', val)}
                selected={selectors.sourceType} />
            </div>
            <div className="form-group">
              <label htmlFor="product" className="control-label">Product</label>
              <small className="help-block">The type of product being shipped. <Link to="/glossary/concepts"><Icon name="icon-info" /></Link></small>
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
          sizeKey={nodeSize}
          directed={directed}
          edgeSizeKey={edgeSize}
          labelThreshold={labelThreshold}
          labelSizeRatio={labelSizeRatio}
          setSelectedNode={this.setSelectedNode}
          toggleFullscreen={this.toggleFullscreen}
          alert={alert}
          loading={loading}
          className="col-xs-12 col-sm-6 col-md-8" />

        { /* Right panel */ }
        <div className="aside-legend">
          <form onSubmit={e => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="edgeSize" className="control-label">Edge</label>
              <small className="help-block">Thickness</small>
              <Select
                name="edgeSize"
                clearable={false}
                searchable={false}
                options={[
                  {
                    value: 'flows',
                    label: 'Nb of flows.',
                  }, {
                    value: 'value',
                    label: 'Value of flows.',
                  }
                ]}
                value={edgeSize}
                onChange={({value}) => actions.selectEdgeSize(value)} />
            </div>
            <div className="form-group">
              <label htmlFor="nodeSize" className="control-label">Node</label>
              <small className="help-block">Size</small>
              <Select
                name="nodeSize"
                clearable={false}
                searchable={false}
                options={[
                  {
                    value: 'flows',
                    label: 'Nb of flows.',
                  }, {
                    value: 'value',
                    label: 'Value of flows.',
                  }, {
                    value: 'degree',
                    label: 'Degree.',
                  }
                ]}
                value={nodeSize}
                onChange={({value}) => actions.selectNodeSize(value)} />
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
                  <Select
                    name="labelSize"
                    clearable={false}
                    searchable={false}
                    options={range(1, 10).map(num => ({
                      value: num + '',
                      label: num + '',
                    }))}
                    value={labelSizeRatio + ''}
                    onChange={({value}) => actions.selectLabelSizeRatio(+value)} />
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
                    onChange={({value}) => actions.selectLabelThreshold(+value)} />
                </div>
              </div>
            </div>

            {
              selectedNode ?
                <div className="node-display">
                  <ul className="list-unstyled">
                    <li><span className="title">{selectedNode.label}</span></li>
                    <li>Flows: <strong>{NUMBER_FORMAT(selectedNode.flows)}</strong></li>
                    <li>Value: <strong>{NUMBER_FIXED_FORMAT(selectedNode.value)}</strong></li>
                    <li>Degree: <strong>{NUMBER_FORMAT(selectedNode.degree)}</strong></li>
                  </ul>
                </div> :
                undefined
            }
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

  componentDidMount(){
    const {
      actions
    } = this.props;

    // default network rendering
    actions.addNetwork();

  }
}

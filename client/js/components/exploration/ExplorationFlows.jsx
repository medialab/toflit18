/**
 * TOFLIT18 Client Terms Network Display
 * ======================================
 *
 * Displaying a network of product terms' decomposition.
 */
import React, {Component} from 'react';
import {range} from 'lodash';
import {branch} from 'baobab-react/decorators';
import Button, {ExportButton} from '../misc/Button.jsx';
import {ClassificationSelector, ItemSelector} from '../misc/Selectors.jsx';
import FlowsTable from './viz/DataTable.jsx';
import VizLayout from '../misc/VizLayout.jsx';
import {
  updateSelector as update,
  initFlowTable,
  checkDefaultState,
  checkGroups,
  changePage,
  downloadFlowsCSV,
} from '../../actions/flows';
import Icon from '../misc/Icon.jsx';
const defaultSelectors = require('../../../config/defaultVizSelectors.json');

import specs from '../../../specs.json';

/**
 * Main component.
 */
export default class ExplorationFlows extends Component {
  render() {
    return (
      <div>
        <Flows />
      </div>
    );
  }
}

@branch({
  actions: {
    update,
    initFlowTable,
    checkDefaultState,
    checkGroups,
    changePage,
    downloadFlowsCSV,
  },
  cursors: {
    alert: ['ui', 'alert'],
    classifications: ['data', 'classifications', 'flat'],
    classificationIndex: ['data', 'classifications', 'index'],
    regions: ['data', 'regions'],
    sourceTypes: ['data', 'sourceTypes'],
    state: ['explorationFlowsState'],
  },
})
class Flows extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {selected: null, fullscreen: false};
  }

  componentDidMount() {
    // Check for initial values:
    const state = this.props.state;
    const initialState = defaultSelectors.flows.initialValues;
    const hasInitialState = Object.keys(initialState).some(key =>
      key.split('.').reduce((iter, step) => iter && iter[step], state),
    );

    if (!hasInitialState) {
      this.props.actions.checkDefaultState(defaultSelectors.flows.initialValues);
    }

    this.props.actions.checkGroups(this.props.actions.initFlowTable);
  }

  componentDidUpdate() {
    // Check for defaults:
    this.props.actions.checkDefaultState(defaultSelectors.flows.defaultValues);
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
      regions,
      sourceTypes,
      state: {flows, nbFlows, loading, selectors, groups, page, CSVloading},
    } = this.props;

    const {fullscreen} = this.state;

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
    const classifToColumnsChoices = (cs, model) => cs.map(cp => ({...cp, name: `${cp.name} (${model})`}));
    const columnsOptions = [
      ...specs.flowsColumns,
      ...classifToColumnsChoices(classifications.product, 'products'),
      ...classifToColumnsChoices(classifications.partner, 'partners'),
    ];

    return (
      <VizLayout
        title="Trade flows"
        description="Explore trade flows"
        leftPanelName="Filters"
        fullscreen={fullscreen}
        rightPanelName="Caption"
      >
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
                defaultValue={defaultSelectors.flows['selectors.sourceType']}
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
                placeholder="Product classification..."
                loading={!classifications.product.length}
                data={classifications.product.filter(c => !c.source)}
                onChange={actions.update.bind(null, 'productClassification')}
                selected={selectors.productClassification}
                onUpdate={v => actions.update('productClassification', v)}
                defaultValue={defaultSelectors.flows['selectors.productClassification']}
              />
              <ItemSelector
                valueKey="id"
                type="product"
                disabled={!selectors.productClassification || !groups.product.length}
                loading={selectors.productClassification && !groups.product.length}
                data={groups.product}
                onChange={actions.update.bind(null, 'product')}
                selected={selectors.product}
                onUpdate={v => actions.update('product', v)}
                defaultValue={defaultSelectors.flows['selectors.product']}
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
                defaultValue={defaultSelectors.flows['selectors.partnerClassification']}
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
                defaultValue={defaultSelectors.flows['selectors.partner']}
              />
            </div>
            <div className="form-group">
              <label htmlFor="region" className="control-label">
                Customs region
              </label>
              <small className="help-block">
                Where, in France, the transactions were recorded.{' '}
                <a href="#/glossary/concepts">
                  <Icon name="icon-info" />
                </a>
              </small>
              <ItemSelector
                valueKey="id"
                type="region"
                loading={!regions}
                data={regions || []}
                onChange={actions.update.bind(null, 'region')}
                selected={selectors.region}
                onUpdate={v => actions.update('region', v)}
                defaultValue={defaultSelectors.flows['selectors.region']}
              />
            </div>
            <div className="form-group">
              <label htmlFor="kind" className="control-label">
                Export/Import
              </label>
              <small className="help-block">Should we look at import, export, or total?</small>
              <ItemSelector
                valueKey="id"
                type="kind"
                onChange={actions.update.bind(null, 'kind')}
                selected={selectors.kind}
                onUpdate={v => actions.update('kind', v)}
                defaultValue={defaultSelectors.flows['selectors.kind']}
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
                    defaultValue={defaultSelectors.flows['selectors.dateMin']}
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
                    defaultValue={defaultSelectors.flows['selectors.dateMax']}
                  />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="dates" className="control-label">
                Value
              </label>
              <small className="help-block">Choose a min and/or max flow value</small>
              <div className="row">
                <div className="col-xs-6">
                  <input
                    type="number"
                    min="0"
                    placeholder="minimal"
                    onChange={e => actions.update('valueMin', e.target.value)}
                    value={selectors.valueMin || ''}
                  />
                </div>
                <div className="col-xs-6">
                  <input
                    type="number"
                    min="0"
                    placeholder="maximal"
                    onChange={e => actions.update('valueMax', e.target.value)}
                    value={selectors.valueMax || ''}
                  />
                </div>
              </div>
            </div>

            <div className="form-group-fixed">
              <button className="btn btn-default" data-loading={loading} onClick={() => actions.initFlowTable(0)}>
                Update
              </button>
            </div>
          </form>
        </div>
        {/* Content panel */}
        <div className="col-xs-12 col-sm-6 col-md-8" style={{overflowX: 'hidden', overflowY: 'hidden', padding: 0}}>
          {(alert || loading || CSVloading) && (
            <div className="progress-container progress-container-viz">
              {alert && (
                <div className="alert alert-danger" role="alert">
                  {alert}
                </div>
              )}
              {(loading || CSVloading) && (
                <div className="progress-line progress-line-viz">
                  <span className="sr-only">Loading...</span>
                </div>
              )}
            </div>
          )}
          <FlowsTable
            flows={flows}
            columnsOrder={selectors.columns || []}
            columnsOptions={columnsOptions}
            loading={loading}
            alert={alert}
            nbFlows={flows}
            orders={selectors.orders || []}
          />
        </div>
        {/* Right panel */}
        <div
          className="aside-legend"
          ref={el => {
            this.legend = el;
          }}
        >
          <form onSubmit={e => e.preventDefault()}>
            {/*  COLUMNS SELECTION */}
            <div className="form-group">
              <label className="control-label">Columns selection</label>
              <small className="help-block">Change the columns order by draggin/dropping the table headers.</small>

              <ItemSelector
                id="columnsSelector"
                valueKey="id"
                type="columns"
                //loading={selectors.partnerClassification && !groups.partner.length}
                data={columnsOptions}
                onChange={actions.update.bind(null, 'columns')}
                selected={selectors.columns}
                onUpdate={v => actions.update('columns', v)}
                defaultValue={defaultSelectors.flows['selectors.columns']}
              />
            </div>
            {/* PAGINATION */}
            <div className="form-group">
              <label className="control-label">Pagination</label>
              <div>
                <b>{nbFlows}</b> flows selected
              </div>
              <small className="help-block">A maximum of {specs.flowsRowsMax} flows are displayed per page.</small>
              <div className="row">
                <div className="col-xs-3">
                  <Button
                    size="small"
                    kind="default"
                    disabled={page === 0}
                    onClick={() => actions.changePage(page - 1)}
                  >
                    <b>{'<<'}</b>
                  </Button>
                </div>
                <div className="col-xs-6">
                  <ItemSelector
                    id="pageSelector"
                    valueKey="id"
                    type="page"
                    //loading={selectors.partnerClassification && !groups.partner.length}
                    data={range(1, nbFlows / specs.flowsRowsMax).map(v => ({id: v, name: `page ${v}`}))}
                    onChange={v => actions.changePage(v)}
                    selected={page + 1}
                    onUpdate={v => actions.changePage(v)}
                  />
                </div>
                <div className="col-xs-3">
                  <Button
                    size="small"
                    kind="default"
                    disabled={!nbFlows || nbFlows < specs.flowsRowsMax * (page + 1)}
                    onClick={() => actions.changePage(page + 1)}
                  >
                    <b>{'>>'}</b>
                  </Button>
                </div>
              </div>
            </div>
            <div className="form-group-fixed form-group-fixed-right">
              <ExportButton
                loading={CSVloading}
                disabled={nbFlows > specs.flowsExportMax}
                exports={[
                  {
                    label: 'Export CSV',
                    fn: () => {
                      actions.downloadFlowsCSV();
                    },
                  },
                ]}
              />
              {nbFlows > specs.flowsExportMax && (
                <small className="help-block">
                  Export in CSV only possible for less than {specs.flowsExportMax} flows. Adjust a more precise set of
                  filters to be able to export.
                </small>
              )}
            </div>
          </form>
        </div>
      </VizLayout>
    );
  }
}

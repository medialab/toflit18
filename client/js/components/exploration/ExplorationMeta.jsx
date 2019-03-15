/**
 * TOFLIT18 Client Meta Viz Display
 * =================================
 *
 * Displaying a collection of visualizations dealing with the sources
 * themselves and how they interact with each other.
 */
import {compact} from 'lodash';
import React, {Component} from 'react';
import {Waiter} from '../misc/Loaders.jsx';
import {ExportButton} from '../misc/Button.jsx';
import {ClassificationSelector, ItemSelector} from '../misc/Selectors.jsx';
import {branch} from 'baobab-react/decorators';
import {Link} from 'react-router';

import DataQualityBarChart from './viz/DataQualityBarChart.jsx';
import SourcesPerDirections from './viz/SourcesPerDirections.jsx';

import {exportCSV, exportSVG} from '../../lib/exports';
import VizLayout from '../misc/VizLayout.jsx';
import Icon from '../misc/Icon.jsx';

import specs from '../../../specs.json';

import {
  selectType,
  selectModel,
  updateSelector as update,
  addChart
} from '../../actions/metadata';

const defaultSelectors = require('../../../config/defaultVizSelectors.json');
import { checkDefaultValues } from './utils';

/**
 * Helper used to get the child classifications of the given classification.
 */
function getChildClassifications(index, target) {
  const children = [];

  // target can only contain an id (default settings)
  // in that case copy children from index
  if(index[target.id])
    target = index[target.id];

  if (!target.children || !target.children.length)
    return children;

  const stack = target.children.slice();

  while (stack.length) {
    const child = stack.pop();

    children.push(child);

    if (child.children)
      stack.push.apply(stack, child.children);
  }

  return children;
}


const metadataSelectors = (specs.metadataSelectors || []).map(option => {
  return {
    ...option,
    special: true
  };
});

function formatArrayToCSV(data) {
  const newArray = [];

  data.forEach((d) =>
    d.data.forEach((e) =>
      newArray.push({
        name: d.name,
        flows: e.flows,
        year: e.year
      })
    )
  );

  return newArray;
}

@branch({
  actions: {
    update,
    addChart,
    selectType,
    selectModel
  },
  cursors: {
    alert: ['ui', 'alert'],
    classifications: ['data', 'classifications', 'flat'],
    classificationIndex: ['data', 'classifications', 'index'],
    directions: ['data', 'directions'],
    sourceTypes: ['data', 'sourceTypes'],
    state: ['states', 'exploration', 'metadata']
  }
})
export default class ExplorationMeta extends Component {
  getUnit() {
    const {state} = this.props;
    if (state.dataModel) {
      if (state.dataModel.value === 'sourceType') return 'source types';
      if (state.dataModel.value === 'direction') return 'directions';
      if (state.dataModel.value === 'product') return 'products';
      if (state.dataModel.value === 'country') return 'countries';
    }
    return '...';
  }
  canDisplaySecondViz() {
    const {state} = this.props;
    return (
      state.dataModel &&
      (
        (state.flowsPerYear && state.flowsPerYear.length < specs.metadataGroupMax) ||
        state.dataType && state.dataType.special
      )
    );
  }
  exportPerYear() {
    const {state} = this.props;
    const name = compact([
      state.dataModel.name,
      state.dataType && state.dataType.name,
      state.filename
    ]).join(' - ');

    exportCSV({
      data: state.perYear,
      name: `TOFLIT18_Metadata_${name}_data_per_year.csv`,
    });
  }
  exportFlows() {
    const {state} = this.props;
    const name = compact([
      state.dataModel.name,
      state.dataType && state.dataType.name,
      state.filename
    ]).join(' - ');

    exportCSV({
      data: formatArrayToCSV(state.flowsPerYear || []),
      name: `TOFLIT18_Metadata_${name}_flows_per_year.csv`,
    });
  }
  exportCharts() {
    const {state} = this.props;
    const name = compact([
      state.dataModel.name,
      state.dataType && state.dataType.name,
      state.filename
    ]).join(' - ');

    exportSVG({
      nodes: [this.legendContainer, this.vizContainer],
      name: `TOFLIT18_Metadata_${name}_charts.svg`
    });
  }

  render() {
    const {
      alert,
      actions,
      classifications,
      classificationIndex,
      directions,
      sourceTypes,
      state
    } = this.props;

    const {
      groups,
      loading,
      selectors
    } = state;


    const canDisplaySecondViz = this.canDisplaySecondViz();

    let canUpdate = !!state.dataModel;

    if (
      state.dataModel
      && (state.dataModel.value === 'country' || state.dataModel.value === 'product')
      && !state.dataType
    ) {
      canUpdate = false;
    }

    const sourceTypesOptions = (sourceTypes || []).map(type => {
      return {
        name: type,
        value: type
      };
    });

    // Computing bar chart's data
    let barData = [];

    if (state.perYear && state.perYear.length) {
      const minYear = state.perYear[0].year;

      const maxYear = state.perYear[state.perYear.length - 1].year;

      barData = new Array(maxYear - minYear + 1);

      const hash = year => year - minYear;

      for (let i = 0, l = barData.length; i < l; i++)
        barData[i] = {year: minYear + i};

      state.perYear.forEach(line => {
        const h = hash(line.year);
        barData[h].data = line.data;
      });
    }

    let unit = 'classified items';

    if (state.dataModel) {
      if (state.dataModel.value === 'sourceType') unit = 'source types';
      if (state.dataModel.value === 'direction') unit = 'directions';
      if (state.dataModel.value === 'product') unit = 'products';
      if (state.dataModel.value === 'country') unit = 'countries';
    }

    let childClassifications;

    if (state.dataType && !!state.dataType.model)
      childClassifications = getChildClassifications(classificationIndex, state.dataType);

    return (
      <VizLayout
        title="Metadata"
        description="Select a variable to see the number different values of this variable for each year and (if there are less than 20 different values) the number of trade flows pertaining to each value."
        leftPanelName="Filters"
        rightPanelName="Caption" >
        { /* Top of the left panel */ }
        <div className="box-selection box-selection-lg">
          <h2 className="hidden-xs"><span className="hidden-sm hidden-md">The type of </span><span>data</span></h2>
          <div className="form-group">
            <label htmlFor="classifications" className="control-label sr-only">Type of data</label>
            <ItemSelector
              type="dataModel"
              data={metadataSelectors}
              onChange={val => {
                actions.update('sourceType', null);
                actions.selectModel(val);
              }}
              selected={state.dataModel}
              onUpdate={val => {
                actions.update('sourceType', null);
                actions.selectModel(val);
              }}
              defaultValue={defaultSelectors.metadata.dataModel} />
          </div>
          {
            /* eslint-disable no-nested-ternary */
            (state.dataModel && state.dataModel.value === 'product') ?
              <div className="form-group">
                <label htmlFor="classifications" className="control-label sr-only">Product</label>
                <ItemSelector
                  type="dataType"
                  data={classifications.product}
                  loading={!classifications.product.length}
                  onChange={actions.selectType}
                  selected={state.dataType}
                  onUpdate={actions.selectType}
                  defaultValue={defaultSelectors.metadata['selectors.product']} />
              </div> :
            (state.dataModel && state.dataModel.value === 'country') ?
              <div className="form-group">
                <label htmlFor="classifications" className="control-label sr-only">Country</label>
                <ItemSelector
                  type="dataType"
                  data={classifications.country}
                  loading={!classifications.country.length}
                  onChange={actions.selectType}
                  selected={state.dataType}
                  onUpdate={actions.selectType}
                  defaultValue={defaultSelectors.metadata['selectors.country']} />
              </div> :
              undefined
              /* eslint-enable no-nested-ternary */
          }
        </div>

        { /* Left panel */ }
        <div className="aside-filters">
          <h3>Filters</h3>
          <form onSubmit={e => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="product" className="control-label">{
                (state.dataType && state.dataType.model === 'product') ? 'Child product' : 'Product'
              }</label>
              <small className="help-block">The type of product being shipped.<Link to="/glossary/concepts"><Icon name="icon-info" /></Link></small> 
              <ClassificationSelector
                type="product"
                loading={!classifications.product.length}
                data={(state.dataType && state.dataType.model === 'product') ? childClassifications : classifications.product.filter(c => !c.source)}
                onChange={actions.update.bind(null, 'productClassification')}
                selected={selectors.productClassification}
                onUpdate={v => actions.update('productClassification', v)}
                defaultValue={defaultSelectors.metadata['selectors.productClassification']} />
              <ItemSelector
                type="product"
                disabled={!selectors.productClassification || !groups.product.length}
                loading={selectors.productClassification && !groups.product.length}
                data={groups.product}
                onChange={actions.update.bind(null, 'product')}
                selected={selectors.product}
                onUpdate={v => actions.update('product', v)}
                defaultValue={defaultSelectors.metadata['selectors.product']} />
            </div>
            <div className="form-group">
              <label htmlFor="country" className="control-label">{
                (state.dataType && state.dataType.model === 'country') ? 'Child country' : 'Country'
              }</label>
              <small className="help-block">The country whence we got the products or wither we are sending them.<Link to="/glossary/concepts"><Icon name="icon-info" /></Link></small>
              <ClassificationSelector
                type="country"
                loading={!classifications.country.length}
                data={(state.dataType && state.dataType.model === 'country') ? childClassifications : classifications.country.filter(c => !c.source)}
                onChange={actions.update.bind(null, 'countryClassification')}
                selected={selectors.countryClassification}
                onUpdate={v => actions.update('countryClassification', v)}
                defaultValue={defaultSelectors.metadata['selectors.countryClassification']} />
              <ItemSelector
                type="country"
                disabled={!selectors.countryClassification || !groups.country.length}
                loading={selectors.countryClassification && !groups.country.length}
                data={groups.country}
                onChange={actions.update.bind(null, 'country')}
                selected={selectors.country}
                onUpdate={v => actions.update('country', v)}
                defaultValue={defaultSelectors.metadata['selectors.country']} />
            </div>
            <div className="form-group">
              <label htmlFor="direction" className="control-label">Sources</label>
              <small className="help-block">The type of source from which the data are extracted. <Link to="/data/sources"><Icon name="icon-info" /></Link></small>
              <ItemSelector
                type="sourceType"
                data={sourceTypesOptions}
                disabled={state.dataModel && state.dataModel.value === 'sourceType'}
                loading={!sourceTypesOptions.length}
                onChange={actions.update.bind(null, 'sourceType')}
                selected={selectors.sourceType}
                onUpdate={v => actions.update('sourceType', v)}
                defaultValue={defaultSelectors.metadata['selectors.sourceType']} />
            </div>
            <div className="form-group">
              <label htmlFor="direction" className="control-label">Direction</label>
              <small className="help-block">The French harbor where the transactions were recorded. <Link to="/glossary/concepts"><Icon name="icon-info" /></Link></small>
              <ItemSelector
                type="direction"
                loading={!directions}
                disabled={state.dataModel && state.dataModel.value === 'direction'}
                data={directions || []}
                onChange={actions.update.bind(null, 'direction')}
                selected={selectors.direction}
                onUpdate={v => actions.update('direction', v)}
                defaultValue={defaultSelectors.metadata['selectors.direction']} />
            </div>
            <div className="form-group">
              <label htmlFor="kind" className="control-label">Kind</label>
              <small className="help-block">Should we look at import, export, or total?</small>
              <ItemSelector
                type="kind"
                onChange={actions.update.bind(null, 'kind')}
                selected={selectors.kind}
                onUpdate={v => actions.update('kind', v)}
                defaultValue={defaultSelectors.metadata['selectors.kind']} />
            </div>
            <div className="form-group-fixed">
              <button
                type="submit"
                className="btn btn-default"
                data-loading={loading}
                disabled={!canUpdate}
                onClick={actions.addChart}>
                Update
              </button>
            </div>
          </form>
        </div>

        { /* Content panel */ }
        <div className="col-xs-12 col-sm-6 col-md-8">
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

          <div
            className="viz-data"
            ref={el => {
              this.vizContainer = el;
            }}>
            {state.perYear && state.dataModel && (
              <div className="box-viz">
                {state.perYear ?
                  <div>
                    <p>Total number of {unit} per year</p>
                    <DataQualityBarChart
                      yAxis
                      data={barData}
                      unit={unit}
                      syncId="sources-per-directions" />
                  </div> :
                  <Waiter />}
              </div>
            )}
            {canDisplaySecondViz && state.flowsPerYear && state.dataModel && (
              <div className="box-viz">
                {state.flowsPerYear ?
                  <SourcesPerDirections data={state.flowsPerYear} /> :
                  <Waiter />}
              </div>
            )}
          </div>
        </div>

        { /* Right panel */ }
        <div
          className="aside-legend"
          ref={el => {
            this.legendContainer = el;
          }}>
          <ul className="list-unstyled list-legend">
            <li><span style={{backgroundColor: '#8d4d42'}} />Number of {this.getUnit()}</li>
            <li><span style={{backgroundColor: '#4F7178'}} />Number of flows</li>
          </ul>
          <p>Barcharts are sorted by average number of flows per year.</p>
          <div className="form-group-fixed form-group-fixed-right">
            <ExportButton
              exports={compact([
                state.perYear && state.dataModel && {
                  label: 'Export direction by years',
                  fn: () => {
                    this.exportPerYear();
                  }
                },
                canDisplaySecondViz && state.flowsPerYear && state.dataModel && {
                  label: 'Export metadata',
                  fn: () => {
                    this.exportFlows();
                  }
                },
                state.dataModel && (state.perYear || state.flowsPerYear) && {
                  label: 'Export charts',
                  fn: () => {
                    this.exportCharts();
                  }
                }
              ])} />
          </div>
        </div>
      </VizLayout>
    );
  }

  componentDidUpdate(){

     if (!this.props.state.flowsPerYear && !!this.props.state.dataModel && !this.props.state.loading) {
      // - default values are set
      console.log('checking default')
      if (checkDefaultValues(defaultSelectors.metadata, this.props.state) && !this.props.state.loading){
        console.log("trigering default addNetwork")
        this.props.actions.addChart();
      }
    }

  }
}

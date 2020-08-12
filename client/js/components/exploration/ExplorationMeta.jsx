/**
 * TOFLIT18 Client Meta Viz Display
 * =================================
 *
 * Displaying a collection of visualizations dealing with the sources
 * themselves and how they interact with each other.
 */
import {compact, capitalize} from 'lodash';
import React, {Component} from 'react';
import {Waiter} from '../misc/Loaders.jsx';
import {ExportButton} from '../misc/Button.jsx';
import {ClassificationSelector, ItemSelector} from '../misc/Selectors.jsx';
import {branch} from 'baobab-react/decorators';

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

/**
 * Helper used to get the child classifications of the given classification.
 */
function getChildClassifications(index, id) {
  const children = [];
  const target = index[id];

  if (!target || !target.children || !target.children.length)
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
    classificationsRaw: ['data', 'classifications', 'raw'],
    classifications: ['data', 'classifications', 'flat'],
    classificationIndex: ['data', 'classifications', 'index'],
    directions: ['data', 'directions'],
    sourceTypes: ['data', 'sourceTypes'],
    state: ['metadataState']
  }
})
export default class ExplorationMeta extends Component {
  componentDidMount() {
    if (this.props.classificationsRaw) this.bootstrap();
  }
  componentDidUpdate(prevProps) {
    if (this.props.classificationsRaw && !prevProps.classificationsRaw) this.bootstrap();
  }

  /**
   * This method loads potential initial missing data and adds charts. It must be called after the initial
   * classifications data have been loaded:
   */
  bootstrap() {
    let waiting = 0;
    const callback = () => {
      waiting--;
      if (!waiting) {
        this.props.actions.addChart();
      }
    };

    const {productClassification, partnerClassification} = this.props.state.selectors;
    if (productClassification) {
      waiting++;
      this.props.actions.update('productClassification', productClassification, callback);
    }
    if (partnerClassification) {
      waiting++;
      this.props.actions.update('partnerClassification', partnerClassification, callback);
    }

    if (!productClassification && !partnerClassification) {
      this.props.actions.addChart();
    }
  }

  getUnit() {
    const {state} = this.props;

    if (state.dataModel === 'sourceType') return 'source types';
    if (state.dataModel === 'direction') return 'directions';
    if (state.dataModel === 'product') return 'products';
    if (state.dataModel === 'partner') return 'partners';

    return '...';
  }
  canDisplaySecondViz() {
    const {state, classifications} = this.props;
    const dataType = state.dataModel && state.dataType && classifications[state.dataModel].find(o => o.id === state.dataType);
    return (
      state.dataModel &&
      (
        (state.flowsPerYear && state.flowsPerYear.length < specs.metadataGroupMax) ||
        dataType && dataType.special
      )
    );
  }
  exportPerYear() {
    const {state} = this.props;
    const name = compact([
      state.dataModel,
      state.dataType,
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
      state.dataModel,
      state.dataType,
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
      state.dataModel,
      state.dataType,
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
      (state.dataModel === 'partner' || state.dataModel === 'product')
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

    if (state.dataModel === 'sourceType') unit = 'source types';
    if (state.dataModel === 'direction') unit = 'directions';
    if (state.dataModel === 'product') unit = 'products';
    if (state.dataModel === 'partner') unit = 'partners';

    let childClassifications;

    if (state.dataType)
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
              valueKey="value"
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
            (state.dataModel === 'product' || state.dataModel === 'partner') ?
              <div className="form-group">
                <label htmlFor="classifications" className="control-label sr-only">{capitalize(state.dataModel)}</label>
                <ItemSelector
                  valueKey="id"
                  type="dataType"
                  data={classifications[state.dataModel]}
                  loading={!classifications[state.dataModel].length}
                  onChange={actions.selectType}
                  selected={state.dataType}
                  onUpdate={actions.selectType}
                  defaultValue={defaultSelectors.metadata['selectors.' + state.dataModel]} />
              </div> :
              undefined
          }
        </div>

        { /* Left panel */ }
        <div className="aside-filters">
          <h3>Filters</h3>
          <form onSubmit={e => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="product" className="control-label">{
                (state.dataModel === 'product') ? 'Child product' : 'Product'
              }</label>
              <small className="help-block">The type of product being shipped.<a href="#/glossary/concepts"><Icon name="icon-info" /></a></small>
              <ClassificationSelector
                type="product"
                valueKey="id"
                loading={!classifications.product.length}
                data={((state.dataModel === 'product') ? childClassifications : classifications.product.filter(c => !c.source)) || []}
                onChange={actions.update.bind(null, 'productClassification')}
                selected={selectors.productClassification}
                onUpdate={v => actions.update('productClassification', v)}
                defaultValue={defaultSelectors.metadata['selectors.productClassification']} />
              <ItemSelector
                valueKey="value"
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
              <label htmlFor="partner" className="control-label">{
                (state.dataModel === 'partner') ? 'Child partner' : 'Partner'
              }</label>
              <small className="help-block">The partner whence we got the products or wither we are sending them.<a href="#/glossary/concepts"><Icon name="icon-info" /></a></small>
              <ClassificationSelector
                type="partner"
                valueKey="id"
                loading={!classifications.partner.length}
                data={((state.dataModel === 'partner') ? childClassifications : classifications.partner.filter(c => !c.source)) || []}
                onChange={actions.update.bind(null, 'partnerClassification')}
                selected={selectors.partnerClassification}
                onUpdate={v => actions.update('partnerClassification', v)}
                defaultValue={defaultSelectors.metadata['selectors.partnerClassification']} />
              <ItemSelector
                valueKey="value"
                type="partner"
                disabled={!selectors.partnerClassification || !groups.partner.length}
                loading={selectors.partnerClassification && !groups.partner.length}
                data={groups.partner}
                onChange={actions.update.bind(null, 'partner')}
                selected={selectors.partner}
                onUpdate={v => actions.update('partner', v)}
                defaultValue={defaultSelectors.metadata['selectors.partner']} />
            </div>
            <div className="form-group">
              <label htmlFor="direction" className="control-label">Sources</label>
              <small className="help-block">The type of source from which the data are extracted. <a href="#/data/sources"><Icon name="icon-info" /></a></small>
              <ItemSelector
                valueKey="value"
                type="sourceType"
                data={sourceTypesOptions}
                disabled={state.dataModel === 'sourceType'}
                loading={!sourceTypesOptions.length}
                onChange={actions.update.bind(null, 'sourceType')}
                selected={selectors.sourceType}
                onUpdate={v => actions.update('sourceType', v)}
                defaultValue={defaultSelectors.metadata['selectors.sourceType']} />
            </div>
            <div className="form-group">
              <label htmlFor="direction" className="control-label">Direction</label>
              <small className="help-block">The French harbor where the transactions were recorded. <a href="#/glossary/concepts"><Icon name="icon-info" /></a></small>
              <ItemSelector
                valueKey="id"
                type="direction"
                loading={!directions}
                disabled={state.dataModel === 'direction'}
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
                valueKey="id"
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
}

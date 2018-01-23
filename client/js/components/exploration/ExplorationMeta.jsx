/**
 * TOFLIT18 Client Meta Viz Display
 * =================================
 *
 * Displaying a collection of visualizations dealing with the sources
 * themselves and how they interact with each other.
 */
import cls from 'classnames';
import FileSaver from 'file-saver';
import {compact} from 'lodash';
import React, {Component} from 'react';
import {Waiter} from '../misc/Loaders.jsx';
import {ClassificationSelector, ItemSelector} from '../misc/Selectors.jsx';
import {branch} from 'baobab-react/decorators';
import d2i from 'dom-to-image';

import DataQualityBarChart from './viz/DataQualityBarChart.jsx';
import SourcesPerDirections from './viz/SourcesPerDirections.jsx';

import {exportCSV} from '../../lib/exports';
import VizLayout from '../misc/VizLayout.jsx';

import specs from '../../../specs.json';

import {
  selectType,
  selectModel,
  updateSelector as update,
  addChart
} from '../../actions/metadata';

/**
 * Helper used to get the child classifications of the given classification.
 */
function getChildClassifications(index, target) {
  const children = [];

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

class ExportButton extends Component {
  constructor(...args) {
    super(...args);
    this.state = {deployed: false};

    this.toggleList = this.toggleList.bind(this);
    this.handleClickBody = this.handleClickBody.bind(this);

    document.body.addEventListener('click', this.handleClickBody);
  }
  componentWillUnmount() {
    document.body.removeEventListener('click', this.handleClickBody);
  }

  handleClickBody(e) {
    if (!this.state.deployed) return;

    const dom = this.refs.root;
    let node = e.target;
    let isOut = true;
    let maxDepth = 4;

    while (node && maxDepth-- && isOut) {
      if (node === dom) isOut = false;

      node = node.parentNode;
    }

    if (isOut) this.setState({deployed: false});
  }
  toggleList() {
    if (this.props.exports.length === 1) {
      this.props.exports[0].fn();
    }
    else if (this.props.exports.length > 1) {
      this.setState({deployed: !this.state.deployed});
    }
  }

  render() {
    return (
      <div
        ref="root"
        className={cls(
          'dropup',
          this.state.deployed && 'open'
        )}>
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded="true"
          onClick={this.toggleList}
          disabled={!this.props.exports.length}
          className={cls(
            'btn',
            'btn-default',
            this.props.exports.length > 1 && 'dropdown-toggle'
          )}>
          <span>Exports</span>
          { this.props.exports.length > 1 && <span className="caret" /> }
        </button>
        {
          this.props.exports.length > 1 &&
          <ul className="dropdown-menu">{
            this.props.exports.map(({label, fn}) => (
              <li
                key={label}
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  fn();
                }}>
                <a href="#">{label}</a>
              </li>
            ))
          }</ul>
        }
      </div>
    );
  }
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
    return 'classified items';
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
      name: `Toflit18_Meta_view ${name} data_per_year.csv`,
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
      name: `Toflit18_Meta_view ${name} flows_per_year.csv`,
    });
  }
  exportCharts() {
    d2i
      .toSvg(this.vizContainer)
      .then(dataUrl => {
        // 1. Clear "data-url" prefix:
        const svg = dataUrl.replace(/^[^<]*</, '<');

        // 2. Clear first margin (which kinda breaks the export):
        const cleanSvg = svg.replace(/ margin\:[^;]*;/, '');

        // 3. Save the file
        const blob = new Blob(
          [cleanSvg],
          {type: 'text/plain;charset=utf-8'}
        );
        FileSaver.saveAs(blob, 'charts.svg');
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
      && (state.dataModel.value === 'country' || state.dataModel.value === 'country')
      && !state.dataType
    ) {
      canUpdate = false;
    }

    if (
      state.dataModel
      && state.dataModel.value === 'sourceType'
      && !selectors.sourceType
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
        description="Some information about the data itself."
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
              selected={state.dataModel} />
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
                  selected={state.dataType} />
              </div> :
            (state.dataModel && state.dataModel.value === 'country') ?
              <div className="form-group">
                <label htmlFor="classifications" className="control-label sr-only">Country</label>
                <ItemSelector
                  type="dataType"
                  data={classifications.country}
                  loading={!classifications.country.length}
                  onChange={actions.selectType}
                  selected={state.dataType} />
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
              <small className="help-block">The type of product being shipped.</small>
              <ClassificationSelector
                type="product"
                loading={!classifications.product.length}
                data={childClassifications || classifications.product.filter(c => !c.source)}
                onChange={actions.update.bind(null, 'productClassification')}
                selected={selectors.productClassification} />
              <ItemSelector
                type="product"
                disabled={!selectors.productClassification || !groups.product.length}
                loading={selectors.productClassification && !groups.product.length}
                data={groups.product}
                onChange={actions.update.bind(null, 'product')}
                selected={selectors.product} />
            </div>
            <div className="form-group">
              <label htmlFor="country" className="control-label">{
                (state.dataType && state.dataType.model === 'country') ? 'Child country' : 'Country'
              }</label>
              <small className="help-block">The country whence we got the products or wither we are sending them.</small>
              <ClassificationSelector
                type="country"
                loading={!classifications.country.length}
                data={childClassifications || classifications.country.filter(c => !c.source)}
                onChange={actions.update.bind(null, 'countryClassification')}
                selected={selectors.countryClassification} />
              <ItemSelector
                type="country"
                disabled={!selectors.countryClassification || !groups.country.length}
                loading={selectors.countryClassification && !groups.country.length}
                data={groups.country}
                onChange={actions.update.bind(null, 'country')}
                selected={selectors.country} />
            </div>
            <div className="form-group">
              <label htmlFor="direction" className="control-label">Sources</label>
              <small className="help-block">TODO - Lorem ipsum dolores sit amet.</small>
              <ItemSelector
                type="sourceType"
                data={sourceTypesOptions}
                loading={!sourceTypesOptions.length}
                onChange={actions.update.bind(null, 'sourceType')}
                selected={selectors.sourceType} />
            </div>
            <div className="form-group">
              <label htmlFor="direction" className="control-label">Direction</label>
              <small className="help-block">The French harbor where the transactions were recorded.</small>
              <ItemSelector
                type="direction"
                loading={!directions}
                data={directions || []}
                onChange={actions.update.bind(null, 'direction')}
                selected={selectors.direction} />
            </div>
            <div className="form-group">
              <label htmlFor="kind" className="control-label">Kind</label>
              <small className="help-block">Should we look at import, export, or total?</small>
              <ItemSelector
                type="kind"
                onChange={actions.update.bind(null, 'kind')}
                selected={selectors.kind} />
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
        <div className="aside-legend">
          <ul className="list-unstyled list-legend">
            <li><span style={{backgroundColor: '#8d4d42'}} />Number direction</li>
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

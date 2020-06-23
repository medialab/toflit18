/**
 * TOFLIT18 Client Indicators Display
 * ===================================
 *
 * Displaying a collection of indicators through picked visualizations.
 */
import React, {Component} from 'react';
import {branch} from 'baobab-react/decorators';
import {Waiter} from '../misc/Loaders.jsx';
import {ExportButton} from '../misc/Button.jsx';
import {ClassificationSelector, ItemSelector} from '../misc/Selectors.jsx';
import LineChart from './viz/LineChart.jsx';
import DataQualityBarChart from './viz/DataQualityBarChart.jsx';
import {capitalize, isEqual, mapValues, pick} from 'lodash';
import Icon from '../misc/Icon.jsx';
import VizLayout from '../misc/VizLayout.jsx';
import {exportCSV, exportSVG} from '../../lib/exports';
import {
  updateSelector as update,
  addLine,
  dropLine
} from '../../actions/indicators';

const defaultSelectors = require('../../../config/defaultVizSelectors.json');
import {checkDefaultValues} from './utils';

// TODO: move branching to sub component for optimized rendering logic
// TODO: better use pure rendering logic

/**
 * Lines summary.
 */
function buildDescription(params, data, index, groups) {
  const selectors = mapValues(params, (v, k) => {
    if (v && (k === 'product' || k === 'country')) {
      return v.map(id => (groups[k].find(o => id === o.id) || {}).name || id).join(', ');
    }

    if (v && (k === 'productClassification' || k === 'countryClassification')) {
      return (index[v] || {}).name || v;
    }


    if (v) {
      return v;
    }
  });

  let content = [
    <strong key="flows">{capitalize(selectors.kind || 'total') + ' flows'}</strong>,
  ];

  if (selectors.product) {
    if (data.length)
      content.push('of ');
    else
      content = ['No data for '];

    content = content.concat([
      <strong key="product">{selectors.product}</strong>,
      ' (',
      <em key="product-classes">{selectors.productClassification}</em>,
      ')',
    ]);
  }

  if (selectors.direction && selectors.direction !== '$all')
    content = content.concat([
      ' from ',
      <strong key="direction">{selectors.direction}</strong>
    ]);

  if (selectors.country)
    content = content.concat([
      ' to ',
      <strong key="country">{selectors.country}</strong>,
      ' (',
      <em key="country-classes">{selectors.countryClassification}</em>,
      ')',
    ]);

  if (selectors.sourceType)
    content = content.concat([
      `- (source type: ${selectors.sourceType})`,
    ]);

  return (
    <span>{
      content
    }</span>
  );
}

/**
 * Main component.
 */
@branch({
  actions: {
    addLine,
    dropLine,
    update
  },
  cursors: {
    alert: ['ui', 'alert'],
    classifications: ['data', 'classifications', 'flat'],
    classificationsIndex: ['data', 'classifications', 'index'],
    directions: ['data', 'directions'],
    sourceTypes: ['data', 'sourceTypes'],
    state: ['indicatorsState']
  }
})
export default class ExplorationIndicators extends Component {
  componentDidMount() {
    this.checkDefault();
  }
  componentDidUpdate() {
    this.checkDefault();
  }

  checkDefault() {
    if (!this.props.state.lines || this.props.state.lines.length === 0) {
      if (checkDefaultValues(defaultSelectors.indicators, this.props.state)) {
        this.props.actions.addLine();
      }
    }
  }

  exportCSV() {
    // create an array with all lines, add a column with name of country selected
    // create csv only with indicators selected
    let arrayDataLines = [];
    (this.props.state.lines || []).forEach(l => {
      // add info about classification, product, country, direction, kind
      // add all column even if the info is not selected for the line
      // copy element to add info keys
      const dataLines = [];

      for (let i = 0, len = l.data.length; i < len; i++) {
        const elemCopy = pick(
          l.data[i],
          ['year', 'count', 'value', 'kg', 'litre', 'nbr']
        );

        [
          'sourceType',
          'productClassification',
          'countryClassification',
          'country',
          'product',
          'kind',
          'direction',
        ].forEach(param => {
          elemCopy[param] = l.params[param] ?
            l.params[param].name :
            null;
        });

        if (l.data[i].value !== null && l.data[i].count !== 0) {
          elemCopy.nb_direction = l.data[i].nb_direction.length ?
            l.data[i].nb_direction :
            null;
        }

        dataLines.push(elemCopy);
      }

      // add all lines values in an array to export data in one csv
      arrayDataLines = arrayDataLines.concat(dataLines);
    });
    const now = new Date();
    exportCSV({
      data: arrayDataLines,
      name: `TOFLIT18_Time_series_${now.toLocaleString('se-SE').replace(' ', '_')}.csv`,
    });
  }

  exportCharts() {
    const now = new Date();
    exportSVG({
      nodes: [this.legendContainer, this.charts.vizContainer],
      name: `TOFLIT18_Time_series_${now.toLocaleString('se-SE').replace(' ', '_')}.svg`
    });
  }

  render() {
    const {
      alert,
      actions,
      classifications,
      classificationsIndex,
      directions,
      sourceTypes,
      state: {
        creating,
        groups,
        lines,
        selectors
      }
    } = this.props;

    const lineAlreadyExisting = (lines || []).some(
      line => isEqual(line.params, selectors)
    );

    const sourceTypesOptions = (sourceTypes || []).map(type => {
      return {
        name: type,
        value: type
      };
    });

    return (
      <VizLayout
        title="Time series"
        description="By selecting the following criteria, you'll be able to add the line you need on the graph that will be created for you below."
        leftPanelName="Filters"
        rightPanelName="Curves">
        { /* Left panel */ }
        <div className="aside-filters">
          <h3>Filters</h3>
          <form onSubmit={e => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="sourceType" className="control-label">Source Type</label>
              <small className="help-block">Type of sources the data comes from. <a href="#/exploration/sources"><Icon name="icon-info" /></a></small>
              <ItemSelector
                valueKey="value"
                type="sourceType"
                data={sourceTypesOptions}
                loading={!sourceTypesOptions.length}
                onChange={actions.update.bind(null, 'sourceType')}
                selected={selectors.sourceType}
                onUpdate={v => actions.update('sourceType', v)}
                defaultValue={defaultSelectors.indicators['selectors.sourceType']} />
            </div>
            <div className="form-group">
              <label htmlFor="product" className="control-label">Product</label>
              <small className="help-block">The type of product being shipped. <a href="#/glossary/concepts"><Icon name="icon-info" /></a></small>
              <ClassificationSelector
                type="product"
                valueKey="id"
                loading={!classifications.product.length}
                data={classifications.product.filter(c => !c.source)}
                onChange={actions.update.bind(null, 'productClassification')}
                selected={selectors.productClassification}
                onUpdate={v => actions.update('productClassification', v)}
                defaultValue={defaultSelectors.indicators['selectors.productClassification']} />
              <ItemSelector
                type="product"
                valueKey="value"
                disabled={!selectors.productClassification || !groups.product.length}
                loading={selectors.productClassification && !groups.product.length}
                data={groups.product}
                onChange={actions.update.bind(null, 'product')}
                selected={selectors.product}
                onUpdate={v => actions.update('product', v)}
                defaultValue={defaultSelectors.indicators['selectors.product']} />
            </div>
            <div className="form-group">
              <label htmlFor="country" className="control-label">Location</label>
              <small className="help-block">Whence products are exchanged. <a href="#/glossary/concepts"><Icon name="icon-info" /></a></small>
              <ClassificationSelector
                type="country"
                valueKey="id"
                loading={!classifications.country.length}
                data={classifications.country.filter(c => !c.source)}
                onChange={actions.update.bind(null, 'countryClassification')}
                selected={selectors.countryClassification}
                onUpdate={v => actions.update('countryClassification', v)}
                defaultValue={defaultSelectors.indicators['selectors.countryClassification']} />
              <ItemSelector
                type="country"
                valueKey="value"
                disabled={!selectors.countryClassification || !groups.country.length}
                loading={selectors.countryClassification && !groups.country.length}
                data={groups.country}
                onChange={actions.update.bind(null, 'country')}
                selected={selectors.country}
                onUpdate={v => actions.update('country', v)}
                defaultValue={defaultSelectors.indicators['selectors.country']} />
            </div>
            <div className="form-group">
              <label htmlFor="direction" className="control-label">Direction</label>
              <small className="help-block">Where, in France, the transactions were recorded. <a href="#/glossary/concepts"><Icon name="icon-info" /></a></small>
              <ItemSelector
                type="direction"
                valueKey="id"
                loading={!directions}
                data={directions || []}
                onChange={actions.update.bind(null, 'direction')}
                selected={selectors.direction}
                onUpdate={v => actions.update('direction', v)}
                defaultValue={defaultSelectors.indicators['selectors.direction']} />
            </div>
            <div className="form-group">
              <label htmlFor="kind" className="control-label">Kind</label>
              <small className="help-block">Should we look at import, export, or total?</small>
              <ItemSelector
                type="kind"
                valueKey="id"
                onChange={actions.update.bind(null, 'kind')}
                selected={selectors.kind}
                onUpdate={v => actions.update('kind', v)}
                defaultValue={defaultSelectors.indicators['selectors.kind']} />
            </div>
            <div className="form-group-fixed">
              <button
                type="submit"
                className="btn btn-default"
                disabled={lineAlreadyExisting}
                onClick={() => actions.addLine()}
                data-loading={creating}>
                Add line
              </button>
            </div>
          </form>
        </div>

        { /* Content panel */ }
        <Charts
          alert={alert}
          loading={creating}
          lines={(lines || []).filter(line => !!line.data)}
          ref={el => {
            this.charts = el;
          }} />

        { /* Right panel */ }
        <div
          className="aside-legend"
          ref={el => {
            this.legendContainer = el;
          }}>
          <ul className="list-unstyled list-labels">
            {(lines || []).map(function (line, i) {
              const style = {
                color: 'white',
                backgroundColor: line.color
              };

              if (!line.data)
                return <li key={i}><Waiter align="left" /></li>;

              return (
                <li
                  key={i}
                  style={style}>
                  {buildDescription(line.params, line.data, classificationsIndex || {}, groups || {})}
                  <button
                    type="button"
                    className="btn btn-link btn-xs btn-icon"
                    onClick={actions.dropLine.bind(null, i)}>
                    <Icon name="icon-close" />
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="form-group-fixed form-group-fixed-right">
            <ExportButton
              exports={
                (lines && lines.length) ?
                  [
                    {
                      label: 'Export CSV',
                      fn: () => {
                        this.exportCSV();
                      }
                    },
                    {
                      label: 'Export SVG',
                      fn: () => {
                        this.exportCharts();
                      }
                    }
                  ] :
                  []
              } />
          </div>
        </div>

      </VizLayout>
    );
  }
}

/**
 * Charts.
 */
class Charts extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      quantitiesOpened: false
    };

    this.toggleQuantities = this.toggleQuantities.bind(this);
  }

  toggleQuantities() {
    this.setState({quantitiesOpened: !this.state.quantitiesOpened});
  }

  render() {
    const {lines, alert, loading} = this.props;

    if (!lines) return <div />;

    const quantitiesOpened = this.state.quantitiesOpened;

    // Computing bar chart's data by keeping a count of distinct directions
    let barData = [];

    if (lines.some(line => !!line.data.length)) {
      /* eslint-disable no-confusing-arrow */
      const minYear = Math.min.apply(null, lines.map(line => line.data[0] ? line.data[0].year : 9999));
      const maxYear = Math.max.apply(null, lines.map(line => line.data[line.data.length - 1] ? line.data[line.data.length - 1].year : 0));
      /* eslint-enable no-confusing-arrow */

      barData = new Array(maxYear - minYear + 1);

      const hash = year => year - minYear;

      for (let i = 0, l = barData.length; i < l; i++)
        barData[i] = {year: minYear + i};

      lines.forEach(line => {
        for (let j = 0, m = line.data.length; j < m; j++) {
          const h = hash(line.data[j].year);
          barData[h].data = barData[h].data || new Set();

          for (let k = 0, n = line.data[j].nb_direction.length; k < n; k++)
            barData[h].data.add(line.data[j].nb_direction[k]);
        }
      });

      barData.forEach(item => {
        item.data = item.data ? item.data.size : 0;
      });
    }

    return (
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

        {
          !!lines.length && (
            <div
              className="viz-data"
              ref={el => {
                this.vizContainer = el;
              }}>
              <div className="box-viz">
                <span className="title">Total number of directions per year</span>
                <DataQualityBarChart
                  data={barData}
                  syncId="indicators"
                  yAxis />
              </div>
              <div className="box-viz">
                <span className="title">Number of flows per year</span>
                <LineChart valueKey="count" data={lines} />
              </div>
              <div className="box-viz">
                <span className="title">Total value of flows per year</span>
                <LineChart shareKey="value_share" data={lines} />
              </div>
              {quantitiesOpened && <div className="box-viz">
                <span className="title">Quantities of flows per year (kilograms)</span>
                <LineChart shareKey="kg_share" valueKey="kg" data={lines} />
              </div>}
              {quantitiesOpened && <div className="box-viz">
                <span className="title">Quantities of flows per year (litres)</span>
                <LineChart shareKey="litre_share" valueKey="litre" data={lines} />
              </div>}
              {quantitiesOpened && <div className="box-viz">
                <span className="title">Quantities of flows per year (pieces)</span>
                <LineChart shareKey="nbr_share" valueKey="nbr" data={lines} />
              </div>}
            </div>
          )
        }

        {
          !!lines.length && (
            <div className="viz-data-expand">
              <button
                type="submit"
                onClick={this.toggleQuantities}
                className="btn btn-default">{
                quantitiesOpened ?
                  'Collapse quantities' :
                  'Expand quantities'
              }</button>
            </div>
          )
        }
      </div>
    );
  }
}

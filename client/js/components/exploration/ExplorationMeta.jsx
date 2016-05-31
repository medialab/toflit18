/**
 * TOFLIT18 Client Meta Viz Display
 * =================================
 *
 * Displaying a collection of visualizations dealing with the sources
 * themselves and how they interact with each other.
 */
import React, {Component} from 'react';
import Button, {ExportButton} from '../misc/Button.jsx';
import {Waiter} from '../misc/Loaders.jsx';
import {ClassificationSelector, ItemSelector} from '../misc/Selectors.jsx';
import {branch} from 'baobab-react/decorators';
import DataQualityBarChart from './viz/DataQualityBarChart.jsx';
import SourcesPerDirections from './viz/SourcesPerDirections.jsx';

import {Row, Col} from '../misc/Grid.jsx';
import {prettyPrint} from '../../lib/helpers';

import config from '../../../config.json';

import {select,
    updateSelector as update, 
    addChart
  } from '../../actions/metadata';

const metadataSelectors = (config.metadataSelectors || []).map(option => {
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
    select,
    update,
    addChart
  },
  cursors: {
    metadata: ['states', 'exploration', 'metadata'],
    classifications: ['data', 'classifications', 'flat'],
    directions: ['data', 'directions'],
    sourceTypes: ['data', 'sourceTypes'],
    state: ['states', 'exploration', 'metadata']
  }
})
export default class ExplorationMeta extends Component {
  render() {
    const {
      actions,
      classifications,
      metadata,
      directions,
      sourceTypes,
      state: {
        creating,
        groups,
        lines,
        selectors
      }
    } = this.props;

    const classificationsFiltered = classifications.product
      .concat(classifications.country)
      .filter(c => c.groupsCount)
      .map(e => ({
        ...e,
        name: `${e.name} (${e.model === 'product' ? 'Products' : 'Countries'} - ${prettyPrint(e.groupsCount)} groups)`
      }));

    const canDisplaySecondViz = (
      metadata.dataType &&
      (
        metadata.dataType.groupsCount <= config.metadataGroupMax ||
        metadata.dataType.special
      )
    );

    const sourceTypesOptions = (sourceTypes || []).map(type => {
      return {
        name: type,
        value: type
      };
    });
    
    return (
      <div>
        <div className="panel">
          <h4>Metadata</h4>
          <p>
            <em>Some information about the data itself.</em>
          </p>
          <hr />
            <Row className="dataType">
             <SectionTitle title="Data type"
                           addendum="You must select the type of data to control." />
              <Col md={6}>
                <ItemSelector type="dataType"
                  data={[...metadataSelectors, ...classificationsFiltered]}
                  loading={!classifications.product.length}
                  onChange={actions.select}
                  selected={metadata.dataType}
                  />
              </Col>
            </Row>
            <hr />
            <Row>
            <SectionTitle title="Source Type"
                          addendum="From which sources does the data comes from?" />
              <Col md={4}>
                <ItemSelector type="sourceType"
                              data={sourceTypesOptions}
                              loading={!sourceTypesOptions.length}
                              onChange={actions.update.bind(null, 'sourceType')}
                              selected={selectors.sourceType} />
              </Col>
            </Row>
            <hr />
          <Row>
            <SectionTitle title="Product"
                          addendum="The type of product being shipped." />
            <Col md={4}>
              <ClassificationSelector type="product"
                                      loading={!classifications.product.length}
                                      data={classifications.product.filter(c => !c.source)}
                                      onChange={actions.update.bind(null, 'productClassification')}
                                      selected={selectors.productClassification} />
            </Col>
            <Col md={4}>
              <ItemSelector type="product"
                            disabled={!selectors.productClassification || !groups.product.length}
                            loading={selectors.productClassification && !groups.product.length}
                            data={groups.product}
                            onChange={actions.update.bind(null, 'product')}
                            selected={selectors.product} />
            </Col>
          </Row>
          <hr />
          <Row>
            <SectionTitle title="Country"
                          addendum="The country whence we got the products or wither we are sending them." />
            <Col md={4}>
              <ClassificationSelector type="country"
                                      loading={!classifications.country.length}
                                      data={classifications.country.filter(c => !c.source)}
                                      onChange={actions.update.bind(null, 'countryClassification')}
                                      selected={selectors.countryClassification} />
            </Col>
            <Col md={4}>
              <ItemSelector type="country"
                            disabled={!selectors.countryClassification || !groups.country.length}
                            loading={selectors.countryClassification && !groups.country.length}
                            data={groups.country}
                            onChange={actions.update.bind(null, 'country')}
                            selected={selectors.country} />
            </Col>
          </Row>
          <hr />
          <Row>
            <SectionTitle title="Direction"
                          addendum="The French harbor where the transactions were recorded." />
            <Col md={4}>
              <ItemSelector type="direction"
                            loading={!directions}
                            data={directions || []}
                            onChange={actions.update.bind(null, 'direction')}
                            selected={selectors.direction} />
            </Col>
          </Row>
          <hr />
          <Row>
            <SectionTitle title="Kind"
                          addendum="Should we look at import, export, or total?" />
            <Col md={4}>
              <ItemSelector type="kind"
                            onChange={actions.update.bind(null, 'kind')}
                            selected={selectors.kind} />
            </Col>
          </Row>
          <hr />
          <Row>
          <Col md={2}>
            <Button kind="primary"
                    onClick={actions.addChart}>
              add charts
            </Button>
          </Col>
        </Row>
        <hr />
        </div>
        {metadata.dataType && <div className="panel">
          {metadata.perYear ?
            <DataQualityBarChart data={metadata.perYear} /> :
            <Waiter />}
            <ExportButton name={`Toflit18_Meta_view ${metadata.dataType.name} - ${metadata.fileName} data_per_year`}
                          data={metadata.perYear}>
              Export
            </ExportButton>
        </div>}
        {canDisplaySecondViz && <div className="panel">
          {metadata.flowsPerYear ?
           <SourcesPerDirections data={metadata.flowsPerYear} /> :
           <Waiter />}
           <ExportButton name={`Toflit18_Meta_view ${metadata.dataType.name} - ${metadata.fileName} flows_per_year`}
                          data={formatArrayToCSV(metadata.flowsPerYear || [])}>
              Export
           </ExportButton>
        </div>}
      </div>
    );
  }
}

/**
 * Section title.
 */
class SectionTitle extends Component {
  render() {
    const {title, addendum} = this.props;

    return (
      <Col md={4}>
        <div>{title}</div>
        <div className="section-explanation">
          <em>{addendum}</em>
        </div>
      </Col>
    );
  }
}

/**
 * Lines summary.
 */
function buildDescription(params, data) {
  const selectors = mapValues(params, 'name');
  let description = [];

  description.push(<span key="kind">{capitalize(selectors.kind || 'total') + ' flows'}</span>);

  if (selectors.product && data.length)
    description.push(<span key="product"> of <strong>{selectors.product}</strong> (<em>{selectors.productClassification}</em>)</span>);

  if (selectors.direction && selectors.direction !== '$all')
    description.push(<span key="direction"> from <strong>{selectors.direction}</strong></span>);

  if (selectors.country)
    description.push(<span key="country"> to <strong>{selectors.country}</strong> (<em>{selectors.countryClassification}</em>)</span>);

  if (selectors.sourceType)
    description.push(<span key="type"> - (source type: {selectors.sourceType})</span>);

  if (selectors.product && data.length === 0) {
    description = [];
    description.push(<span key="kind">{'No data '}</span>);
    description.push(<span key="product"> for <strong>{selectors.product}</strong> (<em>{selectors.productClassification}</em>)</span>);
  }

  return description;
}

// class LinesSummary extends Component {
//   render() {
//     const {drop, lines} = this.props;

//     return (
//       <ul className="summary">
//         {lines.map(function(line, i) {
//           const style = {
//             color: 'white',
//             backgroundColor: line.color
//           };

//           if (!line.data)
//             return <li key={i}><Waiter align="left" /></li>;

//           return (
//             <li key={i}>
//               <span className="insert" style={style}>
//                 {buildDescription(line.params, line.data)}
//               </span>
//               <span className="insert drop"
//                     onClick={drop.bind(null, i)}
//                     style={style}>
//                 ✕
//               </span>
//             </li>
//           );
//         })}
//       </ul>
//     );
//   }
// }

/**
 * TOFLIT18 Client Meta Viz Display
 * =================================
 *
 * Displaying a collection of visualizations dealing with the sources
 * themselves and how they interact with each other.
 */
import React, {Component} from 'react';
import {ExportButton} from '../misc/Button.jsx';
import {Waiter} from '../misc/Loaders.jsx';
import {branch} from 'baobab-react/decorators';
import DataQualityBarChart from './viz/DataQualityBarChart.jsx';
import SourcesPerDirections from './viz/SourcesPerDirections.jsx';

import {Row, Col} from '../misc/Grid.jsx';
import {ItemSelector} from '../misc/Selectors.jsx';
import {select} from '../../actions/metadata';
import {prettyPrint} from '../../lib/helpers';

import config from '../../../config.json';

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
  actions: {select},
  cursors: {
    metadata: ['states', 'exploration', 'metadata'],
    classifications: ['data', 'classifications', 'flat']
  }
})
export default class ExplorationMeta extends Component {
  render() {
    const {
      actions,
      classifications,
      metadata
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

    return (
      <div>
        <div className="panel">
          <h4>Metadata</h4>
          <p>
            <em>Some information about the data itself.</em>
          </p>
          <hr />
           <Row>
           <SectionTitle title="Data type"
                         addendum="Select the type of data to control." />
            <Col md={6}>
              <ItemSelector
                data={[...metadataSelectors, ...classificationsFiltered]}
                onChange={actions.select}
                selected={metadata.dataType}
                loading={!classifications.product.length}
                type="dataType"/>
            </Col>
          </Row>
        </div>
        {metadata.dataType && <div className="panel">
          {metadata.perYear ?
            <DataQualityBarChart data={metadata.perYear} /> :
            <Waiter />}
            <ExportButton name={`Toflit18_Meta_view ${metadata.dataType.name} data_per_year`}
                          data={metadata.perYear}>
              Export
            </ExportButton>
        </div>}
        {canDisplaySecondViz && <div className="panel">
          {metadata.flowsPerYear ?
           <SourcesPerDirections data={metadata.flowsPerYear} /> :
           <Waiter />}
           <ExportButton name={`Toflit18_Meta_view ${metadata.dataType.name} flows_per_year`}
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

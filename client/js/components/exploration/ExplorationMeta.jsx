/**
 * TOFLIT18 Client Meta Viz Display
 * =================================
 *
 * Displaying a collection of visualizations dealing with the sources
 * themselves and how they interact with each other.
 */
import React, {Component} from 'react';
import {Waiter} from '../misc/Loaders.jsx';
import {branch} from 'baobab-react/decorators';
import DataQualityBarChart from './viz/DataQualityBarChart.jsx';
import SourcesPerDirections from './viz/SourcesPerDirections.jsx';

import {Row, Col} from '../misc/Grid.jsx';
import {ItemSelector} from '../misc/Selectors.jsx';
import {select} from '../../actions/metadata';

import config from '../../../config.json';

const metadataSelectors = config.metadataSelectors.map(option => {
  return {
    ...option,
    special: true
  };
});

@branch({
  actions: {select},
  cursors: {
    directionsPerYear: ['data', 'viz', 'directionsPerYear'],
    sourcesPerDirections: ['data', 'viz', 'sourcesPerDirections'],
    metadata: ['states', 'exploration', 'metadata'],
    classifications: ['data', 'classifications', 'flat']
  }
})

export default class ExplorationMeta extends Component {
  render() {
    const {
      actions,
      classifications,
      metadata,
      directionsPerYear,
      sourcesPerDirections
    } = this.props;

    const classificationsFiltered = classifications.product.map(e => ({
        ...e,
        name: `product : ${e.name}`
      }))
      .concat(classifications.country.map(e => ({
        ...e,
        name: `country : ${e.name}`
      })))
      .filter( d => d.groupsCount <= config.metadataGroupMax)

    console.log("classificationsFiltered", classificationsFiltered)

    return (
      <div>
        <div className="panel">
          <h3>Metadata</h3>
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
        <div className="panel">
          {directionsPerYear ?
            <DataQualityBarChart data={directionsPerYear} /> :
            <Waiter />}
        </div>
        <div className="panel">
          {sourcesPerDirections ?
           <SourcesPerDirections data={sourcesPerDirections} /> :
           <Waiter />}
        </div>
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

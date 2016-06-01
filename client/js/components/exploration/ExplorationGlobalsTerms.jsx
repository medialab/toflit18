/**
 * TOFLIT18 Client Global Viz Display
 * ===================================
 *
 * Displaying a collection of visualizations dealing with the dataset as a
 * whole.
 */
import React, {Component} from 'react';
import ReactSlider from 'react-slider';
import {branch} from 'baobab-react/decorators';
import Button, {ExportButton} from '../misc/Button.jsx';
import {ClassificationSelector, ItemSelector} from '../misc/Selectors.jsx';
import Network from './viz/Network.jsx';
import {Row, Col} from '../misc/Grid.jsx';
import {prettyPrint} from '../../lib/helpers';
import config from '../../../../config.json';
import {
  selectClassification,
  selectTerms,
  selectColorization,
  updateSelector as update,
  addChart,
  updateDate
} from '../../actions/globals';

export default class ExplorationGlobalsTerms extends Component {
  render() {
    return (
      <div>
        <TermsPanel />
        <ReactSlider defaultValue={[0, 100]} withBars />
      </div>
    );
  }
}

@branch({
  actions: {
    selectTerms,
    selectColorization,
    update, 
    addChart,
    updateDate
  },
  cursors: {
    classifications: ['data', 'classifications', 'flat'],
    directions: ['data', 'directions'],
    sourceTypes: ['data', 'sourceTypes'],
    state: ['states', 'exploration', 'terms']
  }
})
class TermsPanel extends Component {
  render() {
    const {
      actions,
      classifications,
      directions,
      sourceTypes,
      state: {
        graph,
        classification,
        colorization,
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

    const colorKey = colorization === 'community' ?
      'communityColor' :
      'positionColor';

    const radioListener = e => actions.selectColorization(e.target.value);

    const sourceTypesOptions = (sourceTypes || []).map(type => {
      return {
        name: type,
        value: type
      };
    });

    function buildDateMin(dateMin, dateMax) {
      const minArray = [];
      if (dateMin && dateMax) {
        for (let i = dateMin; i < dateMax; i++) {
          minArray.push({name: i, id: i});
        }
      }

      if (dateMin && dateMin.length > 0 && !dateMax) {
        for (let i = dateMin; i < config.api.limits.maxYear; i++) {
          minArray.push({name: i, id: i});
        }
      }

      if (!dateMin && dateMax) {
        for (let i = config.api.limits.minYear; i < dateMax; i++) {
          minArray.push({name: i, id: i});
        }
      }

      if (!dateMax && dateMin) {
        for (let i = dateMin; i < config.api.limits.maxYear; i++) {
          minArray.push({name: i, id: i});
        }
      }

      if (!dateMax && !dateMin) {
        for (let i = config.api.limits.minYear; i < config.api.limits.maxYear; i++) {
          minArray.push({name: i, id: i});
        }
      }

      return minArray;
    }

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

    return (
      <div className="panel">
        <h4>Terms Network</h4>
        <em>Choose a product classification and display a graph showing relations between terms of the aforementioned classification</em>
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
          <Row className="dataType">
            <SectionTitle title="Product"
                          addendum="You must choose the type of product being shipped." />
            <Col md={4}>
              <ClassificationSelector type="product"
                                      loading={!classifications.product.length || loading}
                                      data={classifications.product}
                                      onChange={actions.selectTerms}
                                      selected={classification} />
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
          <SectionTitle title="Dates"
                        addendum="Choose one date or a range date" />
          <Col md={2}>
            <ItemSelector type="dateMin"
                          data={dateMinOptions}
                          onChange={actions.update.bind(null, 'dateMin')}
                          selected={selectors.dateMin}/>
          </Col>
          <Col md={2}>
            <ItemSelector type="dateMax"
                          data={dateMaxOptions}
                          onChange={actions.update.bind(null, 'dateMax')}
                          selected={selectors.dateMax}/>
          </Col>
        </Row>
        <hr />
          <Row>
          <Col md={2}>
            <Button kind="primary"
                    onClick={actions.addChart}>
              launch network
            </Button>
          </Col>
          { !graph && 
            <Col md={4}>
            THERE IS NO DATA FOR YOUR REQUEST
          </Col>
          }

        </Row>
        <hr />
        <label>
          <input type="radio"
                 name="optionsRadio"
                 value="community"
                 checked={colorization === 'community'}
                 onChange={radioListener} />
           Commmunity Color
        </label>
        <label>
          <input type="radio"
                 name="optionsRadio"
                 value="position"
                 checked={colorization === 'position'}
                 onChange={radioListener} />
           Position Color
        </label>
        <Network graph={graph} colorKey={colorKey} />
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

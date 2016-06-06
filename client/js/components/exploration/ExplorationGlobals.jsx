 /**
 * TOFLIT18 Client Global Viz Display
 * ===================================
 *
 * Displaying a collection of visualizations dealing with the dataset as a
 * whole.
 */
import React, {Component} from 'react';
import {branch} from 'baobab-react/decorators';
import Button, {ExportButton} from '../misc/Button.jsx';
import {ClassificationSelector, ItemSelector} from '../misc/Selectors.jsx';
import Network from './viz/Network.jsx';
import {Row, Col} from '../misc/Grid.jsx';
import {buildDateMin} from '../../lib/helpers';
import {
  selectClassification,
  selectPonderation,
  updateSelector as update,
  addNetwork,
  updateDate
} from '../../actions/globalsNetwork';

import config from '../../../config.json';

const metadataSelectors = (config.metadataSelectors || []).map(option => {
  return {
    ...option,
    special: true
  };
});


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
    selectClassification,
    selectPonderation,
    update,
    addNetwork,
    updateDate
  },
  cursors: {
    classifications: ['data', 'classifications', 'flat'],
    directions: ['data', 'directions'],
    state: ['states', 'exploration', 'network']
  }
})
class NetworkPanel extends Component {
  render() {
    const {
      actions,
      classifications,
      state: {
        graphResultAPI,
        graph,
        classification,
        ponderation,
        loading,
        selectors,
      }
    } = this.props;

    let {
      state: {
        dateMin,
        dateMax
      }
    } = this.props;

    const ponderationKey = ponderation === 'nbFlows' ?
      'flowsPonderation' :
      'valuePonderation';

    const radioListener = e => actions.selectPonderation(e.target.value);

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
        <h4>Countries Network</h4>
        <em>Choose a country classification and display a graph showing relations between countries & directions.</em>
        <hr />
        <Row className="dataType">
          <SectionTitle title="Country"
                        addendum="The country whence we got the products or wither we are sending them." />
          <Col md={4}>
            <ClassificationSelector type="country"
                                loading={!classifications.country.length || loading}
                                data={classifications.country}
                                onChange={actions.selectClassification}
                                selected={classification} />
            </Col>
        </Row>
        <hr />
        <Row>
            <SectionTitle title="Product"
                          addendum="Choose one or two types of product being shipped to cross or not result." />
            <Col md={4}>
              <ClassificationSelector type="product"
                                      loading={!classifications.product.length}
                                      data={classifications.product.filter(c => !c.source)}
                                      onChange={actions.update.bind(null, 'productClassification')}
                                      selected={selectors.productClassification} />
            </Col>
        </Row>
        <hr />
        <Row>
         <SectionTitle title="Data type"
                       addendum="You must select the type of data to control." />
          <Col md={4}>
            <ItemSelector type="dataType"
              data={[...metadataSelectors]}
              loading={!classifications.product.length}
              onChange={actions.update.bind(null, 'dataType')}
              selected={selectors.dataType} />
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
                    onClick={actions.addNetwork}>
              Add network
            </Button>
          </Col>
          {!graph &&
            <Col md={4}>
            THERE IS NO DATA FOR YOUR REQUEST
          </Col>
          }

        </Row>
        <hr />
        <label>
          <input type="radio"
                 name="optionsRadio"
                 value="flows"
                 checked={ponderation === 'flows'}
                 onChange={radioListener} />
           Ponderation by number of flows
        </label>
        <label>
          <input type="radio"
                 name="optionsRadio"
                 value="value"
                 checked={ponderation === 'value'}
                 onChange={radioListener} />
           Ponderation by sum value of flows
        </label>
        <hr />
        <Network graph={graph} ponderationKey={ponderationKey}/>
        <br />
        <ExportButton name={'Toflit18_Global_Trade_Countries_Network_view'}
                        data={graphResultAPI}>
            Export
        </ExportButton>
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


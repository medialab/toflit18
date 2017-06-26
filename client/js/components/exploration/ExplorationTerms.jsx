/**
 * TOFLIT18 Client Terms Network Display
 * ======================================
 *
 * Displaying a network of product terms' decomposition.
 */
import React, {Component} from 'react';
import {format} from 'd3-format';
import {branch} from 'baobab-react/decorators';
import cls from 'classnames';
import Button, {ExportButton} from '../misc/Button.jsx';
import {ClassificationSelector, ItemSelector} from '../misc/Selectors.jsx';
import Network from './viz/Network.jsx';
import {Row, Col} from '../misc/Grid.jsx';
import {buildDateMin} from '../../lib/helpers';
import {
  selectTerms,
  selectNodeSize,
  updateSelector as update,
  addChart,
  updateDate
} from '../../actions/terms';

const NUMBER_FIXED_FORMAT = format(',.2f'),
      NUMBER_FORMAT = format(',');

function renderNodeDisplay(props) {
  const {
    label,
    flows,
    value,
    degree
  } = props;

  return (
    <div>
      <strong>{label}</strong>
      <br />
      Flows: {NUMBER_FORMAT(flows)}
      <br />
      Value: {NUMBER_FIXED_FORMAT(value)}
      <br />
      Degree: {NUMBER_FORMAT(degree)}
    </div>
  );
}

export default class ExplorationGlobalsTerms extends Component {
  render() {
    return (
      <div>
        <TermsPanel />
      </div>
    );
  }
}

@branch({
  actions: {
    selectTerms,
    selectNodeSize,
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
        data,
        classification,
        nodeSize,
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

    const sourceTypesOptions = (sourceTypes || []).map(type => {
      return {
        name: type,
        value: type
      };
    });

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

    const radioListener = e => actions.selectNodeSize(e.target.value);

    return (
      <div>
        <div className="panel">
          <h4>Terms Network</h4>
          <em>Choose a product classification and display a graph showing relations between terms of the aforementioned classification</em>
          <h6 className="section-separator">Whence do we extract our terms:</h6>
          <Row>
            <SectionTitle
              title="Product"
              addendum="You must choose the type of product being shipped." />
            <Col md={4}>
              <ClassificationSelector
                type="product"
                loading={!classifications.product.length}
                data={classifications.product}
                onChange={actions.selectTerms}
                selected={classification} />
            </Col>
          </Row>
          <h6 className="section-separator">Filters:</h6>
          <Row>
            <SectionTitle
              title="Source Type"
              addendum="From which sources does the data comes from?" />
            <Col md={4}>
              <ItemSelector
                type="sourceType"
                data={sourceTypesOptions}
                loading={!sourceTypesOptions.length}
                onChange={actions.update.bind(null, 'sourceType')}
                selected={selectors.sourceType} />
            </Col>
          </Row>
          <hr />
          <Row>
            <SectionTitle
              title="Country"
              addendum="The country whence we got the products or wither we are sending them." />
              <Col md={4}>
                <ClassificationSelector
                  type="country"
                  loading={!classifications.country.length}
                  data={classifications.country.filter(c => !c.source)}
                  onChange={actions.update.bind(null, 'countryClassification')}
                  selected={selectors.countryClassification} />
              </Col>
              <Col md={4}>
                <ItemSelector
                  type="country"
                  disabled={!selectors.countryClassification || !groups.country.length}
                  loading={selectors.countryClassification && !groups.country.length}
                  data={groups.country}
                  onChange={actions.update.bind(null, 'country')}
                  selected={selectors.country} />
              </Col>
            </Row>
            <hr />
            <Row>
              <SectionTitle
                title="Direction"
                addendum="The French harbor where the transactions were recorded." />
              <Col md={4}>
                <ItemSelector
                  type="direction"
                  loading={!directions}
                  data={directions || []}
                  onChange={actions.update.bind(null, 'direction')}
                  selected={selectors.direction} />
              </Col>
            </Row>
            <hr />
            <Row>
              <SectionTitle
                title="Kind"
                addendum="Should we look at import, export, or total?" />
              <Col md={4}>
                <ItemSelector
                  type="kind"
                  onChange={actions.update.bind(null, 'kind')}
                  selected={selectors.kind} />
              </Col>
            </Row>
            <hr />
            <Row>
              <SectionTitle
                title="Dates"
                addendum="Choose one date or a range date" />
              <Col md={2}>
                <ItemSelector
                  type="dateMin"
                  data={dateMinOptions}
                  onChange={actions.update.bind(null, 'dateMin')}
                  selected={selectors.dateMin} />
              </Col>
              <Col md={2}>
                <ItemSelector
                  type="dateMax"
                  data={dateMaxOptions}
                  onChange={actions.update.bind(null, 'dateMax')}
                  selected={selectors.dateMax} />
              </Col>
            </Row>
            <hr />
            <Row>
              <Col md={2}>
                <Button
                  disabled={!classification}
                  kind="primary"
                  loading={loading}
                  onClick={actions.addChart}>
                  Add network
                </Button>
              </Col>
            </Row>
        </div>
        <div className={cls('panel', !graph && 'hidden')}>
          <span style={{marginRight: '10px'}}>Size of the nodes:</span>
          <input
            type="radio"
            name="optionsRadio"
            value="flows"
            checked={nodeSize === 'flows'}
            onChange={radioListener} />
          <span style={{marginLeft: '10px', marginRight: '10px'}}>Nb of flows.</span>
          <input
            type="radio"
            name="optionsRadio"
            value="value"
            checked={nodeSize === 'value'}
            onChange={radioListener} />
          <span style={{marginLeft: '10px', marginRight: '10px'}}>Value of flows.</span>
          <input
            type="radio"
            name="optionsRadio"
            value="degree"
            checked={nodeSize === 'degree'}
            onChange={radioListener} />
          <span style={{marginLeft: '10px', marginRight: '10px'}}>Degree.</span>
          <Network
            ref={ref => this.networkComponent = ref}
            graph={graph}
            directed
            colorKey={'communityColor'}
            sizeKey={nodeSize}
            nodeDisplayRenderer={renderNodeDisplay} />
          <br />
          <div className="btn-group">
            <ExportButton
              name="Toflit18_Global_Terms_Network_view.csv"
              data={data}
              type="csv">
                Export CSV
            </ExportButton>
            <ExportButton
              name="Toflit18_Global_Terms_Network_view.gexf"
              data={graph}
              type="gexf"
              network="terms">
                Export GEXF
            </ExportButton>
            <Button
              onClick={() => this.networkComponent.downloadGraphAsSVG()}
              kind="secondary">
              Export SVG
            </Button>
          </div>
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
    const {title, addendum, emphasized} = this.props;

    return (
      <Col md={4} className={cls(emphasized && 'bold')}>
        <div className="section-title">{title}</div>
        <div className="section-explanation">
          <em>{addendum}</em>
        </div>
      </Col>
    );
  }
}

 /**
 * TOFLIT18 Client Network Viz Display
 * ====================================
 *
 * Displaying a network of places linked by their trade.
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
  selectClassification,
  selectNodeSize,
  selectEdgeSize,
  updateSelector as update,
  addNetwork,
  updateDate
} from '../../actions/network';

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
    selectNodeSize,
    selectEdgeSize,
    update,
    addNetwork,
    updateDate
  },
  cursors: {
    classifications: ['data', 'classifications', 'flat'],
    directions: ['data', 'directions'],
    sourceTypes: ['data', 'sourceTypes'],
    state: ['states', 'exploration', 'network']
  }
})
class NetworkPanel extends Component {
  render() {
    const {
      actions,
      classifications,
      sourceTypes,
      state: {
        data,
        graph,
        classification,
        nodeSize,
        edgeSize,
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

    const nodeRadioListener = e => actions.selectNodeSize(e.target.value),
          edgeRadioListener = e => actions.selectEdgeSize(e.target.value);

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

    const sourceTypesOptions = (sourceTypes || []).map(type => {
      return {
        name: type,
        value: type
      };
    });

    return (
      <div>
        <div className="panel">
          <h4>Countries Network</h4>
          <em>Choose a country classification and display a graph showing relations between countries & directions.</em>
          <h6 className="section-separator">What we represent as country nodes:</h6>
          <Row>
            <SectionTitle
              title="Country"
              addendum="The country whence we got the products or wither we are sending them." />
            <Col md={4}>
              <ClassificationSelector
                type="country"
                loading={!classifications.country.length}
                data={classifications.country}
                onChange={actions.selectClassification}
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
                title="Product"
                addendum="Choose one or two types of product being shipped to cross or not result." />
              <Col md={4}>
                <ClassificationSelector
                  type="product"
                  loading={!classifications.product.length}
                  data={classifications.product.filter(c => !c.source)}
                  onChange={actions.update.bind(null, 'productClassification')}
                  selected={selectors.productClassification} />
              </Col>
               <Col md={4}>
                <ItemSelector
                  type="product"
                  disabled={!selectors.productClassification || !groups.product.length}
                  loading={selectors.productClassification && !groups.product.length}
                  data={groups.product}
                  onChange={actions.update.bind(null, 'product')}
                  selected={selectors.product} />
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
                kind="primary"
                disabled={!classification}
                onClick={actions.addNetwork}
                loading={loading}>
                Add network
              </Button>
            </Col>
          </Row>
        </div>
        <div className={cls('panel', !graph && 'hidden')}>
          <span style={{marginRight: '10px'}}>Node size:</span>
          <input
            type="radio"
            name="nodesOptionsRadio"
            value="flows"
            checked={nodeSize === 'flows'}
            onChange={nodeRadioListener} />
          <span style={{marginLeft: '10px', marginRight: '10px'}}>Nb. of flows.</span>
          <input
            type="radio"
            name="nodesOptionsRadio"
            value="value"
            checked={nodeSize === 'value'}
            onChange={nodeRadioListener} />
          <span style={{marginLeft: '10px', marginRight: '10px'}}>Value of flows.</span>
          <input
            type="radio"
            name="nodesOptionsRadio"
            value="degree"
            checked={nodeSize === 'degree'}
            onChange={nodeRadioListener} />
          <span style={{marginLeft: '10px', marginRight: '10px'}}>Degree.</span>
          <hr />
          <span style={{marginRight: '10px'}}>Edge thickness:</span>
          <input
            type="radio"
            name="edgesOptionsRadio"
            value="flows"
            checked={edgeSize === 'flows'}
            onChange={edgeRadioListener} />
          <span style={{marginLeft: '10px', marginRight: '10px'}}>Nb. of flows.</span>
          <input
            type="radio"
            name="edgesOptionsRadio"
            value="value"
            checked={edgeSize === 'value'}
            onChange={edgeRadioListener} />
          <span style={{marginLeft: '10px', marginRight: '10px'}}>Value of flows.</span>
          <hr />
          <Legend />
          <br />
          <Network
            ref={ref => this.networkComponent = ref}
            directed={graph && graph.directed}
            graph={graph}
            sizeKey={nodeSize}
            edgeSizeKey={edgeSize}
            nodeDisplayRenderer={renderNodeDisplay} />
          <br />
          <div className="btn-group">
            <ExportButton
              name="Toflit18_Global_Trade_Countries_Network_view.csv"
              data={data}>
                Export CSV
            </ExportButton>
            <ExportButton
              name="Toflit18_Global_Trade_Countries_Network_view.gexf"
              data={graph}
              type="gexf"
              network="country">
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
    const {title, addendum, emphasized = false} = this.props;

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

/*
 * Legend
 */
class Legend extends Component {
  render() {

    return (
     <svg width="100%" height="30px" >
        <g>
          <circle
            cx={10}
            cy={10}
            r={5}
            fill="#8d4d42" />
          <text
            x={30}
            y={15}
            textAnchor="left"
            className="legend-label">
            {'Direction'}
          </text>
          <circle
            cx={120}
            cy={10}
            r={5}
            fill="black" />
          <text
            x={140}
            y={15}
            textAnchor="left"
            className="legend-label">
            {'Country'}
          </text>
        </g>
      </svg>
      );
  }
}


/**
 * TOFLIT18 Client Terms Network Display
 * ======================================
 *
 * Displaying a network of product terms' decomposition.
 */
import React, { Component } from "react";
import { format } from "d3-format";
import { range } from "lodash";
import Select from "react-select";
import { branch } from "baobab-react/decorators";
import Button, { ExportButton } from "../misc/Button.jsx";
import { ClassificationSelector, ItemSelector } from "../misc/Selectors.jsx";
import DataTable from "./viz/DataTable.jsx";
import VizLayout from "../misc/VizLayout.jsx";
import { exportCSV, exportSVG } from "../../lib/exports";
import {
  updateSelector as update,
  initFlowTable,
  checkDefaultState,
  checkGroups,
  changePage
} from "../../actions/flows";
import Icon from "../misc/Icon.jsx";
const defaultSelectors = require("../../../config/defaultVizSelectors.json");

import specs from "../../../specs.json";


/**
 * Main component.
 */
export default class ExplorationFlows extends Component {
  render() {
    return (
      <div>
        <Flows />
      </div>
    );
  }
}

@branch({
  actions: {
    update,
    addChart: initFlowTable,
    checkDefaultState,
    checkGroups,
    changePage
  },
  cursors: {
    alert: ["ui", "alert"],
    classifications: ["data", "classifications", "flat"],
    classificationIndex: ["data", "classifications", "index"],
    directions: ["data", "directions"],
    sourceTypes: ["data", "sourceTypes"],
    state: ["explorationFlowsState"],
  },
})
class Flows extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = { selected: null, fullscreen: false };
  }

  componentDidMount() {
    // Check for initial values:
    const state = this.props.state;
    const initialState = defaultSelectors.flows.initialValues;
    const hasInitialState = Object.keys(initialState).some(key =>
      key.split(".").reduce((iter, step) => iter && iter[step], state),
    );

    if (!hasInitialState) {
      this.props.actions.checkDefaultState(defaultSelectors.flows.initialValues);
    }
    
    this.props.actions.checkGroups(this.props.actions.addChart);
  }

  componentDidUpdate() {
    // Check for defaults:
    this.props.actions.checkDefaultState(defaultSelectors.flows.defaultValues);
  }

  exportNodesCsv() {
    const now = new Date();
    exportCSV({
      data: this.props.state.graph.nodes,
      name: `TOFLIT18_Product_terms_nodes_${now.toLocaleString("se-SE").replace(" ", "_")}.csv`,
    });
  }
  exportEdgesCsv() {
    const now = new Date();
    exportCSV({
      data: this.props.state.graph.edges,
      name: `TOFLIT18_Product_terms_edges_${now.toLocaleString("se-SE").replace(" ", "_")}.csv`,
    });
  }

  exportGraph() {
    const now = new Date();
    const graphSvg = sigma.instances(0).toSVG({
      labels: true,
    });
    exportSVG({
      nodes: [this.legend, graphSvg],
      name: `TOFLIT18_Product_terms_${now.toLocaleString("se-SE").replace(" ", "_")}.svg`,
    });
  }

  setSelectedNode(selectedNode) {
    this.setState({ selectedNode });
  }

  toggleFullscreen() {
    this.setState({ fullscreen: !this.state.fullscreen });
  }

  render() {
    const {
      alert,
      actions,
      classifications,
      directions,
      sourceTypes,
      state: { flows,nbFlows,loading, selectors, groups,page },
    } = this.props;

    const {  fullscreen } = this.state;

    const sourceTypesOptions = (sourceTypes || []).map(type => {
      return {
        name: type,
        value: type,
      };
    });

    const dateMin = selectors.dateMin;
    const dateMaxOptions = range(dateMin || specs.limits.minYear, specs.limits.maxYear).map(d => ({
      name: "" + d,
      id: "" + d,
    }));

    const dateMax = selectors.dateMax;
    const dateMinOptions = range(specs.limits.minYear, dateMax ? +dateMax + 1 : specs.limits.maxYear).map(d => ({
      name: "" + d,
      id: "" + d,
    }));
    return (
      <VizLayout
        title="Trade flows"
        description="Explore trade flows"
        leftPanelName="Filters"
        fullscreen={fullscreen}
        rightPanelName="Caption"
      >        
        {/* Left panel */}
        <div className="aside-filters">
          <h3>Filters</h3>
          <form onSubmit={e => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="sourceType" className="control-label">
                Source Type
              </label>
              <small className="help-block">
                Type of sources the data comes from.{" "}
                <a href="#/exploration/sources">
                  <Icon name="icon-info" />
                </a>
              </small>
              <ItemSelector
                valueKey="value"
                type="sourceType"
                data={sourceTypesOptions}
                loading={!sourceTypesOptions.length}
                onChange={actions.update.bind(null, "sourceType")}
                selected={selectors.sourceType}
                onUpdate={v => actions.update("sourceType", v)}
                defaultValue={defaultSelectors.flows["selectors.sourceType"]}
              />
            </div>
            <div className="form-group">
              <label htmlFor="product" className="control-label">
                Product
              </label>
              <small className="help-block">
                The type of product being shipped.{" "}
                <a href="#/glossary/concepts">
                  <Icon name="icon-info" />
                </a>
              </small>
              <ClassificationSelector
                valueKey="id"
                type="product"
                placeholder="Product classification..."
                loading={!classifications.product.length}
                data={classifications.product.filter(c => !c.source)}
                onChange={actions.update.bind(null, "productClassification")}
                selected={selectors.productClassification}
                onUpdate={v => actions.update("productClassification", v)}
                defaultValue={defaultSelectors.flows["selectors.productClassification"]}
              />
              <ItemSelector
                valueKey="id"
                type="product"
                disabled={!selectors.productClassification || !groups.product.length}
                loading={selectors.productClassification && !groups.product.length}
                data={groups.product}
                onChange={actions.update.bind(null, "product")}
                selected={selectors.product}
                onUpdate={v => actions.update("product", v)}
                defaultValue={defaultSelectors.flows["selectors.product"]}
              />
            </div>
            <div className="form-group">
              <label htmlFor="partner" className="control-label">
                Partner
              </label>
              <small className="help-block">
                Whence products are exchanged.{" "}
                <a href="#/glossary/concepts">
                  <Icon name="icon-info" />
                </a>
              </small>
              <ClassificationSelector
                valueKey="id"
                type="partner"
                loading={!classifications.partner.length}
                data={classifications.partner.filter(c => !c.source)}
                onChange={actions.update.bind(null, "partnerClassification")}
                selected={selectors.partnerClassification}
                onUpdate={v => actions.update("partnerClassification", v)}
                defaultValue={defaultSelectors.flows["selectors.partnerClassification"]}
              />
              <ItemSelector
                valueKey="id"
                type="partner"
                disabled={!selectors.partnerClassification || !groups.partner.length}
                loading={selectors.partnerClassification && !groups.partner.length}
                data={groups.partner}
                onChange={actions.update.bind(null, "partner")}
                selected={selectors.partner}
                onUpdate={v => actions.update("partner", v)}
                defaultValue={defaultSelectors.flows["selectors.partner"]}
              />
            </div>
            <div className="form-group">
              <label htmlFor="direction" className="control-label">
                Direction
              </label>
              <small className="help-block">
                Where, in France, the transactions were recorded.{" "}
                <a href="#/glossary/concepts">
                  <Icon name="icon-info" />
                </a>
              </small>
              <ItemSelector
                valueKey="id"
                type="direction"
                loading={!directions}
                data={directions || []}
                onChange={actions.update.bind(null, "direction")}
                selected={selectors.direction}
                onUpdate={v => actions.update("direction", v)}
                defaultValue={defaultSelectors.flows["selectors.direction"]}
              />
            </div>
            <div className="form-group">
              <label htmlFor="kind" className="control-label">
                Kind
              </label>
              <small className="help-block">Should we look at import, export, or total?</small>
              <ItemSelector
                valueKey="id"
                type="kind"
                onChange={actions.update.bind(null, "kind")}
                selected={selectors.kind}
                onUpdate={v => actions.update("kind", v)}
                defaultValue={defaultSelectors.flows["selectors.kind"]}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dates" className="control-label">
                Dates
              </label>
              <small className="help-block">Choose one date or a range data</small>
              <div className="row">
                <div className="col-xs-6">
                  <ItemSelector
                    valueKey="id"
                    type="dateMin"
                    data={dateMinOptions}
                    onChange={actions.update.bind(null, "dateMin")}
                    selected={selectors.dateMin}
                    onUpdate={v => actions.update("dateMin", v)}
                    defaultValue={defaultSelectors.flows["selectors.dateMin"]}
                  />
                </div>
                <div className="col-xs-6">
                  <ItemSelector
                    valueKey="id"
                    type="dateMax"
                    data={dateMaxOptions}
                    onChange={actions.update.bind(null, "dateMax")}
                    selected={selectors.dateMax}
                    onUpdate={v => actions.update("dateMax", v)}
                    defaultValue={defaultSelectors.flows["selectors.dateMax"]}
                  />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="dates" className="control-label">
                Value
              </label>
              <small className="help-block">Choose a min and/or max flow value</small>
              <div className="row">
                <div className="col-xs-6">
                  <input type="number" min="0" placeholder='minimal' onChange={e => actions.update("valueMin", e.target.value)} value={selectors.valueMin || ''}/>
                </div>
                <div className="col-xs-6">
                  <input type="number" min="0" placeholder='maximal' onChange={e => actions.update("valueMax", e.target.value)} value={selectors.valueMax || ''}/>
                </div>
              </div>
            </div>
            
            <div className="form-group-fixed">
              <button
                className="btn btn-default"
                data-loading={loading}
                
                onClick={actions.addChart}
              >
                Update
              </button>
            </div>
          </form>
        </div>
        {/* Content panel */}<div  className="col-xs-12 col-sm-6 col-md-8">
        <DataTable data={flows} loading={loading} alert={alert}/> 
        {/* Right panel */}
        </div>
        <div
          className="aside-legend"
          ref={el => {
            this.legend = el;
          }}
        >
          <div>
            Your filters returned {nbFlows} rows.<br/>
            A maximum of {specs.flowsRowsMax} rows are displayed per page.
            <br />
            <Button
              type="submit"
              className="btn btn-default"
              disabled={page === 0}
              onClick={() => actions.changePage(page - 1)}
            >
              Previous
            </Button>{" "}
            page {page + 1}{" "}
            <Button
              type="submit"
              className="btn btn-default"
              disabled={!nbFlows || nbFlows < (specs.flowsRowsMax*page)}
              onClick={() => actions.changePage(page + 1)}
            >
              Next
            </Button>
          </div>
         
           
          <div className="form-group-fixed form-group-fixed-right">
            <ExportButton
              exports={[
                {
                  label: "Export nodes CSV",
                  fn: () => {
                    this.exportNodesCsv();
                  },
                },
                {
                  label: "Export edges CSV",
                  fn: () => {
                    this.exportEdgesCsv();
                  },
                },
                {
                  label: "Export SVG",
                  fn: () => {
                    this.exportGraph();
                  },
                },
              ]}
            />
          </div>
        </div>
      </VizLayout>
    );
  }
}

/**
 * TOFLIT18 Network Component
 * ===========================
 *
 * Component displaying a sigma.js network showing the relations between
 * partners and directions.
 */
import React, {Component} from 'react';
import {debounce, keys, max} from 'lodash'
import {format, formatPrefix} from 'd3-format';
import {
  updateSelector
} from "../../../actions/flows";

import { branch } from "baobab-react/decorators";
/**
 * Formats.
 */
const SI_FORMAT = formatPrefix(',.0s', 1.3e3);
const Y_AXIS_FORMAT = nb => {
  if (nb < 1000)
    return '' + (nb | 0);

  return SI_FORMAT(nb);
};
const NUMBER_FORMAT = n => n%1===0 ? format(',')(n) :format(',.2f')(n);

const PERCENTAGE_FORMAT = format('.0%');

/**
 * Custom tooltip.
 */
const UNITS = {
  count: () => 'flows',
  value: payload => payload.year < 1797 ? 'lt.' : 'Fr.',
  kg: () => 'kg',
  litre: () => 'litres',
  nbr: () => 'pieces'
};

import ReactDataGrid from 'react-data-grid';
const {
  DraggableHeader: { DraggableContainer }
} = require("react-data-grid-addons");





@branch({
  actions: {
    updateSelector
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
export default class FlowsTable extends Component {
  constructor(props, context) {
    super(props, context);
    this.rowHeight = 25;
    this.headerRowHeight= 50;
  }

  onHeaderClick(e){
    const {key} = e;
    let sort = this.props.orders.find(s => s.key === key)
    if (sort){
        this.props.actions.updateSelector("orders",this.props.orders.map(s => {
          // already there but need to change order
          if(s.key === key && s.order === "DESC")
            return {...s, order:"ASC"}
          // another sort we need to keep in place
          if(s.key !==key)
            return s
          // already there but in ASC mode => remove it through filtered falsy return
          if(s.key === key && s.order === "ASC")
            return false
          }).filter(s => s))
    }else
    // add it in DESC mode
      this.props.actions.updateSelector("orders", [...this.props.orders, {key, order:"DESC"} ])
    
  }

  updateColumnsOrder(cs) {
    this.props.actions.updateSelector("columns",cs);
  }

  onHeaderDrop = (source, target) => {
    const stateCopy = [...this.props.columnsOrder];
    const columnSourceIndex = this.props.columnsOrder.findIndex(
      i => i === source
    );
    const columnTargetIndex = this.props.columnsOrder.findIndex(
      i => i === target
    );

    stateCopy.splice(
      columnTargetIndex,
      0,
      stateCopy.splice(columnSourceIndex, 1)[0]
    );
    this.updateColumnsOrder([]);
    this.updateColumnsOrder(stateCopy);
  };


    render() {
      
      const {flows, columnsOrder} = this.props;
      const rows = flows || []
      const headerRenderer = (props) => {
        const headerText = props.column.rowType === 'header' ? props.column.name : '';
        return (
          <div className='widget-HeaderCell__value' style={{cursor: "pointer"}} onClick={()=>this.onHeaderClick(props.column)}>
            {headerText}
            {props.column.sort.key &&
              <span className="pull-right">
                {props.column.sort.order === "DESC"? '▼':'▲'} {props.column.sort.index+1}
              </span>
            }
          </div>); 
      }
      const columnsSpecificOpts = {
        rowIndex: {name:"#", width:rows.length>0?(rows[rows.length-1].rowIndex+'').length*8+16:0 },
        import: {width: 70,formatter:({value}) => (value ? (<div>import</div>) : (<div>export</div>))},
        year: {width:50},
        value: {
          formatter:({row}) => { 
            if (row.value)
              return <div>{`${NUMBER_FORMAT(row.value)} ${row.year <"1797" ? 'lt.': 'Fr.'}`}</div>
            else
              return <div>N/A</div>;
          },
          width:rows.length>0? max(max(rows.map(r => NUMBER_FORMAT(r.value).length+4))*8,50) :0 
        }
      }
      
      const columns = columnsOrder.map(key => (
        {key,
          name:key, 
          draggable:true,
          resizable: columnsSpecificOpts[key] && !!columnsSpecificOpts[key].width, 
          headerRenderer,
          sort:{
            ...this.props.orders.find(s => s.key === key),
            index:this.props.orders.findIndex(s => s.key === key)
          },
          ...columnsSpecificOpts[key]}
        ));
      
      return (
        <DraggableContainer onHeaderDrop={this.onHeaderDrop}>
             <ReactDataGrid
            
              columns={[...columns]}
              rowGetter={i => rows[i]}
              rowsCount={rows.length}
              rowHeight={this.rowHeight}
              headerRowHeight={this.headerRowHeight}
              minHeight={900}
              
            />
            </DraggableContainer>);
    };
}
/**
 * TOFLIT18 Network Component
 * ===========================
 *
 * Component displaying a sigma.js network showing the relations between
 * partners and directions.
 */
import React, {Component} from 'react';
import {format, formatPrefix} from 'd3-format';
import {
  updateSelector
} from "../../../actions/flows";

import csvParse from "papaparse";
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
      
      const {flows, columnsOrder, columnsOptions} = this.props;

      const rows = flows || []
      const headerRenderer = (props) => {
        const headerText = props.column.rowType === 'header' ? props.column.name : '';
        return (
          <div className='widget-HeaderCell__value' 
              style={{
                cursor: "pointer", 
                textAlign:(props.column.name==='Value' ? 'right': 'left'),
                paddingRight:(props.column.name==='Value' ? '2em': 0)}}
              onClick={()=>this.onHeaderClick(props.column)}>
            {headerText}
            {props.column.sort.key &&
              <span className="pull-right">
                {props.column.sort.order === "DESC"? '▼':'▲'} {props.column.sort.index+1}
              </span>
            }
          </div>); 
      }
      const booleanFormatter = ({value}) => (value ? (<div>true</div>) : (<div>false</div>));
      const columnsSpecificOpts = {
        rowIndex: {name:"#", width:rows.length>0?(rows[rows.length-1].rowIndex+'').length*8+16:0 },
        import: {width: 70,formatter:({value}) => (value ? (<div>import</div>) : (<div>export</div>))},
        year: {width:50},
        value: {
          formatter:({row}) => { 
            
            if (row.value)
              return <div style={{textAlign:'right'}}>
                { (row.value%1===0) ?
                  // integer
                  <span>{format(',')(row.value)} {row.year <"1797" ? 'lt.': 'Fr.'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                  : // float
                  <span>{format(',.2f')(row.value)} {row.year <"1797" ? 'lt.': 'Fr.'}</span>
                }
              </div>
            else
              return <div style={{textAlign:'right'}}>N/A</div>

          },
        },
        unitPrice: {
          //TODO: create a generic numeric value formater
          formatter:({row}) => { 
            
            if (row.unitPrice)
              return <div style={{textAlign:'right'}}>
                { (row.unitPrice%1===0) ?
                  // integer
                  <span>{format(',')(row.unitPrice)} {row.year <"1797" ? 'lt.': 'Fr.'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                  : // float
                  <span>{format(',.4f')(row.unitPrice)} {row.year <"1797" ? 'lt.': 'Fr.'}</span>
                }
              </div>
            else
              return <div style={{textAlign:'right'}}>N/A</div>

          },
        },
        nationalProductBestGuess: {formatter:booleanFormatter},
        localProductBestGuess: {formatter:booleanFormatter},
        nationalGeographyBestGuess: {formatter:booleanFormatter},
        localGeographyBestGuess: {formatter:booleanFormatter}
        
      }
      const columns = rows.length > 0 ? ['rowIndex',...columnsOrder].map(c =>{
        const o = columnsOptions.find(co => co.id === c) || {id:c,name:c};

        return { key: o.id,
          name: o.name, 
          draggable:true,
          resizable: true, 
          headerRenderer,
          sort:{
            ...this.props.orders.find(s => s.key === o.id),
            index:this.props.orders.findIndex(s => s.key === o.id)
          },
          ...columnsSpecificOpts[o.id]}
        }) : [];
      
      return (
        <DraggableContainer onHeaderDrop={this.onHeaderDrop}>
             <ReactDataGrid
              columns={columns}
              rowGetter={i => rows[i]}
              rowsCount={rows.length}
              rowHeight={this.rowHeight}
              headerRowHeight={this.headerRowHeight}
              minHeight={900}
              enableCellSelect={false}  
            />
            </DraggableContainer>);
    };
}
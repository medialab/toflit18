/**
 * TOFLIT18 Network Component
 * ===========================
 *
 * Component displaying a sigma.js network showing the relations between
 * partners and directions.
 */
import React, {Component} from 'react';
import {keys, max, values, range} from 'lodash'
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
    this.state = {
      topLeft: {},
      botmRight: {},
    };
    
  }
  componentDidMount= () => {
    document.addEventListener("copy", this.copy);
  }
  componentWillUnmount= () =>{
    document.removeEventListener("copy", this.copy);
  }

  setSelection = args => {
    // console.log(args)
    this.setState({
      topLeft: {
        rowIdx: args.topLeft.rowIdx,
        colIdx: args.topLeft.idx
      },
      botmRight: {
        rowIdx: args.bottomRight.rowIdx,
        colIdx: args.bottomRight.idx
      }
    });
  };
  
  copy = (e) => {

    const { topLeft, botmRight } = this.state;

    if (topLeft.colIdx != -1 && botmRight.colIdx != -1){
      e.preventDefault();
      // Loop through each row
      const columns = range(topLeft.colIdx -1, botmRight.colIdx)
      .map(i => this.props.columnsOrder[i])
      console.log(columns, this.props.columnsOrder, topLeft.colIdx, botmRight.colIdx );
      const copyData =
        // headers
        [columns].concat(
        // data
        range(topLeft.rowIdx, botmRight.rowIdx + 1)
        .map(
          // Loop through each column
          rowIdx =>
            columns
              .map(
                // Grab the row values
                col => this.props.flows[rowIdx][col]
              )
        )
      );
      const csv = csvParse.unparse(copyData)
      
      e.clipboardData.setData("text/plain", csv);
    }
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
          <div className='widget-HeaderCell__value' style={{cursor: "pointer"}} onClick={()=>this.onHeaderClick(props.column)}>
            {headerText}
            {props.column.sort.key &&
              <span className="pull-right">
                {props.column.sort.order === "DESC"? '▼':'▲'} {props.column.sort.index+1}
              </span>
            }
          </div>); 
      }
      const booleanFormatter = ({value}) => (value ? (<div>true</div>) : (<div>false</div>))
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
              cellRangeSelection={{
                onComplete: this.setSelection
              }}
              
            />
            </DraggableContainer>);
    };
}
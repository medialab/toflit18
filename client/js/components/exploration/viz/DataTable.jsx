/**
 * TOFLIT18 Network Component
 * ===========================
 *
 * Component displaying a sigma.js network showing the relations between
 * partners and directions.
 */
import React, {Component} from 'react';
import {keys, max} from 'lodash'
import {format, formatPrefix} from 'd3-format';


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

export default class FlowsTable extends Component {
  constructor(props, context) {
    super(props, context);
    this.rowHeight = 25;
    this.headerRowHeight= 50;

    
  }
    render() {
      const {flows, loading,alert} = this.props;
      const rows = flows || []
      const columnsSpecificOpts = {
        "rowIndex": {name:"#", width:rows.length>0?(rows[rows.length-1].rowIndex+'').length*8+16:0 },
        "import":{width: 70,formatter:({value}) => (value ? (<div>import</div>) : (<div>export</div>))},
        "year": {width:50},
        "value": {
          formatter:({row}) => { 
            if (row.value)
              return <div>{`${NUMBER_FORMAT(row.value)} ${row.year <"1797" ? 'lt.': 'Fr.'}`}</div>
            else
              return <div>N/A</div>;
          },
          width:rows.length>0?max(rows.map(r => NUMBER_FORMAT(r.value).length+4))*8 :0 
        }
      }
      
      const columns = rows.length > 0 ? keys(rows[0]).map(key => (
        {key,name:key, resizable:true, ...columnsSpecificOpts[key]}
        )) : []
      
      return (<div>
            {(alert || loading) && (
                <div className="progress-container progress-container-viz">
                  {alert && (
                    <div className="alert alert-danger" role="alert">
                      {alert}
                    </div>
                  )}
                  {loading && (
                    <div className="progress-line progress-line-viz">
                      <span className="sr-only">Loading...</span>
                    </div>
                  )}
                </div>
              )}
             {rows.length > 0 &&  <ReactDataGrid
              columns={columns}
              rowGetter={i => rows[i]}
              rowsCount={rows.length}
              rowHeight={this.rowHeight}
              headerRowHeight={this.headerRowHeight}
              minHeight={900}
            />}
            </div>);
    };
}
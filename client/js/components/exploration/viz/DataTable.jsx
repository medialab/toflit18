/**
 * TOFLIT18 Network Component
 * ===========================
 *
 * Component displaying a sigma.js network showing the relations between
 * partners and directions.
 */
import React, {Component} from 'react';
import {keys} from 'lodash'


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
        "rowIndex": {name:"#", width:rows.length>0?(rows[rows.length-1].rowIndex+'').length*15:0 },
        "import":{width: 70,formatter:value => (value ? (<div>import</div>) : (<div>export</div>))},
      "year": {width:50}
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
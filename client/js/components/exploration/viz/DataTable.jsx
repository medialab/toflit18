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
 


export default class DataTable extends Component {
  constructor(props, context) {
    super(props, context);
  }
    render() {
      const {data, loading,alert} = this.props;
      const rows = data || []
      const columns = rows.length > 0 ? keys(rows[0]).map(key => ({key,name:key, resizable:true,})) : []
      
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
              minHeight={800}
            />}
            </div>);
    };
}
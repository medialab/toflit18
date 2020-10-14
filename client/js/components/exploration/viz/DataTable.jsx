/**
 * TOFLIT18 Network Component
 * ===========================
 *
 * Component displaying a sigma.js network showing the relations between
 * partners and directions.
 */
import React, {Component} from 'react';
import {keys, toPairs} from 'lodash'


//import DataGrid from 'react-data-grid';
//import 'react-data-grid/dist/react-data-grid.css';
 
const columns = [
  { key: 'id', name: 'ID' },
  { key: 'title', name: 'Title' }
];
 
const rows = [
  { id: 0, title: 'Example' },
  { id: 1, title: 'Demo' }
];
 
export default class DataTable extends Component {

    render() {
        let {data, loading,alert} = this.props;
        if (!data) data = [];
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
            {data && data.length > 0 && 
            <table>
                <tbody> 
                    <tr key='headers'>
                        {keys(data[0]).map((k) => (<td key={k}>{k}</td>))}
                    </tr>
                {(data || []).map((flow,i)=> (
                    <tr key={i}>
                        {keys(flow).map((k) => (<td key={k}>{flow[k]}</td>))}
                    </tr>
                ))}
                </tbody> 
            </table>}
            </div>);
    };
}
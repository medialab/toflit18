/**
 * TOFLIT18 Client Classification View
 * =====================================
 *
 * Displayed the view used to aggregate data.
 */
import React, {Component} from 'react';

// TEMP
import client from '../../client';

export default class ClassificationPanel extends Component {
  componentDidMount() {
    client.test((err, data) => this.setState({data: data}));
  }

  render() {
    return (
      <ul>
        {this.state && this.state.data.map(e => <li key={e.classified.name}>{e.classified.name}</li>)}
      </ul>
    );
  }
}

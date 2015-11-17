/**
 * TOFLIT18 Data Quality Bar Chart Component
 * ==========================================
 *
 * A brushable component displaying a bar chart showing periods of time when
 * data is actually existing.
 */
import React, {Component} from 'react';

/**
 * Main component
 */
export default class DataQualityBarChart extends Component {
  render() {
    const {data} = this.props;

    return (
      <svg width="100%" height={200}>
        {data.map((row, i) =>
          <rect className="quality-bar" />)}
      </svg>
    );
  }
}

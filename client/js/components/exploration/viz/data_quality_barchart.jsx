/**
 * TOFLIT18 Data Quality Bar Chart Component
 * ==========================================
 *
 * A brushable component displaying a bar chart showing periods of time when
 * data is actually existing.
 */
import React, {Component} from 'react';
import measured from '../../../lib/measured';
import {linear, ordinal} from 'd3-scale';

/**
 * Main component
 */
@measured
export default class DataQualityBarChart extends Component {
  render() {
    const {data} = this.props;

console.log(this.props)



//     var x = d3.scale.ordinal()
//     .rangeRoundBands([0, width], .1);

// var y = d3.scale.linear()
//     .range([height, 0]);

    return (
      <svg width="100%" height={200}>
        {data.map((row, i) =>
          <rect key={i} className="quality-bar" />)}
      </svg>
    );
  }
}


  // svg.selectAll(".bar")
  //     .data(data)
  //   .enter().append("rect")
  //     .attr("class", "bar")
  //     .attr("x", function(d) { return x(d.letter); })
  //     .attr("width", x.rangeBand())
  //     .attr("y", function(d) { return y(d.frequency); })
  //     .attr("height", function(d) { return height - y(d.frequency); });

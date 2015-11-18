/**
 * TOFLIT18 Data Quality Bar Chart Component
 * ==========================================
 *
 * A component displaying a matrix of import and export entries for destination
 * and countries by year
 */
import React, {Component} from 'react';
import measured from '../../../lib/measured';
import scale from 'd3-scale';
import {max, range} from 'lodash';

/**
 * Main component
 */
 export default class Matrix extends Component {
  render() {
    const {data} = this.props;

    console.log(data)

    let width = 1000,
        height = 1000;

    let s = scale.log().domain([1700, 55 * 1000 * 1000]).range(["yellow", "red"]);

      return (
      <svg width={width} height={height}>
        <g>
        {data.map((line, i) => 
          line.map((item, j) => {
            if (i === 0) 
              return <text width={48} height={48} x={10 + 50 * j} y={10} transform={`rotate(90 ${10 + 50 * j},10)`}>{item}</text>
            else if (j === 0)
              return <text width={48} height={48} x={50 * j} y={30 + 50 * i}>{item}</text>
            else
              return <rect width={48} height={48} x={50 * j} y={50 * i} stroke="blue" fill={!i || !+item ? 'white' : s(item)}> 
            <title>{`${item} total flows`}</title>
            </rect>
            })
          )}
        
        </g>
      </svg>
    );

    }
}
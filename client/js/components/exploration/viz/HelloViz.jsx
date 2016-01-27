import React, {Component} from 'react';

export default class HelloViz extends Component {
  render() {

    const result = this.props.data.result;
    const lineHeight = 17;
    const stroke = 2;

    function renderItem(item, i) {

      const cx = (i + 1) * lineHeight;
      const color = (i % 2 === 0) ? 'tomato' : 'royalblue';

      return (<g transform={`translate(10,${cx})`} >
        <rect transform={'translate(80,0)'}
        strokeWidth={stroke} fill="transparent" stroke={color}
          width={item.directions.length * lineHeight / 2} height={lineHeight / 2}/>
        <circle r={i / 10} stroke={color} strokeWidth={stroke} fill="transparent" />
        <text x={20} y={10}>{item.year}</text>
      </g>);
    }

    return (<div>results : {result.length}

      <svg width="100%" height={(result.length + 2) * lineHeight}>
        {result.map(renderItem)}
      </svg>

    </div>);
  }
}

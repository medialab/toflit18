/* eslint no-confusing-arrow: 0 */
/**
 * TOFLIT18 Data Line Chart Component
 * ===================================
 *
 * Basic line chart component describing flows along the years.
 */
import React, {Component} from 'react';
import {format, formatPrefix} from 'd3-format';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line
} from 'recharts';

/**
 * Formats.
 */
const SI_FORMAT = formatPrefix(',.0s', 1.3e3);
const Y_AXIS_FORMAT = nb => {
  if (nb < 1000)
    return '' + (nb | 0);

  return SI_FORMAT(nb);
};
const NUMBER_FORMAT = format(',');

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

const renderTooltip = valueKey => data => {
  const payload = data.payload.slice().sort((a, b) => {
    return b.value - a.value;
  });

  const style = {
    margin: 0,
    padding: 10,
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    whiteSpace: 'nowrap'
  };

  return (
    <div style={style}>
      <em className="recharts-tooltip-label">{data.label}</em>
      <ul style={{listStyleType: 'none', padding: '0px', margin: '0px'}}>
        {payload.map(item => {

          return (
            <li key={item.name}>
              <span style={{color: item.color}}>{NUMBER_FORMAT(item.value | 0)} {UNITS[valueKey](item.payload)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/**
 * Main component.
 */
export default class LineChart extends Component {
  render() {
    const {
      data,
      valueKey = 'value'
    } = this.props;

    if (!data || !data.length)
      return null;

    const minYear = Math.min.apply(null, data.map(line => line.data[0].year));

    const maxYear = Math.max.apply(null, data.map(line => line.data[line.data.length - 1].year));

    const lineData = new Array(maxYear - minYear + 1);

    const hash = year => year - minYear;

    for (let i = 0, l = lineData.length; i < l; i++)
      lineData[i] = {year: minYear + i};

    data.forEach((line, i) => {
      for (let j = 0, m = line.data.length; j < m; j++) {

        // Dropping zeros
        if (!line.data[j][valueKey])
          continue;

        const h = hash(line.data[j].year);
        lineData[h][i] = line.data[j][valueKey];
      }
    });

    return (
      <div className="line-chart">
        <ResponsiveContainer width="100%" height={250}>
          <RechartsLineChart
            syncId="indicators"
            data={lineData}
            margin={{top: 5, right: 30, left: 20, bottom: 5}}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              domain={[minYear, maxYear]}
              interval={10} />
            <YAxis tickFormatter={Y_AXIS_FORMAT} />
            <Tooltip
              isAnimationActive={false}
              content={renderTooltip(valueKey)} />
            {data.map((line, i) => {
              return (
                <Line
                  key={i}
                  dataKey={i}
                  stroke={line.color}
                  isAnimationActive={false}
                  dot={{r: 2, stroke: line.color, strokeWidth: 1}}
                  activeDot={{r: 4, stroke: 'white', strokeWidth: 2, fill: line.color}} />
              );
            })}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

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

const renderTooltip = valueKey => data => {
  const payload = data.payload.slice()
    .filter(item => item.value)
    .sort((a, b) => {
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
        {payload.map((item, line) => {

          if (!item.value)
            return null;

          return (
            <li key={line}>
              <span style={{color: item.color}}>
                {NUMBER_FORMAT(Math.trunc(item.value))}
                &nbsp;
                {UNITS[valueKey](item.payload)}
                {item.payload[line].share && ` (${PERCENTAGE_FORMAT(item.payload[line].share)})`}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const renderDot = (color, line) => data => {

  if (!data.value)
    return null;

  const row = data.payload[line];

  return (
    <g key={data.key}>
      <circle
        cx={data.cx}
        cy={data.cy}
        r={2}
        style={{
          strokeWidth: 0.3,
          stroke: '#fff',
          fill: '#fff'
        }} />
      <circle
        cx={data.cx}
        cy={data.cy}
        r={2}
        style={{
          fillOpacity: 'share' in row ? row.share : 1,
          strokeWidth: 0.3,
          stroke: color,
          fill: color
        }} />
    </g>
  );
};

/**
 * Main component.
 */
export default class LineChart extends Component {
  render() {
    const {
      shareKey = null,
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
        lineData[h][i] = {
          value: line.data[j][valueKey]
        };

        if (shareKey)
          lineData[h][i].share = line.data[j][shareKey] / line.data[j].count;
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
              content={renderTooltip(valueKey, shareKey)} />
            {data.map((line, i) => {
              return (
                <Line
                  key={i}
                  dataKey={row => row[i] && row[i].value}
                  stroke={line.color}
                  isAnimationActive={false}
                  dot={renderDot(line.color, i)}
                  activeDot={{r: 4, stroke: 'white', strokeWidth: 2, fill: line.color}} />
              );
            })}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

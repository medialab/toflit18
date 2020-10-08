/**
 * TOFLIT18 Data Quality Bar Chart Component
 * ==========================================
 *
 * A brushable component displaying a bar chart showing periods of time when
 * data is actually existing.
 */
import React, { Component } from "react";
import { format } from "d3-format";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";

/**
 * Formats.
 */
const NUMBER_FORMAT = format(",");

/**
 * Custom tooltip.
 */
const renderTooltip = unit => data => {
  const payload = data.payload.slice().sort((a, b) => {
    return b.value - a.value;
  });

  const style = {
    margin: 0,
    padding: 10,
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    whiteSpace: "nowrap",
  };

  return (
    <div style={style}>
      <em className="recharts-tooltip-label">{data.label}</em>
      <ul style={{ listStyleType: "none", padding: "0px", margin: "0px" }}>
        {payload.map(item => {
          return (
            <li key={item.name}>
              <span style={{ color: item.color }}>
                {NUMBER_FORMAT(item.value)} {unit}
              </span>
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
export default class DataQualityBarChart extends Component {
  render() {
    const { unit = "directions", data, syncId = "data-quality-barchart", yAxis = false } = this.props;
    if (!data || !data.length) return null;

    return (
      <div className="quality-bar-chart">
        <ResponsiveContainer width="100%" height={100}>
          <BarChart syncId={syncId} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            {yAxis && <YAxis />}
            <Tooltip content={renderTooltip(unit)} isAnimationActive={false} />
            <Bar dataKey="data" fill="#8d4d42" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

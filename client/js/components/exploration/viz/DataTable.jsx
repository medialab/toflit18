/**
 * TOFLIT18 Network Component
 * ===========================
 *
 * Component displaying a sigma.js network showing the relations between
 * partners and regions.
 */
import { branch } from 'baobab-react/decorators';
import { format } from 'd3-format';
import { isNil } from 'lodash';
import React, { Component } from 'react';
import ReactDataGrid from 'react-data-grid';
const {
  DraggableHeader: {DraggableContainer},
} = require('react-data-grid-addons');


import { updateSelector } from '../../../actions/flows';


function valueFormater(value, year) {
  if (!isNil(value))
  return (
    <div style={{textAlign: 'right'}}>
      {value % 1 === 0 ? (
        // integer
        <span>
          {format(',')(value)} {year < '1797' ? 'lt.' : 'Fr.'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span>
      ) : (
        // float
        <span>
          {format(',.2f')(value)} {year < '1797' ? 'lt.' : 'Fr.'}
        </span>
      )}
    </div>
  );
  else return <div style={{textAlign: 'right'}}>N/A</div>;
}
function numberFormater(value, floatFormat = ',.2f') {
  if (!isNil(value))
    return (
      <div style={{textAlign: 'right'}}>
        {value % 1 === 0 ? (
          // integer
          <span>{format(',')(value)}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        ) : (
          // float
          <span>{format(floatFormat)(value)}</span>
        )}
      </div>
    );
  else return <div style={{textAlign: 'right'}}>N/A</div>;
}

@branch({
  actions: {
    updateSelector,
  },
  cursors: {
    alert: ['ui', 'alert'],
    classifications: ['data', 'classifications', 'flat'],
    classificationIndex: ['data', 'classifications', 'index'],
    regions: ['data', 'regions'],
    sourceTypes: ['data', 'sourceTypes'],
    state: ['explorationFlowsState'],
  },
})
export default class FlowsTable extends Component {
  constructor(props, context) {
    super(props, context);
    this.rowHeight = 25;
    this.headerRowHeight = 50;
  }

  onHeaderClick(e) {
    const {key} = e;
    const sort = this.props.orders.find(s => s.key === key);
    if (sort) {
      this.props.actions.updateSelector(
        'orders',
        this.props.orders
          .map(s => {
            // already there but need to change order
            if (s.key === key && s.order === 'DESC') return {...s, order: 'ASC'};
            // another sort we need to keep in place
            if (s.key !== key) return s;
            // already there but in ASC mode => remove it through filtered falsy return
            if (s.key === key && s.order === 'ASC') return false;
          })
          .filter(s => s),
      );
    }
    // add it in DESC mode
    else this.props.actions.updateSelector('orders', [...this.props.orders, {key, order: 'DESC'}]);
  }

  updateColumnsOrder(cs) {
    this.props.actions.updateSelector('columns', cs);
  }

  onHeaderDrop = (source, target) => {
    const stateCopy = [...this.props.columnsOrder];
    const columnSourceIndex = this.props.columnsOrder.findIndex(i => i === source);
    const columnTargetIndex = this.props.columnsOrder.findIndex(i => i === target);

    stateCopy.splice(columnTargetIndex, 0, stateCopy.splice(columnSourceIndex, 1)[0]);
    this.updateColumnsOrder([]);
    this.updateColumnsOrder(stateCopy);
  };

  render() {
    const {
      actions: {updateSelector},
      flows,
      columnsOrder,
      columnsOptions,
      state: {selectors},
    } = this.props;

    const rows = flows || [];
    const headerRenderer = props => {
      const headerText = props.column.rowType === 'header' ? props.column.name : '';
      return (
        <div
          className="widget-HeaderCell__value"
          style={{
            cursor: 'pointer',
            textAlign: props.column.name === 'Value' ? 'right' : 'left',
            paddingRight: props.column.name === 'Value' ? '2em' : 0,
          }}
          onClick={() => this.onHeaderClick(props.column)}
        >
          {headerText}
          {props.column.sort.key && (
            <span className="pull-right">
              {props.column.sort.order === 'DESC' ? '▼' : '▲'} {props.column.sort.index + 1}
            </span>
          )}
        </div>
      );
    };
    const booleanFormatter = ({value}) => {
      if (value) return <div>true</div>;
      else return <div>false</div>;
    };
    const columnsSpecificOpts = {
      rowIndex: {name: '#', width: rows.length > 0 ? (rows[rows.length - 1].rowIndex + '').length * 8 + 16 : 0},
      import: {
        width: 70,
        formatter: ({value}) => {
          if (value) return <div>import</div>;
          else return <div>export</div>;
        },
      },
      value: {
        formatter: ({row}) => {
          return valueFormater(row.value, row.year);
        },
      },
      value_per_unit: {
        formatter: ({row}) => {
          return valueFormater(row.value_per_unit, row.year);
        },
      },
      value_per_unit_metric: {
        formatter: ({row}) => {
          return valueFormater(row.value_per_unit_metric, row.year);
        },
      },
      quantity: {
        formatter: ({row}) => {
          return numberFormater(row.quantity);
        },
      },
      quantity_metric: {
        formatter: ({row}) => {
          return numberFormater(row.quantity_metric);
        },
      },
      year: {
        width: 50,
        formatter: ({row}) => {
          return numberFormater(row.year, ',.1f');
        },
      },
      source: {width: 400},
      bestGuessNationalProductXPartner: {formatter: booleanFormatter},
      bestGuessNationalProduct: {formatter: booleanFormatter},
      bestGuessNationalPartner: {formatter: booleanFormatter},
      bestGuessCustomsRegionProductXPartner: {formatter: booleanFormatter},
      bestGuessNationalCustomsRegion: {formatter: booleanFormatter},
      unverified: {formatter: booleanFormatter},
    };
    const columns =
      rows.length > 0
        ? ['rowIndex', ...columnsOrder].map(c => {
            const o = columnsOptions.find(co => co.id === c) || {id: c, name: c};

            const options = {
              key: o.id,
              name: o.name,
              draggable: true,
              resizable: true,
              headerRenderer,
              sort: {
                ...this.props.orders.find(s => s.key === o.id),
                index: this.props.orders.findIndex(s => s.key === o.id),
              },
              width: 100, // default width
              ...columnsSpecificOpts[o.id],
            };
            if (selectors.columnsWidth && selectors.columnsWidth[c]) options.width = selectors.columnsWidth[c];
            return options;
          })
        : [];

    return (
      <DraggableContainer onHeaderDrop={this.onHeaderDrop}>
        <ReactDataGrid
          columns={columns}
          rowGetter={i => rows[i]}
          rowsCount={rows.length}
          rowHeight={this.rowHeight}
          headerRowHeight={this.headerRowHeight}
          minHeight={this.props.containerHeight ? this.props.containerHeight : 500}
          enableCellSelect={false}
          minColumnWidth={50}
          onColumnResize={(e, width) => {
            updateSelector('columnsWidth', {...selectors.columnsWidth, [columns[e].key]: width});
          }}
        />
      </DraggableContainer>
    );
  }
}

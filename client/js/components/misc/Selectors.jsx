/**
 * TOFLIT18 Selectors Component
 * =============================
 *
 * Series of various selectors used throughout the app.
 */
import React, {Component, PropTypes} from 'react';
import Select from 'react-select';
import {prettyPrint} from '../../lib/helpers';
import {debounce, identity} from 'lodash';
import cls from 'classnames';

/**
 * Classification selector.
 */
export class ClassificationSelector extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    type: PropTypes.string.isRequired
  };

  renderOption(o) {
    const classifiedItemsCount = prettyPrint(o.itemsCount - o.unclassifiedItemsCount);

    return (
      <div className="option">
        <div>
          <strong>{o.name}</strong> ({o.author})
        </div>
        <div className="addendum">
          {prettyPrint(o.groupsCount)} groups.
        </div>
        <div className="addendum">
          {!o.source ?
            <span>{classifiedItemsCount} / {prettyPrint(o.itemsCount)} classified items ({o.completion}%)</span> :
            <span>&nbsp;</span>
          }
        </div>
      </div>
    );
  }

  render() {
    const classifications = this.props.data;

    let placeholder = this.props.placeholder;

    if (!placeholder)
      placeholder = this.props.type === 'product' ?
        'Product classification...' :
        'Country classification...';

    return (
      <Select
        className="selector selector-classification"
        labelKey="name"
        isLoading={this.props.loading}
        disabled={this.props.loading || this.props.disabled}
        placeholder={placeholder}
        clearable={this.props.clearable}
        options={classifications}
        optionRenderer={this.renderOption}
        onChange={this.props.onChange}
        value={this.props.selected}
        valueRenderer={this.renderOption} />
    );
  }
}

/**
 * Item selector.
 */
const TEMPLATES = {
  product: [],
  country: [],
  direction: [{name: 'All', id: '$all$'}, {name: 'None (National)', id: '$none$'}],
  kind: [{name: 'Total', id: 'total'}, {name: 'Import', id: 'import'}, {name: 'Export', id: 'export'}],
  sourceType: [],
  dateMin: [],
  dateMax: []
};

const PLACEHOLDERS = {
  product: 'Product...',
  country: 'Country...',
  direction: 'Direction...',
  kind: 'Import/Export...',
  sourceType: 'Source type...',
  dateMin: 'Date min...',
  dateMax: 'Date max...'
};

const MAX_LIST_SIZE = 200;

export class ItemSelector extends Component {

  static propTypes = {
    type: PropTypes.string.isRequired
  };

  constructor(props, context) {
    super(props, context);

    const type = props.type;

    this.compulsoryOptions = (TEMPLATES[type] || []).map(o => ({...o, special: true}));
  }

  search(input, callback) {

    const warning = {
      id: '$warning$',
      disabled: true,
      name: 'This list contains too many elements. Try searching...'
    };

    if (!input.trim())
      return callback(null, {options: this.compulsoryOptions.concat([warning])});

    // TODO: This could be optimized by using lodash's lazy chaining
    let options = this.props.data
      .filter(function(group) {
        input = input.toLowerCase();
        const name = group.name.toLowerCase();
        return !!~name.indexOf(input);
      });

    if (options.length > MAX_LIST_SIZE) {
      options = options
        .slice(0, MAX_LIST_SIZE)
        .concat([{id: '$warning$', disabled: true, name: 'Too many results to display. Try refining your query...'}]);
    }

    return callback(null, {options});
  }

  renderOption(o) {
    return (
      <div className={cls('option', {special: o.special})}>
        <strong>{o.name}</strong>
      </div>
    );
  }

  render() {
    const {
      data = [],
      disabled,
      loading,
      onChange,
      selected,
      type
    } = this.props;

    const isTooLong = data.length > MAX_LIST_SIZE;

    const trulyDisabled = disabled || loading;

    const commonProps = {
      className: 'selector',
      isLoading: loading,
      disabled: trulyDisabled,
      labelKey: 'name',
      value: selected || !trulyDisabled && this.compulsoryOptions[0],
      onChange,
      placeholder: PLACEHOLDERS[type],
      optionRenderer: this.renderOption,
      valueRenderer: this.renderOption
    };

    if (!isTooLong)
      return <Select {...commonProps} options={this.compulsoryOptions.concat(data)} />;

    return (
      <Select.Async
        {...commonProps}
        loadOptions={debounce(this.search.bind(this), 300)}
        filterOptions={identity}
        ignoreAccents={false}
        cache={false} />
    );
  }
}

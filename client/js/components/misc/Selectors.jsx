/**
 * TOFLIT18 Selectors Component
 * =============================
 *
 * Series of various selectors used throughout the app.
 */
import React, {Component, PropTypes} from 'react';
import Select from 'react-select';
import {prettyPrint} from '../../lib/helpers';
import {debounce} from 'lodash';
import cls from 'classnames';

const AsyncSelect = Select.Async;

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
          {classifiedItemsCount} / {prettyPrint(o.itemsCount)} classified items ({o.completion}%)
        </div>
      </div>
    );
  }

  render() {
    const classifications = this.props.data;

    const options = classifications
      .filter(c => !c.source);

    const placeholder = this.props.type === 'product' ?
      'Product classification...' :
      'Country classification...';

    return <Select className="selector selector-classification"
                   searchable={false}
                   isLoading={this.props.loading}
                   disabled={this.props.loading}
                   placeholder={placeholder}
                   options={options}
                   optionRenderer={this.renderOption}
                   onChange={this.props.onChange}
                   value={this.props.selected}
                   valueRenderer={this.renderOption} />;
  }
}

/**
 * Item selector.
 */
const TEMPLATES = {
  product: [{name: 'All', id: '$all$'}, {name: 'None (National)', id: '$none$'}],
  country: [{name: 'All', id: '$all$'},],
  direction: [{name: 'All', id: '$all$'}, {name: 'None (National)', id: '$none$'}],
  kind: [{name: 'Total', id: 'total'}, {name: 'Import', id: 'import'}, {name: 'Export', id: 'export'}]
};

const PLACEHOLDERS = {
  product: 'Product...',
  country: 'Country...',
  direction: 'Direction...',
  kind: 'Import/Export...'
};

const MAX_LIST_SIZE = 100;

export class ItemSelector extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired
  };

  constructor(props, context) {
    super(props, context);

    const type = props.type;

    this.compulsoryOptions = TEMPLATES[type].map(o => ({...o, special: true}));
  }

  renderOption(o) {
    return (
      <div className={cls('option', {special: o.special})}>
        <strong>{o.name}</strong>
      </div>
    );
  }

  search(input, callback) {
    if (!input.trim())
      return callback(null, {options: this.compulsoryOptions});

    const options = this.props.data
      .filter(function(group) {
        return !!~group.name.indexOf(input);
      })
      .slice(0, MAX_LIST_SIZE);

    return callback(null, {options});
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

    return <Select.Async {...commonProps}
                         loadOptions={debounce(this.search.bind(this), 300)}
                         cache={false}
                         noResultsText="Too many elements. Try searching..." />;
  }
}

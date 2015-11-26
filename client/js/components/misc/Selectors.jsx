/**
 * TOFLIT18 Selectors Component
 * =============================
 *
 * Series of various selectors used throughout the app.
 */
import React, {Component, PropTypes} from 'react';
import Select from 'react-select';
import {prettyPrint} from '../../lib/helpers';

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
  product: ['All', 'None (National)'],
  country: ['All'],
  direction: ['All', 'None (National)'],
};

const PLACEHOLDERS = {
  product: 'Product...',
  country: 'Country...',
  direction: 'Direction...',
  kind: 'Import/Export...'
}

const MAX_LIST_SIZE = 500;

export class ItemSelector extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired
  };

  renderOption(o) {
    return (
      <div className="option">
        <strong>{o.label}</strong>
      </div>
    );
  }

  render() {
    const {
      data,
      onChange,
      selected,
      type
    } = this.props;

    const isTooLong = data.length > MAX_LIST_SIZE;

    let options = [];

    if (!isTooLong)
      options = data.map(g => ({label: g.name, option: g.id}));

    return <Select className="selector"
                   value={selected}
                   onChange={onChange}
                   placeholder={PLACEHOLDERS[type]}
                   optionRenderer={this.renderOption}
                   valueRenderer={this.renderOption}
                   options={options}
                   noResultsText="Too many elements. Try searching..." />;
  }
}

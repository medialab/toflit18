/**
 * TOFLIT18 Selectors Component
 * =============================
 *
 * Series of various selectors used throughout the app.
 */
import React, {Component, PropTypes} from 'react';
import Select, {AsyncCreatable} from 'react-select';
import {
  getValueFromString,
  prettyPrint,
  regexIdToString
} from '../../lib/helpers';
import {debounce, identity} from 'lodash';
import cls from 'classnames';

const DEFAULT_VALUE_KEY = 'value';

/**
 * Helpers to transform full data object to ID, in both regions.
 */
function _dataToId(value, valueKey = DEFAULT_VALUE_KEY) {
  if (!value) return value;
  if (Array.isArray(value)) return value.map(v => _dataToId(v, valueKey));
  if (typeof value === 'object') return value[valueKey];
  return value;
}
function _idToData(id, values, valueKey, type) {
  if (!id) return id;
  if (typeof id === 'string') {
    const isRegexId = regexIdToString(id);
    if (isRegexId) return getValueFromString(isRegexId, type, valueKey);
  }
  if (Array.isArray(id)) return id.map(s => _idToData(s, values, valueKey, type)).filter(identity);
  if (Array.isArray(values)) return values.find(o => o[valueKey] === id);
  if (typeof values === 'object') return values[id];
  return null;
}

/**
 * Classification selector.
 */
export class ClassificationSelector extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    type: PropTypes.string.isRequired
  };

  componentWillUpdate(nextProps) {
    // we might have default selection to initialize
    // test if we have new data
   if (!this.defaultTriggered && this.props.defaultValue && !this.props.selected && nextProps.data.length > 0) {
      nextProps.onUpdate(_dataToId(nextProps.data.filter(d => d.name === this.props.defaultValue)[0], this.props.valueKey));
      this.defaultTriggered = true;
    }
  }

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
        'Partner classification...';

    return (
      <Select
        className="selector selector-classification"
        labelKey="name"
        isLoading={this.props.loading}
        valueKey={this.props.valueKey}
        disabled={this.props.loading || this.props.disabled}
        placeholder={placeholder}
        clearable={this.props.clearable}
        options={classifications}
        optionRenderer={this.renderOption}
        onChange={this.props.onChange && (v => this.props.onChange(_dataToId(v, this.props.valueKey)))}
        onUpdate={this.props.onUpdate && (v => this.props.onUpdate(_dataToId(v, this.props.valueKey)))}
        value={this.props.selected}
        valueRenderer={this.renderOption}
        defaultValue={this.props.defaultValue} />
    );
  }
}

/**
 * Item selector.
 */
const TEMPLATES = {
  product: [],
  partner: [],
  region: [{name: 'All', id: '$all$'}, {name: 'None (National)', id: '$none$'}],
  kind: [{name: 'Total', id: 'total'}, {name: 'Import', id: 'import'}, {name: 'Export', id: 'export'}],
  sourceType: [],
  dateMin: [],
  dateMax: []
};

const PLACEHOLDERS = {
  product: 'Product...',
  partner: 'Partner...',
  region: 'Customs region...',
  kind: 'Import/Export...',
  sourceType: 'Source type...',
  dateMin: 'Date min...',
  dateMax: 'Date max...',
  columns: 'Columns...'
};

const MAX_LIST_SIZE = 200;

export class ItemSelector extends Component {

  static propTypes = {
    type: PropTypes.string.isRequired,
    selected: PropTypes.any
  };

  constructor(props, context) {
    super(props, context);
    const type = props.type;
    this.defaultTriggered = false;

    this.compulsoryOptions = (TEMPLATES[type] || []).map(o => ({...o, special: true}));
  }

  componentDidMount() {
    this.componentWillUpdate(this.props);
  }

  componentWillUpdate(nextProps) {
    const valueKey = this.props.valueKey || DEFAULT_VALUE_KEY;

    // we might have default selection to initialize
    // once we got the props ready we test if we can find the name of the default value

    if (!this.defaultTriggered && nextProps.defaultValue && !nextProps.selected && (nextProps.data || []).length > 0) {
      if (['product', 'partner', 'columns'].indexOf(nextProps.type) !== -1) {
        // products and partner are multiple selectors, let's iterate trough selection
        nextProps.onUpdate(_dataToId(nextProps.defaultValue.map(s => nextProps.data.filter(d => d[valueKey] === s)[0]), valueKey));
      }
      else {
        nextProps.onUpdate(_dataToId(nextProps.data.filter(d => d[valueKey] === nextProps.defaultValue)[0], valueKey));
      }
      this.defaultTriggered = true;
    }
  }

  search(input, callback) {
    let options = this.props.data || [];

    if (input.trim()){
      // TODO: This could be optimized by using lodash's lazy chaining
      options = options
      .filter(function(group) {
        input = input.toLowerCase();
        const name = group.name.toLowerCase();
        return !!~name.search(input);
      });
    }
    if (options && options.length > MAX_LIST_SIZE) {
      options = options
        .slice(0, MAX_LIST_SIZE)
        .concat([{id: '$warning$', disabled: true, name: 'Too many results to display. Try refining your query...'}]);
    }

    return callback(null, {options});
  }

  renderOption(o) {
    return (
      <div title={o.name} className={cls('option', {special: o.special})}>
        <strong>{o.name}</strong>
      </div>
    );
  }

  render() {
    const {
      data = [],
      valueKey = DEFAULT_VALUE_KEY,
      disabled,
      loading,
      onChange,
      onUpdate,
      selected,
      type
    } = this.props;

    const trulyDisabled = disabled || loading;
    const allData = this.compulsoryOptions.concat(data);

    const commonProps = {
      className: 'selector',
      isLoading: loading,
      disabled: trulyDisabled,
      labelKey: 'name',
      value: _idToData(selected || !trulyDisabled && this.compulsoryOptions[0], allData, valueKey, type),
      onChange: onChange && (v => onChange(_dataToId(v, valueKey))),
      onUpdate: onUpdate && (v => onUpdate(_dataToId(v, valueKey))),
      placeholder: PLACEHOLDERS[type],
      optionRenderer: this.renderOption,
      valueRenderer: this.renderOption,
      valueKey
    };
    if(type=='columns') commonProps.multi=true;
    if (type !== 'product' && type !== 'partner')
      return <Select {...commonProps} options={this.compulsoryOptions.concat(data)} />;
    return (
      <AsyncCreatable
        {...commonProps}
        loadOptions={debounce(this.search.bind(this), 300)}
        filterOption={identity}
        ignoreAccents={false}
        cache={false}
        isValidNewOption={() => true}
        multi
        joinValues
        delimiter="##"
        promptTextCreator={(label) => label}
        newOptionCreator={p => getValueFromString(p.label, type, valueKey)} />
    );
  }
}

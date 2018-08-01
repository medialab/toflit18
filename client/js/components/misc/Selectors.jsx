/**
 * TOFLIT18 Selectors Component
 * =============================
 *
 * Series of various selectors used throughout the app.
 */
import React, {Component, PropTypes} from 'react';
import Select, {AsyncCreatable, Creatable} from 'react-select';
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

  componentWillUpdate(nextProps, nextState){
    // we might have default selection to initialize
    // test if we have new data
   if (this.props.defaultValue && !this.props.selected && nextProps.data.length > 0){
      nextProps.onUpdate(nextProps.data.filter(d => d.name === this.props.defaultValue)[0])
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
        onUpdate={this.props.onUpdate}
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

  componentWillUpdate(nextProps, nextState){
    // we might have default selection to initialize
    // once we got the props ready we test if we can find the name of the default value
    //console.log(nextProps.data, nextProps.defaultValue)
    if (nextProps.defaultValue && !nextProps.selected && nextProps.data.length > 0){
        if (['product', 'country'].indexOf(nextProps.type) != -1 ) {
          // products and country are multiple selectors, let's iterate trough selection
          nextProps.onUpdate(nextProps.defaultValue.map(s => nextProps.data.filter(d => d.name === s)[0]))
        }
        else {
          nextProps.onUpdate(nextProps.data.filter(d => d.name === nextProps.defaultValue)[0])
        }
      }    
  }

  componentDidMount(){
    // we might have default selection to initialize
    // once we got the props ready we test if we can find the name of the default value
    if (this.props.defaultValue && !this.props.selected && this.props.data.length > 0){
        if (['product', 'country'].indexOf(this.props.type) != -1 ) {
          // products and country are multiple selectors, let's iterate trough selection
          this.props.onUpdate(this.props.defaultValue.map(s => this.props.data.filter(d => d.name === s)[0]))
        }
        else {
          this.props.onUpdate(this.props.data.filter(d => d.name === this.props.defaultValue)[0])
        }
      }    
  }


  search(input, callback) {
    const warning = {
      id: '$warning$',
      disabled: true,
      name: 'This list contains too many elements. Try searching...'
    };

    let options = []
    
    if (!input.trim())
      options = this.props.data;
    else {
      // TODO: This could be optimized by using lodash's lazy chaining
      options = this.props.data
      .filter(function(group) {
        input = input.toLowerCase();
        const name = group.name.toLowerCase();
        return !!~name.search(input);
      });
    }
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
      onUpdate,
      selected,
      type,
      defaultValue
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
      onUpdate,
      placeholder: PLACEHOLDERS[type],
      optionRenderer: this.renderOption,
      valueRenderer: this.renderOption,
      defaultValue
    };

    if (type!='product' && type != 'country')
      return <Select {...commonProps} options={this.compulsoryOptions.concat(data)} />;

    return (
      <AsyncCreatable
        {...commonProps}
        loadOptions={debounce(this.search.bind(this), 300)}
        filterOption={identity}
        ignoreAccents={false}
        cache={false}
        isValidNewOption={() => true}
        multi={true}
        joinValues={true}
        deliminter="##"
        promptTextCreator={(label) => label}
        newOptionCreator={(p) => { return {value:p.label, name:`${type} matching '${p.label}'`, id:-1}}} 
        />
    );
  }
}

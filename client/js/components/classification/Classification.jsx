/* eslint no-nested-ternary: 0 */
/**
 * TOFLIT18 Client Classification Browser
 * =======================================
 *
 * Displaying the existing classifications..
 */
import {compact} from 'lodash';
import Select from 'react-select';
import React, {Component} from 'react';
import {branch} from 'baobab-react/decorators';
import {exportCSV} from '../../lib/exports';
import Icon from '../misc/Icon.jsx';
import VizLayout from '../misc/VizLayout.jsx';
import {ClassificationSelector, ItemSelector} from '../misc/Selectors.jsx';

import specs from '../../../specs.json';

// Actions
import {
  search,
  select,
  selectParent,
  expandGroup,
  updateSelector,
  setState,
  checkFootprint,
} from '../../actions/classification';

const defaultSelectors = require('../../../config/defaultVizSelectors.json');

const ClassificationWell = ({description, groupsCount, itemsCount, unclassifiedItemsCount, completion}) => (
  <div className="well">
    <p>{description}</p>
    <p>{`${groupsCount} groups for ${itemsCount} items.`}</p>
    <p>
      <small>{`${itemsCount -
        unclassifiedItemsCount} / ${itemsCount} (-${unclassifiedItemsCount}) classified items (${completion} %)`}</small>
    </p>
  </div>
);

/**
 * Main component.
 */
@branch({
  actions: {
    search,
    select,
    selectParent,
    expandGroup,
    updateSelector,
    setState,
    checkFootprint,
  },
  cursors: {
    rows: ['classificationsState', 'rows'],
    kind: ['classificationsState', 'kind'],
    loading: ['classificationsState', 'loading'],
    orderBy: ['classificationsState', 'orderBy'],
    selected: ['classificationsState', 'selected'],
    selectedParent: ['classificationsState', 'selectedParent'],
    fullSelected: ['classificationsState', 'fullSelected'],
    fullSelectedParent: ['classificationsState', 'fullSelectedParent'],
    queryItem: ['classificationsState', 'queryItem'],
    queryGroup: ['classificationsState', 'queryGroup'],
    classifications: ['data', 'classifications', 'flat'],
    classificationsIndex: ['data', 'classifications', 'index'],
  },
})
export default class Classification extends Component {
  componentDidMount() {
    // Check inital state:
    const {kind, selected} = this.props;

    // Handle default state:
    if (!kind && !selected) {
      this.props.actions.setState(defaultSelectors.classifications);
    }
    // Handle initial rendering:
    else {
      this.submit();
    }
  }

  componentDidUpdate() {
    this.props.actions.checkFootprint();
  }

  handleScroll() {
    const end = this.refs.lastRow;
    const list = this.refs.list;

    if (end && list.scrollTop + list.offsetHeight > end.offsetTop) {
      this.props.actions.search(true);
    }
  }

  submit() {
    if (this.props.selected) this.props.actions.search();
  }

  expandGroup(groupId, itemsFrom) {
    this.props.actions.expandGroup(groupId, this.props.queryGroup, itemsFrom);
  }

  exportCsv() {
    const arrayDataLines = this.props.rows.flatMap(row => {
      return row.items.map(item => {
        return {
          group: row.name,
          nbItems: row.nbItems,
          nbMatchedItems: row.nbMatchedItems || row.nbItems,
          item: item.name,
          matched: item.matched !== undefined ? item.matched : true,
        };
      });

      obj[this.props.selected] = row.name;
      obj.nbItems = row.nbItems;
      obj[this.props.selectedParent] = row.item.map(e => e.name).join(', ');
    });

    const now = new Date();
    exportCSV({
      data: arrayDataLines,
      name: `TOFLIT18_classification_${this.props.selected}_${this.props.queryGroup}_${this.props.selectedParent}_${this.props.queryItem}.csv`,
    });
  }

  render() {
    const {
      rows,
      kind,
      actions,
      orderBy,
      selected,
      selectedParent,
      fullSelected,
      fullSelectedParent,
      queryItem,
      queryGroup,
      classifications,
      classificationsIndex,
    } = this.props;

    const parents = [];
    let tmp = fullSelected;
    while (tmp && tmp.parent) {
      tmp = classificationsIndex[tmp.parent];
      parents.unshift(tmp);
    }

    return (
      <VizLayout
        title="Classifications"
        description="Select a type of data (locations or products) and check the content of each classification. If you spot an error or want to create another classification, please send an email to guillaume.daudin@dauphine.psl.eu"
        leftPanelName="Filters"
        rightPanelName="Caption">
        {/* Top of the left panel */}
        <div className="box-selection box-selection-lg">
          <h2 className="hidden-xs">
            <span className="hidden-sm hidden-md">The type of </span>
            <span>data</span>
          </h2>
          <div className="form-group">
            <label htmlFor="classifications" className="control-label sr-only">
              Type of data
            </label>
            <ItemSelector
              valueKey="value"
              selected={kind}
              type="dataModel"
              data={specs.classificationSelectors}
              onChange={val => {
                actions.select(null);
                actions.updateSelector('kind', val);
              }}
            />
          </div>
        </div>

        {/* Left panel */}
        <div className="aside-filters">
          <form onSubmit={e => e.preventDefault()}>
            {!!kind && (
              <div className="form-group">
                <label htmlFor="classifications" className="control-label">
                  Classifications
                </label>
                <small className="help-block">
                  Choose a classification and search its group names{' '}
                  <a href="#/glossary/concepts">
                    <Icon name="icon-info" />
                  </a>
                </small>
                <ClassificationSelector
                  valueKey="id"
                  type={kind}
                  loading={!classifications[kind]}
                  data={(classifications[kind] || []).filter(o => !!o.parent)}
                  onChange={id => actions.select(id)}
                  selected={selected}
                />
              </div>
            )}
            {!!fullSelected && <ClassificationWell {...fullSelected} />}

            {!!parents.length && (
              <div className="form-group">
                <label htmlFor="classifications" className="control-label">
                  Classifications parent
                </label>
                <small className="help-block">
                  Choose a parent classification and explore its item names{' '}
                  <a href="#/glossary/concepts">
                    <Icon name="icon-info" />
                  </a>
                </small>
                <ClassificationSelector
                  valueKey="id"
                  type={kind}
                  loading={false}
                  clearable={false}
                  data={parents}
                  onChange={id => actions.selectParent(id, true)}
                  selected={selectedParent}
                />
              </div>
            )}
            {!!fullSelectedParent && <ClassificationWell {...fullSelectedParent} />}
          </form>
        </div>

        {/* Content panel */}
        <div className="col-xs-12 col-sm-6 col-md-8">
          <div className="row">
            {!!fullSelected && (
              <div className="col-sm-6">
                <div>
                  <legend className="text-center">{fullSelected.name}</legend>
                  <div className="row">
                    <div className="col-sm-6 col-lg-6">
                      <form className="form-group" onSubmit={e => {
                        actions.updateSelector('queryGroup', this.refs.queryGroup.value || null);
                        e.preventDefault();
                      }}>
                        <label className="sr-only" htmlFor="search-simplification">
                          Search
                        </label>
                        <div className="input-group">
                          <input
                            ref="queryGroup"
                            type="text"
                            className="form-control"
                            id="search-simplification"
                            placeholder="Search"
                            defaultValue={queryGroup || ''}
                            style={{borderColor: '#d9d9d9'}}
                          />
                          <div className="input-group-btn">
                            <button
                              className="btn btn-default btn-search"
                              type="submit"
                              onClick={() => this.submit()}
                              style={{borderColor: '#d9d9d9'}}>
                              <Icon name="icon-search-lg" />
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                    <div className="col-sm-6 col-lg-6">
                      <div className="form-group">
                        <Select
                          name="orderBy"
                          clearable={false}
                          searchable={false}
                          options={compact([
                            {
                              value: 'size',
                              label: 'Order by number of items',
                            },
                            {
                              value: 'name',
                              label: 'Order by name',
                            },
                            !!queryItem && {
                              value: 'nbMatches',
                              label: 'Order with matching items first',
                            },
                          ])}
                          defaultValue="size"
                          value={orderBy}
                          onChange={({value}) => {
                            actions.updateSelector('orderBy', value);
                            this.submit();
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!!fullSelectedParent && (
              <div className="col-sm-6">
                <div>
                  <legend className="text-center">{fullSelectedParent.name}</legend>
                  <div className="row">
                    <div className="col-sm-12 col-lg-8 col-lg-offset-2">
                      <form className="form-group" onSubmit={e => {
                        actions.updateSelector('queryItem', this.refs.queryItem.value || null);
                        e.preventDefault();
                      }}>
                        <label className="sr-only" htmlFor="search-source">
                          Search
                        </label>
                        <div className="input-group">
                          <input
                            ref="queryItem"
                            type="text"
                            className="form-control"
                            id="search-source"
                            placeholder="Search"
                            defaultValue={queryItem || ''}
                            style={{borderColor: '#d9d9d9'}}
                          />
                          <div className="input-group-btn">
                            <button
                              className="btn btn-default btn-search"
                              type="submit"
                              onClick={() => this.submit()}
                              style={{borderColor: '#d9d9d9'}}>
                              <Icon name="icon-search-lg" />
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="group-list-container">
              <div ref="list" className="col-sm-12" onScroll={() => this.handleScroll()}>
                <div className="row">
                  {(rows || []).map((row, i, a) => (
                    <div key={row.id} ref={i === a.length - 1 ? 'lastRow' : undefined} className="group-list">
                      <div className="col-sm-6">
                        <div className="group-list-title well" style={{display: 'block'}}>
                          <h4>{row.name}</h4>
                          <div>
                            {compact([
                              `${row.nbItems} item${row.nbItems > 1 ? 's' : ''}`,
                              typeof row.nbMatchedItems === 'number' &&
                                `(${row.nbMatchedItems} matching item${row.nbMatchedItems > 1 ? 's' : ''})`,
                            ]).join(' ')}
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="group-list-items well">
                          <ul className="list-customs">
                            {(row.items || []).map(item => (
                              <li key={item.name}>
                                {queryItem && item.matched ? (
                                  <strong>
                                    <em>{item.name}</em>
                                  </strong>
                                ) : (
                                  <em>{item.name}</em>
                                )}
                              </li>
                            ))}
                            {row.items.length < row.nbItems && (
                              <li className="no-bullet">
                                <button
                                  className="btn btn-default btn-xs btn-icon"
                                  type="submit"
                                  onClick={() => {
                                    this.expandGroup(row.id, row.items.length);
                                  }}>
                                  <Icon name="icon-zoom-in" />
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="aside-legend">
          <p>
            Each classification relates "items" (products or locations present in the sources or the parent
            classification) to a smaller number of "groups". The information on each classification are: the number of
            groups, the number of classified items, the number of items that could be classified, and the share of
            classified items
          </p>
          <div className="form-group-fixed form-group-fixed-right">
            <button
              type="submit"
              className="btn btn-default"
              onClick={() => {
                this.exportCsv();
              }}>
              Export
            </button>
          </div>
        </div>
      </VizLayout>
    );
  }
}

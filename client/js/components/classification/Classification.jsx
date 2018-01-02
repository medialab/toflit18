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
  updateSelector
} from '../../actions/classification';

const ClassificationWell = ({groupsCount, itemsCount, unclassifiedItemsCount, completion}) => (
  <div className="well">
    <p><strong>{
      `${groupsCount} groups for ${itemsCount} items.`
    }</strong></p>
    <p><small>{
      `${itemsCount - unclassifiedItemsCount} / ${itemsCount} (-${unclassifiedItemsCount}) classified items (${completion} %)`
    }</small></p>
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
    updateSelector
  },
  cursors: {
    rows: ['states', 'classification', 'browser', 'rows'],
    kind: ['states', 'classification', 'browser', 'kind'],
    loading: ['states', 'classification', 'browser', 'loading'],
    orderBy: ['states', 'classification', 'browser', 'orderBy'],
    current: ['states', 'classification', 'browser', 'current'],
    currentParent: ['states', 'classification', 'browser', 'currentParent'],
    queryItem: ['states', 'classification', 'browser', 'queryItem'],
    queryGroup: ['states', 'classification', 'browser', 'queryGroup'],
    classifications: ['data', 'classifications', 'flat'],
    classificationsIndex: ['data', 'classifications', 'index']
  }
})
export default class Classification extends Component {
  componentDidMount() {
    this.handleScroll();
  }


  handleScroll() {
    const end = this.refs.lastRow;
    const list = this.refs.list;

    if (end && list.scrollTop + list.offsetHeight > end.offsetTop) {
      this.props.actions.search(true);
    }
  }

  submit() {
    const {current} = this.props;

    if (current)
      this.props.actions.search();
  }

  expandGroup(groupId, itemsFrom) {
    this.props.actions.expandGroup(
      groupId,
      this.refs.queryGroup.value,
      itemsFrom
    );
  }

  render() {
    const {
      rows,
      kind,
      actions,
      orderBy,
      current,
      currentParent,
      queryItem,
      queryGroup,
      classifications,
      classificationsIndex,
    } = this.props;

    const parents = [];
    let tmp = current;
    while (tmp && tmp.parent) {
      tmp = classificationsIndex[tmp.parent];
      parents.unshift(tmp);
    }

    return (
      <VizLayout
        title="Classifications"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean efficitur erat a sem semper venenatis. Mauris facilisis at velit quis fermentum. Fusce non ante dignissim, luctus magna sed, posuere ex. Fusce ullamcorper libero sit amet metus lacinia semper."
        leftPanelName="Filters"
        rightPanelName="Caption" >
        { /* Top of the left panel */ }
        <div className="box-selection box-selection-lg">
          <h2 className="hidden-xs"><span className="hidden-sm hidden-md">The type of </span><span>data</span></h2>
          <div className="form-group">
            <label htmlFor="classifications" className="control-label sr-only">Type of data</label>
            <ItemSelector
              selected={kind}
              type="dataModel"
              data={specs.classificationSelectors}
              onChange={val => {
                actions.select(null);
                actions.updateSelector('kind', val);
              }} />
          </div>
        </div>

        { /* Left panel */ }
        <div className="aside-filters">
          <form>
            {
              !!kind &&
                <div className="form-group">
                  <label
                    htmlFor="classifications"
                    className="control-label">
                    Classifications
                  </label>
                  <small className="help-block">Lorem ipsum....</small>
                  <ClassificationSelector
                    type={kind.value}
                    loading={!classifications[kind.value]}
                    data={classifications[kind.value]}
                    onChange={o => actions.select(o ? o.id : null)}
                    selected={current} />
                </div>
            }
            { !!current && <ClassificationWell {...current} /> }

            {
              !!parents.length &&
                <div className="form-group">
                  <label
                    htmlFor="classifications"
                    className="control-label">
                    Classifications parent
                  </label>
                  <small className="help-block">Lorem ipsum....</small>
                  <ClassificationSelector
                    type={kind.value}
                    loading={false}
                    data={parents}
                    onChange={o => actions.selectParent(o ? o.id : null, true)}
                    selected={currentParent} />
                </div>
            }
            { !!currentParent && <ClassificationWell {...currentParent} /> }
          </form>
        </div>

        { /* Content panel */ }
        <div className="col-xs-12 col-sm-6 col-md-8">
          <div className="row">
            <div className="col-sm-6">
              <form>
                <legend className="text-center">Simplification</legend>
                <div className="row">
                  <div className="col-sm-6 col-lg-6">
                    <div className="form-group">
                      <label
                        className="sr-only"
                        htmlFor="search-simplification">
                        Search
                      </label>
                      <div className="input-group">
                        <input
                          ref="queryGroup"
                          type="text"
                          className="form-control"
                          id="search-simplification"
                          placeholder="Search"
                          value={queryGroup || ''}
                          onChange={e => actions.updateSelector('queryGroup', e.target.value)} />
                        <div className="input-group-btn">
                          <button
                            className="btn btn-default btn-search"
                            type="submit"
                            onClick={() => this.submit()}>
                            <Icon name="icon-search-lg" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-6">
                    <div className="form-group">
                      <Select
                        name="edgeSize"
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
                          }
                        ])}
                        value={orderBy}
                        onChange={({value}) => {
                          actions.updateSelector('orderBy', value);
                          this.submit();
                        }} />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="col-sm-6">
              <form>
                <legend className="text-center">Source / <small>Orthographic Normalization</small></legend>
                <div className="row">
                  <div className="col-sm-12 col-lg-8 col-lg-offset-2">
                    <div className="form-group">
                      <label
                        className="sr-only"
                        htmlFor="search-source">
                        Search
                      </label>
                      <div className="input-group">
                        <input
                          ref="queryItem"
                          type="text"
                          className="form-control"
                          id="search-source"
                          placeholder="Search"
                          value={queryItem || ''}
                          onChange={e => actions.updateSelector('queryItem', e.target.value)} />
                        <div className="input-group-btn">
                          <button
                            className="btn btn-default btn-search"
                            type="submit"
                            onClick={() => this.submit()}>
                            <Icon name="icon-search-lg" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="group-list-container">
              <div
                ref="list"
                className="col-sm-12"
                onScroll={() => this.handleScroll()}>
                <div className="row">{
                  (rows || []).map((row, i, a) => (
                    <div
                      key={row.id}
                      ref={i === a.length - 1 ? 'lastRow' : undefined}
                      className="group-list">
                      <div className="col-sm-6">
                        <div className="group-list-title well">
                          <h4>{row.name}</h4>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="group-list-items well">
                          <ul className="list-customs">
                            {
                              (row.items || []).map(item => (
                                <li key={item.name}>{
                                  (queryItem && item.matched) ?
                                    <strong><em>{item.name}</em></strong> :
                                    <em>{item.name}</em>
                                }</li>
                              ))
                            }
                            {
                              row.items.length < row.nbItems &&
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
                            }
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))
                }</div>
              </div>
            </div>
          </div>
        </div>

        { /* Right panel */ }
        <div className="aside-legend">
          <p>Lorem ipsum is a pseudo-Latin text used in web design, typography, layout, and printing in place of English to emphasise design elements over content. It's also called placeholder (or filler) text. It's a convenient tool for mock-ups.</p>
          <div className="form-group-fixed form-group-fixed-right">
            <button
              type="submit"
              className="btn btn-default">
              Export
            </button>
          </div>
        </div>
      </VizLayout>

    );
  }
}


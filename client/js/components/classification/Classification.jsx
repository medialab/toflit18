/* eslint no-nested-ternary: 0 */
/**
 * TOFLIT18 Client Classification Browser
 * =======================================
 *
 * Displaying the existing classifications..
 */
import React, {Component} from 'react';
import cls from 'classnames';
import {branch} from 'baobab-react/decorators';

import Icon from '../misc/Icon.jsx';
import {Waiter} from '../misc/Loaders.jsx';
import Infinite from '../misc/Infinite.jsx';
import VizLayout from '../misc/VizLayout.jsx';
import {prettyPrint} from '../../lib/helpers';
import {ClassificationSelector, ItemSelector} from '../misc/Selectors.jsx';

import specs from '../../../specs.json';

// Actions
import {
  select,
  selectParent,
  updateSelector
} from '../../actions/classification';
import {linker} from '../../actions/factory';

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
    select,
    selectParent,
    updateSelector
  },
  cursors: {
    downloading: ['ui', 'downloading'],
    kind: ['states', 'classification', 'browser', 'kind'],
    loading: ['states', 'classification', 'browser', 'loading'],
    current: ['states', 'classification', 'browser', 'current'],
    currentParent: ['states', 'classification', 'browser', 'currentParent'],
    queryGroup: ['states', 'classification', 'browser', 'queryGroup'],
    queryItem: ['states', 'classification', 'browser', 'queryItem'],
    classifications: ['data', 'classifications', 'flat'],
    classificationsIndex: ['data', 'classifications', 'index']
  }
})
export default class Classification extends Component {
  render() {
    const {
      kind,
      actions,
      current,
      currentParent,
      downloading,
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
              onChange={val => actions.updateSelector('kind', val)} />
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
                    onChange={o => actions.select(o.id)}
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
                    onChange={o => actions.selectParent(o.id, true)}
                    selected={currentParent} />
                </div>
            }
            { !!currentParent && <ClassificationWell {...currentParent} /> }
            <div className="form-group-fixed">
              <button type="submit" className="btn btn-default">Update</button>
            </div>
          </form>
        </div>

        { /* Content panel */ }
        <div className="col-xs-12 col-sm-6 col-md-8">
          <div className="row">
            <div className="col-sm-6">
              <form>
                <legend className="text-center">Simplification</legend>
                <div className="row">
                  <div className="col-sm-12 col-lg-8 col-lg-offset-2">
                    <div className="form-group">
                      <label
                        className="sr-only"
                        htmlFor="search-simplification">
                        Search
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          id="search-simplification"
                          placeholder="Search" />
                        <div className="input-group-btn">
                          <button
                            className="btn btn-default btn-search"
                            type="submit">
                            <Icon name="icon-search-lg" />
                          </button>
                        </div>
                      </div>
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
                          type="text"
                          className="form-control"
                          id="search-source"
                          placeholder="Search" />
                        <div className="input-group-btn">
                          <button
                            className="btn btn-default btn-search"
                            type="submit">
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
              <div className="col-sm-12">
                <div className="row">
                  <div className="group-list">
                    <div className="col-sm-6">
                      <div className="group-list-title well">
                        <h4>abassis</h4>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="group-list-items well">
                        <ul className="list-customs">
                          <li><em>Abacir</em></li>
                          <li><em>Abafine</em></li>
                          <li><em>Abassis</em></li>
                          <li><em>abassis</em></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="group-list">
                    <div className="col-sm-6">
                      <div className="group-list-title well">
                        <h4>abats</h4>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="group-list-items well">
                        <ul className="list-customs">
                          <li><em>abats</em></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="group-list">
                    <div className="col-sm-6">
                      <div className="group-list-title well">
                        <h4>abattis de morue</h4>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="group-list-items well">
                        <ul className="list-customs">
                          <li><em>Abbatis de morue</em></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="group-list">
                    <div className="col-sm-6">
                      <div className="group-list-title well">
                        <h4>abricots confits</h4>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="group-list-items well">
                        <ul className="list-customs">
                          <li><em>Abricots confits</em></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="group-list">
                    <div className="col-sm-6">
                      <div className="group-list-title well">
                        <h4>acacia</h4>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="group-list-items well">
                        <ul className="list-customs">
                          <li><em>Acacia</em></li>
                          <li><em>Accacia</em></li>
                          <li><em>Agacia</em></li>
                          <li><em>acacia</em></li>
                          <li className="no-bullet">
                            <button
                              className="btn btn-default btn-xs btn-icon"
                              type="submit">
                              <Icon name="icon-zoom-in" />
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
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


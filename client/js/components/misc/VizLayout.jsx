/**
 * TOFLIT18 Client Three Columns Layout
 * ====================================
 *
 */
import React, {Component} from 'react';
import cls from 'classnames';
import Icon from '../misc/Icon.jsx';

export default class Header extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {deployedPanel: null};
    this.togglePanel = this.togglePanel.bind(this);
  }

  togglePanel(panel) {
    if (this.state.deployedPanel === panel)
      this.setState({deployedPanel: null});
    else
      this.setState({deployedPanel: panel});
  }

  render() {
    const {
      title,
      description,
      leftPanelName,
      rightPanelName,
      children = []
    } = this.props;

    const {
      deployedPanel
    } = this.state;

    return (
      <main className="container-fluid no-padding">
        <div className="section-heading">
          <div className="text-heading">
            <div className="row">
              <div className="col-sm-4 col-md-3">
                <h1>{title}</h1>
              </div>
              <div className="col-sm-8 col-md-5">
                <p className="hidden-xs">{description}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="section-viz">
          {children[0]}
          <div className="container-fluid">
            <div
              className={
                cls(
                  'row',
                  'row-offcanvas',
                  'row-offcanvas-left',
                  deployedPanel === 'left' && 'active'
                )
              }>
              <div
                className={
                  cls(
                    'row-offcanvas',
                    'row-offcanvas-right',
                    deployedPanel === 'right' && 'active'
                  )
                }>
                <aside
                  className="col-xs-6 col-sm-3 col-md-2 sidebar-offcanvas aside-left"
                  id="sidebarLeft" >
                  {children[1]}
                </aside>
                <div className="content-viz">
                  <button
                    type="button"
                    className="aside-btn-left"
                    onClick={() => this.togglePanel('left')} >
                    <span>{leftPanelName}</span>
                    <Icon name="icon-close" />
                  </button>
                  <button
                    type="button"
                    className="aside-btn-right"
                    onClick={() => this.togglePanel('right')} >
                    <span>{rightPanelName}</span>
                    <Icon name="icon-close" />
                  </button>
                  {children[2]}
                </div>
                <aside
                  className="col-xs-6 col-sm-3 col-md-2 sidebar-offcanvas aside-right"
                  id="sidebarRight" >
                  {children[3]}
                </aside>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

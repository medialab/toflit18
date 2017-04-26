/**
 * TOFLIT18 Client Application Component
 * ======================================
 *
 * Root component for the application.
 */
import React, {Component} from 'react';
import SideNav from './SideNav.jsx';
import NavBar from './NavBar.jsx';

export default class App extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      sidenavOpened: false
    };

    this.openSidenav = this.openSidenav.bind(this);
    this.toggleSidenav = this.toggleSidenav.bind(this);
    this.closeSidenav = this.closeSidenav.bind(this);
  }

  openSidenav() {
    this.setState({sidenavOpened: true});
  }

  toggleSidenav() {
    this.setState({sidenavOpened: !this.state.sidenavOpened});
  }

  closeSidenav() {
    this.setState({sidenavOpened: false});
  }

  render() {
    return (
      <div id="main">
        <NavBar
          onMenu={this.toggleSidenav}
          sidenavOpened={this.state.sidenavOpened} />
        <SideNav
          opened={this.state.sidenavOpened}
          onClose={this.closeSidenav} />
        <main className="container">
          {this.props.children}
        </main>
      </div>
    );
  }
}

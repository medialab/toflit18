/**
 * TOFLIT18 Client Login Component
 * ================================
 *
 * Displayed when user authentication is required to continue.
 */
import React, {Component} from 'react';

export default class Login extends Component {
  render() {
    return (
      <div className="full-height">
        <div className="screen-third section">
          <div className="container">
            <div className="row">
              <div className="col s12">
              </div>
            </div>
          </div>
        </div>

        <div className="container login-card">
          <div className="row">
            <div className="col s8 offset-s2 z-depth-2">
              <div className="container">
                <h3>Login</h3>
                <div className="row">
                  <div className="input-field col s12">
                    <input id="name" type="text" className="validate" />
                    <label htmlFor="name">Username</label>
                  </div>
                </div>
                <div className="row">
                  <div className="input-field col s12">
                    <input id="password" type="password" className="validate" />
                    <label htmlFor="password">Password</label>
                  </div>
                </div>
                <div className="row">
                  <a className="waves-effect waves-light btn">Login</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * TOFLIT18 Client Login Component
 * ================================
 *
 * Displayed when user authentication is required to continue.
 */
import React, {Component} from 'react';
import {Row, Col} from '../bootstrap/grid.jsx';
import Button from '../bootstrap/button.jsx';

export default class Login extends Component {
  render() {
    return (
      <div className="login-container">
        <Row>
          <Col md={2} />
          <Col md={8}>
            <div className="login-card">
              <h2>Login</h2>
              <hr />
              <fieldset className="form-group">
                <label htmlFor="name">Username</label>
                <input type="text" className="form-control" id="name" placeholder="..." autoFocus />
              </fieldset>
              <fieldset className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" className="form-control" id="password" placeholder="..." />
              </fieldset>
              <Button kind="primary">Connect</Button>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

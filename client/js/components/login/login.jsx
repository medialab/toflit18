/**
 * TOFLIT18 Client Login Component
 * ================================
 *
 * Displayed when user authentication is required to continue.
 */
import React, {Component} from 'react';
import {branch} from 'baobab-react/decorators';
import {Row, Col} from '../bootstrap/grid.jsx';
import Button from '../bootstrap/button.jsx';
import {attemptLogin} from '../../actions.js';

/**
 * Panel
 */
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
              <LoginForm />
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

/**
 * Login form
 */
@branch({
  actions: {
    submit: attemptLogin
  }
})
class LoginForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: null,
      password: null
    };
  }

  submit() {
    console.log('Submit!');
    this.props.actions.submit();
  }

  render() {
    return (
      <div>
        <fieldset className="form-group">
          <label htmlFor="name">Username</label>
          <input type="text"
                 className="form-control"
                 id="name"
                 onChange={e => this.setState({username: e.target.value})}
                 value={this.state.username}
                 placeholder="..."
                 autoFocus />
        </fieldset>
        <fieldset className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password"
                 className="form-control"
                 id="password"
                 onChange={e => this.setState({password: e.target.value})}
                 value={this.state.password}
                 placeholder="..." />
        </fieldset>
        <Button kind="primary" onClick={() => this.submit()}>Connect</Button>
      </div>
    );
  }
}

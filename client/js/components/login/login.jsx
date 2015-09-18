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
  },
  cursors: {
    flags: ['flags', 'login']
  }
})
class LoginForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: null,
      password: null
    };
  }

  submit() {
    const {name, password} = this.state;

    if (name && password)
      this.props.actions.submit(name, password);
  }

  render() {
    const {flags} = this.props;

    const keySubmit = (e) => e.which === 13 && this.submit();

    return (
      <div>
        <fieldset className="form-group">
          <label htmlFor="name">name</label>
          <input type="text"
                 className="form-control"
                 id="name"
                 onChange={e => this.setState({name: e.target.value})}
                 value={this.state.name}
                 placeholder="..."
                 onKeyPress={keySubmit}
                 autoFocus />
        </fieldset>
        <fieldset className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password"
                 className="form-control"
                 id="password"
                 onChange={e => this.setState({password: e.target.value})}
                 value={this.state.password}
                 placeholder="..."
                 onKeyPress={keySubmit} />
        </fieldset>
        {flags.failed && <div className="alert alert-danger">Unrecognized name/password combination.</div>}
        <Button loading={flags.loading}
                kind="primary"
                onClick={() => this.submit()}>Connect</Button>
      </div>
    );
  }
}

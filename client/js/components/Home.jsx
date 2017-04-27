/**
 * TOFLIT18 Client Home Component
 * ===============================
 *
 * Content component aiming at presenting the application and showing people
 * its various features.
 */
import React, {Component} from 'react';
import {Link} from 'react-router';

export default class Home extends Component {
  render() {
    return (
      <div id="home">
        <div className="panel">
          <h3>Welcome to the TOFLIT18 Datascape!</h3>
          <hr />
          <p>
            <em>
              Here is a brief description of the various features of the
              datascape you might want to use.
            </em>
            <br />
            <em>
              If you happen to lose yourself, don't hesitate to open the menu using the
              top-left button or to come back to this page by clicking on the
              TOFLIT18 logo just above.
            </em>
          </p>
        </div>
        <div className="panel">
          <h5>
            1.&nbsp;
            <Link to="exploration/meta">
              Metadata about the collected data
            </Link>
          </h5>
          <p>
            <em>
              Learn about the database's structure to understand how the data
              was collected and which traps one should avoid when interpreting
              them.
            </em>
          </p>
        </div>
        <div className="panel">
          <h5>
            2.&nbsp;
            <Link to="classification/browser">
              Classifications browser
            </Link>
          </h5>
          <p>
            <em>
              Source products & target countries were classified using different
              strategies for different analysis purposes.
            </em>
          </p>
          <p>
            <em>
              Learn about them and explore them using the classification browser.
            </em>
          </p>
        </div>
        <div className="panel">
          <h5>
            3.&nbsp;
            <Link to="exploration/indicators">
              Indicators
            </Link>
          </h5>
          <p>
            <em>
              Build & explore time series showing the evolution of trade flows in values
              & quantities using.
            </em>
          </p>
        </div>
        <div className="panel">
          <h5>
            4.&nbsp;
            <Link to="exploration/globals">
              Countries networks
            </Link>
          </h5>
          <p>
            <em>
              Explore networks of countries whither France exported or whence France imported.
            </em>
          </p>
        </div>
        <div className="panel">
          <h5>
            5.&nbsp;
            <Link to="exploration/globalsterms">
              Product terms networks
            </Link>
          </h5>
          <p>
            <em>
              Explore networks of product terms traded by & with France.
            </em>
          </p>
        </div>
      </div>
    );
  }
}

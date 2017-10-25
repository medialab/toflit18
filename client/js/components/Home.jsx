/**
 * TOFLIT18 Client Home Component
 * ===============================
 *
 * Content component aiming at presenting the application and showing people
 * its various features.
 */
import React, {Component} from 'react';
import {Link} from 'react-router';
import Icon from './misc/Icon.jsx';

export default class Home extends Component {
  render() {
    return (
      <main className="container-fluid container-global no-padding">
        <div className="section section-home-top">
          <span className="background-color" />
          <div className="container">
            <div className="row">
              <div className="col-sm-10">
                <h1>Transformations of the French Economy through the Lens of International Trade</h1>
                <p className="lead">1716-1821</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean efficitur erat a sem semper venenatis. Mauris facilisis at velit quis fermentum. Fusce non ante dignissim, luctus magna sed, posuere ex. Fusce ullamcorper libero sit amet metus lacinia semper. Vivamus varius diam enim, ac semper nisl venenatis eget.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="section-home-navigation">
          <div className="container">
            <div className="row">
              <div className="col-sm-12"><h2>Data</h2></div>
              <div className="col-sm-4">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean efficitur erat a sem semper venenatis. Mauris facilisis at velit quis fermentum. Fusce non ante dignissim, luctus magna sed, posuere ex. Fusce ullamcorper libero sit amet metus lacinia semper. Vivamus varius diam enim, ac semper nisl venenatis eget.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean efficitur erat a sem semper venenatis. Mauris facilisis at velit quis fermentum. Fusce non ante dignissim, luctus magna sed, posuere ex.</p>
              </div>
              <div className="col-sm-4">
                <Link
                  to="/exploration/meta"
                  className="btn btn-link" >
                  <figure>
                    <img
                      className="img-responsive"
                      src="./assets/images/metadata.png"
                      alt="Metadata"
                      width="300"
                      height="180" />
                    <figcaption>
                      <Icon name="icon-stack" />
                      <span>Metadata</span>
                    </figcaption>
                  </figure>
                </Link>
              </div>
              <div className="col-sm-4">
                <Link
                  to="/classification/browser"
                  className="btn btn-link" >
                  <figure>
                    <img
                      className="img-responsive"
                      src="./assets/images/classification.png"
                      alt="Classifications"
                      width="300"
                      height="180" />
                    <figcaption>
                      <Icon name="icon-classification" />
                      <span>Classifications</span>
                    </figcaption>
                  </figure>
                </Link>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12"><h2>Explorer</h2></div>
              <div className="col-sm-4">
                <Link
                  to="/exploration/indicators"
                  className="btn btn-link" >
                  <figure>
                    <img
                      className="img-responsive"
                      src="./assets/images/indicators.png"
                      alt="Indicators"
                      width="300"
                      height="180" />
                    <figcaption>
                      <Icon name="icon-curve" />
                      <span>Indicators</span>
                    </figcaption>
                  </figure>
                </Link>
                <p>Sed porta, mi laoreet cursus consectetur, sapien risus commodo turpis, quis vestibulum purus justo in ex.</p>
              </div>
              <div className="col-sm-4">
                <Link
                  to="/exploration/terms"
                  className="btn btn-link" >
                  <figure>
                    <img
                      className="img-responsive"
                      src="./assets/images/products.png"
                      alt="Products"
                      width="300"
                      height="180" />
                    <figcaption>
                      <Icon name="icon-network" />
                      <span>Products</span>
                    </figcaption>
                  </figure>
                </Link>
                <p>Sed porta, mi laoreet cursus consectetur, sapien risus commodo turpis, quis vestibulum purus justo in ex.</p>
              </div>
              <div className="col-sm-4">
                <Link
                  to="/exploration/network"
                  className="btn btn-link" >
                  <figure>
                    <img
                      className="img-responsive"
                      src="./assets/images/countries.png"
                      alt="Countries"
                      width="300"
                      height="180" />
                    <figcaption>
                      <Icon name="icon-network" />
                      <span>Countries</span>
                    </figcaption>
                  </figure>
                </Link>
                <p>Sed porta, mi laoreet cursus consectetur, sapien risus commodo turpis, quis vestibulum purus justo in ex.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="section-bottom">
          <div className="container">
            <div className="row">
              <div className="col-sm-6">
                <h2>How to cite</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean efficitur erat a sem semper venenatis. Mauris facilisis at velit quis fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean efficitur erat a sem semper venenatis. Mauris facilisis at velit quis fermentum. </p>
              </div>
              <div className="col-sm-6">
                <h2>How to science</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean efficitur erat a sem semper venenatis. Mauris facilisis at velit quis fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean efficitur erat a sem semper venenatis. Mauris facilisis at velit quis fermentum. </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

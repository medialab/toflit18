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
      <main className="container-fluid container-global no-padding">
        <div className="section section-home-top">
          <span className="background-color" />
          <div className="container">
            <div className="row">
              <div className="col-sm-10 col-sm-offset-1">
                <h1>TOFLIT18</h1>
                <h1>Transformations of the French Economy through the Lens of International Trade</h1>
                <p className="lead">1716-1821</p>
                <p>TOFLIT18 is a project dedicated to French trade statistics from 1716 to 1821. It combines a historical trade database that covers French external trade comprising more than 500,000 flows at the level of partners and individual products with a range of tools that allow the exploration of the material world of the Early Modern period.</p>
                <p>TOFLIT18 is the result of the collaboration of data scientists, economists and historians. It started as a project funded by the Agence Nationale de la Recherche in 2014. <a href="http://toflit18.hypotheses.org">http://toflit18.hypotheses.org</a></p>
              </div>
            </div>
          </div>
        </div>
        <div className="section-home-navigation">
          <div className="container">
            <div className="row">
              <div className="col-sm-12"><h2>Explore Trade</h2></div>
              <div className="col-sm-4">
                <Link
                  to="/exploration/indicators"
                  className="btn btn-link" >
                  <figure>
                    <img
                      className="img-responsive"
                      src="./assets/images/indicators.png"
                      alt="Time series"
                      width="300"
                      height="180" />
                    <figcaption>
                      <span>Time series</span>
                    </figcaption>
                  </figure>
                </Link>
                <p>Here, you can vizualize the evolutions of particular branches of French trade through time.</p>
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
                      <span>Products</span>
                    </figcaption>
                  </figure>
                </Link>
                <p>Here, you can vizualize lexicographic networks of commodities traded by France.</p>
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
                      <span>Countries</span>
                    </figcaption>
                  </figure>
                </Link>
                <p>Here, you can vizualize geographical networks of French international trade.</p>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12"><h2>Data</h2></div>
              <div className="col-sm-4">
                <Link
                  to="/sources"
                  className="btn btn-link" >
                  <figure>
                    <img
                      className="img-responsive"
                      src="./assets/images/sources.png"
                      alt="Sources"
                      width="300"
                      height="180" />
                    <figcaption>
                      <span>Sources</span>
                    </figcaption>
                  </figure>
                </Link>
                <p>Provides information on the sources and the methods used to create the TOFLIT18 database.</p>
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

                      <span>Metadata</span>
                    </figcaption>
                  </figure>
                </Link>
                <p>Provides visual tools to explore the coverage of the database (years, products, partners, locations...).</p>
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

                      <span>Classifications</span>
                    </figcaption>
                  </figure>
                </Link>
                <p>Provides tools to access and understand the product and partner classifications used in the TOFLIT18 database.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="section-bottom">
          <div className="container">
            <div className="row">
              <div className="col-sm-6">
                <h2>How to cite</h2>
                <p>Loïc Charles, Guillaume Daudin, Guillaume Plique and Paul Girard, TOFLIT18 website (year month day of consultation). Retrieved from http://toflit18.medialab.sciences-po.fr </p>
              </div>
              <div className="col-sm-6">
                <h2>Open Science</h2>
                <p>Tools produced in the TOFLIT18 project are in free access:</p>
                <b>Source code of the exploration tool</b>
                  <p>The source code of this application is available on github under license AGPLv3 <a href="https://github.com/medialab/toflit18">https://github.com/medialab/toflit18</a></p>
                  <b>TOFLIT18 corpus</b>
                  <p>The data you can extract from this webside are under ODbL license. <a href="http://opendatacommons.org/licenses/odbl/1.0/">http://opendatacommons.org/licenses/odbl/1.0/</a></p>
                  <p>To access the full data collected by the project, please contact Guillaume Daudin guillaume.daudin@dauphine.psl.eu</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

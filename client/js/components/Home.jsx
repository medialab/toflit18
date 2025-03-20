/**
 * TOFLIT18 Client Home Component
 * ===============================
 *
 * Content component aiming at presenting the application and showing people
 * its various features.
 */
import React, { Component } from "react";

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
                <p>
                  TOFLIT18 is a project dedicated to French trade statistics from 1716 to 1821. It combines a historical
                  trade database that covers French external trade comprising more than 500,000 flows at the level of
                  partners and individual products with a range of tools that allow the exploration of the material
                  world of the Early Modern period.
                </p>
                <p>
                  TOFLIT18 is the result of the collaboration of data scientists, economists and historians. It started
                  as a project funded by the Agence Nationale de la Recherche in 2014.{" "}
                  <a href="http://toflit18.hypotheses.org">http://toflit18.hypotheses.org</a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="section-home-navigation">
          <div className="container">
            <div className="row">
              <div className="col-sm-12">
                <h2>Explore Trade</h2>
              </div>
              <div className="col-sm-3">
                <a href="#/exploration/indicators" className="btn btn-link">
                  <figure>
                    <img
                      className="img-responsive"
                      src="./assets/images/indicators.png"
                      alt="Time series"
                    />
                    <figcaption>
                      <span>Time series</span>
                    </figcaption>
                  </figure>
                </a>
                <p>Here, you can vizualize the evolutions of particular branches of French trade through time.</p>
              </div>
              <div className="col-sm-3">
                <a href="#/exploration/terms" className="btn btn-link">
                  <figure>
                    <img
                      className="img-responsive"
                      src="./assets/images/products.png"
                      alt="Products"


                    />
                    <figcaption>
                      <span>Products</span>
                    </figcaption>
                  </figure>
                </a>
                <p>Here, you can vizualize lexicographic networks of commodities traded by France.</p>
              </div>
              <div className="col-sm-3">
                <a href="#/exploration/network" className="btn btn-link">
                  <figure>
                    <img
                      className="img-responsive"
                      src="./assets/images/partners.png"
                      alt="Partners"

                    />
                    <figcaption>
                      <span>Partners</span>
                    </figcaption>
                  </figure>
                </a>
                <p>Here, you can vizualize geographical networks of French international trade.</p>
              </div>
              <div className="col-sm-3">
                <a href="#/exploration/flows" className="btn btn-link">
                  <figure>
                    <img
                      className="img-responsive"
                      src="./assets/images/flows.png"
                      alt="Time series"

                    />
                    <figcaption>
                      <span>Trade flows</span>
                    </figcaption>
                  </figure>
                </a>
                <p>Here, you can explore the trade flows as transcribed from the sources.</p>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12">
                <h2>Data</h2>
              </div>
              <div className="col-sm-3">
                <a href="#/sources" className="btn btn-link">
                  <figure>
                    <img
                      className="img-responsive"
                      src="./assets/images/sources.png"
                      alt="Sources"

                    />
                    <figcaption>
                      <span>Sources</span>
                    </figcaption>
                  </figure>
                </a>
                <p>Provides information on the sources and the methods used to create the TOFLIT18 database.</p>
              </div>
              <div className="col-sm-3">
                <a href="#/exploration/meta" className="btn btn-link">
                  <figure>
                    <img
                      className="img-responsive"
                      src="./assets/images/metadata.png"
                      alt="Metadata"

                    />
                    <figcaption>
                      <span>Metadata</span>
                    </figcaption>
                  </figure>
                </a>
                <p>
                  Provides visual tools to explore the coverage of the database (years, products, partners,
                  locations...).
                </p>
              </div>
              <div className="col-sm-3">
                <a href="#/classification/browser" className="btn btn-link">
                  <figure>
                    <img
                      className="img-responsive"
                      src="./assets/images/classification.png"
                      alt="Classifications"

                    />
                    <figcaption>
                      <span>Classifications</span>
                    </figcaption>
                  </figure>
                </a>
                <p>
                  Provides tools to access and understand the product and partner classifications used in the TOFLIT18
                  database.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="section-bottom">
          <div className="container">
            <div className="row">
              <div className="col-sm-6">
                <h2>How to cite</h2>
                  <b>General</b>
                    <p>
                 Loïc Charles, Guillaume Daudin, Paul Girard, Guillaume Plique « Exploring the Transformation of French and European Trade and Economy in the Long Eighteenth Century (1713-1823): the TOFLIT18 Project », {" "}
                 <i>Historical Methods: A Journal of Quantitative and Interdisciplinary History</i>, 55:4, p. 228-258 (2022) [DOI: 10.1080/01615440.2022.2032522]
                    </p>
                  <b>Graphs and screen captures</b>
                   <p>
                  You can re-use graphs or screen captures from the website under the licence CC-BY-SA 4.0.{" "}
                	<a href="https://creativecommons.org/licenses/by-sa/4.0/">https://creativecommons.org/licenses/by-sa/4.0/</a>{" "}
                	Cite: Loïc Charles, Guillaume Daudin, Guillaume Plique and Paul Girard, TOFLIT18 website (insert here the year month day of
                  consultation). Retrieved from: (insert here the permalink of the graph or screen capture).
                   </p>
              </div>
              <div className="col-sm-6">
                <h2>Open Science</h2>
                <p>Tools produced in the TOFLIT18 project are in free access:</p>
                <b>Source code of the exploration tool</b>
                <p>
                  The source code of this application is available on github under license AGPLv3{" "}
                  <a href="https://github.com/medialab/toflit18">https://github.com/medialab/toflit18</a>
                </p>
                <b>TOFLIT18 corpus</b>
                <p>
                  The data you can extract from this webside are under ODbL license.{" "}
                  <a href="http://opendatacommons.org/licenses/odbl/1.0/">
                    http://opendatacommons.org/licenses/odbl/1.0/
                  </a>
                </p>
                <p>
                  The full data collected by the project is available under ODbL license on github {" "}
                	<a href="https://github.com/medialab/toflit18_data">https://github.com/medialab/toflit18_data</a>,
                	and as a Zenodo release. {" "}
                	<a href="https://doi.org/10.5281/zenodo.6573397"><img src="https://zenodo.org/badge/DOI/10.5281/zenodo.6573397.svg" alt="DOI" /></a>.
                <b>Graphs and texts</b>
                  <p>
                  Graphs, texts and screen captures from the site are under the licence CC-BY-SA 4.0.{" "}
                	<a href="https://creativecommons.org/licenses/by-sa/4.0/">https://creativecommons.org/licenses/by-sa/4.0/</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

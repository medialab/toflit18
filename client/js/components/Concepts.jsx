/**
 * TOFLIT18 Client Concepts Component
 * ======================================
 *
 */
import React, { Component } from "react";

export default class Concepts extends Component {
  render() {
    return (
      <main className="container-fluid no-padding">
        <div className="section-heading">
          <div className="text-heading">
            <div className="row">
              <div className="col-sm-4 col-md-3">
                <h1>Concepts</h1>
              </div>
              <div className="col-sm-8 col-md-5">
                <p className="hidden-xs">
                  This glossary explains the specific terminology used in the TOFLIT18 website.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="container content">
          <div className="row">
            <div className="col-sm-10 col-sm-offset-1">
              <h2>Flows</h2>
              <p className="lead">
                A flow is an observation of a trade exchange between France (or a "Customs region") and a partner in a
                specific year for a specific commodity or commodity group.
              </p>
              <p className="hidden-xs">
                Example: In 1764, Nantes exported 1,945,032 livres tournois of sugar to the Nord (2,380,233 kg).
              </p>
            </div>
            <div className="col-sm-10 col-sm-offset-1">
              <h2>Customs region</h2>
              <p className="lead">
                A "Customs region" is a divison of the French geographical space (including colonies) reporting external
                trade.
              </p>
              <p>
                They mostly are "directions des traites". For example the "Nantes" customs region covers all the
                Nantes region.
              </p>
            </div>
            <div className="col-sm-10 col-sm-offset-1">
              <h2>Imports and Exports</h2>
              <p className="lead">
                The terms "Imports" and "Exports" are mostly used from the point of view of Metropolitan France.
                For a quite limited number of  flows, the "Customs region" is not in Metropolitan France
                (e.g. when the "Customs region" is "Colonies Françaises de l'Amérique").
                In that case, the terms "Imports" and "Exports" are used
                from the point of view of the "Customs region".
              </p>
            </div>
            <div className="col-sm-10 col-sm-offset-1">
              <h2>Classifications</h2>
              <p className="lead">
                A "Classification" is a taxonomy of commodities or partners recorded in the database.
              </p>
              <p>
                There are two different types of classifications :
                <ul>
                  <li>
                    <b>Retranscription-based classifications</b> are intended so as to preserve all the information
                    contained in the raw sources.
                    <ul>
                      <li>
                        The <b>source</b> is the list of commodities and partners as transcribed (including
                        transcription errors and variations)
                      </li>
                      <li>
                        The <b>orthographic normalization</b> normalizes the spelling of commodities and partners.{" "}
                        <a href="./assets/doc/ReglesNormalisationOrtho.pdf">The formal rules used it TOFLIT18</a> were
                        designed by Pierre Gervais (who did most of the work)
                      </li>
                      <li>
                        The <b>simplification</b> brings together different names that correspond to the same commodites
                        and geographical areas in the context of the source (e.g. «Poisson hareng» and «hareng» ;
                        Angleterre and Royaume d'Angleterre).
                      </li>
                    </ul>
                  </li>
                  <li>
                    <b>Thematic classifications</b> are taxonomies created by the team and individual researchers for
                    specific purposes: e.g. the SITC classification.{" "}
                    <a href="./assets/doc/Definitions_sitc18_rev3.pdf">
                      The classification rules were designed by Pierre Gervais
                    </a>
                  </li>
                </ul>
              </p>
              <p>The team would gladly welcome new classifications suggestions.</p>
            </div>
            <div className="col-sm-10 col-sm-offset-1">
              <h2>Partners</h2>
              <p className="lead">
                "Partners" are geographical entitites that are trading partners with France or French customs region.
              </p>
              <p>
                Partners are geographical entitites that are trading partners with France or French customs regions. They
                can either be geographical (Le Nord, Guinée, Italie...) or political entities (Espagne et ses
                possessions)... Le Nord designates the Baltic area reached by sea. The same partner can designate
                different geographical areas depending on the time and source. For example, "Le Nord" includes Russia in
                the national sources before 1744 and not after. You can use the metadata view to explore these issues.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

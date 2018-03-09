/**
 * TOFLIT18 Client Concepts Component
 * ======================================
 *
 */
import React, {Component} from 'react';

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
                  This glossary explains the specific terminology used in the
                  TOFLIT18 website.
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
                A flow is an observation of a trade exchange between France (or
                a "Direction") and a partner in a specific year for a specific
                commodity or commodity group.
              </p>
              <p className="hidden-xs">
                Example: In 1764, Nantes exported 1,945,032 livres tournois of
                sugar to the Nord (2,380,233 kg)."
              </p>
            </div>
            <div className="col-sm-10 col-sm-offset-1">
              <h2>Directions</h2>
              <p className="lead">
                A "Direction" is a divison of the French geographical space
                (including colonies) reporting external trade.
              </p>
              <p>
                The name comes from the "directions des fermes". For example the
                "Nantes" direction covers all the Nantes region.
              </p>
            </div>
            <div className="col-sm-10 col-sm-offset-1">
              <h2>Classifications</h2>
              <p className="lead">
                A "Classification" is a taxonomy of commodities or locations
                recorded in the database.
              </p>
              <p>
                There are two different types of classifications :
                <ul>
                  <li>
                    <b>Retranscription-based classifications</b> are intended so
                    as to preserve all the information contained in the raw
                    sources.
                    <ul>
                      <li>
                        The <b>source</b> is the list of commodities and
                        partners as transcribed (including transcription errors
                        and variations)
                      </li>
                      <li>
                        The <b>orthographic normalization</b> normalizes the
                        spelling of commodities and partners. The formal rules
                        used it TOFLIT18 were designed by Pierre Gervais (who
                        did most of the work) METTRE LE LIEN VERS LE MANUEL DE
                        PIERRE GERVAIS SUR LA NORMALISATION ORTHOGRAPHIQUE
                      </li>
                      <li>
                        The <b>simplification</b> brings together different
                        names that correspond to the same commodites and
                        geographical areas in the context of the source (e.g.
                        «Poisson hareng» and «hareng» ; Angleterre and Royaume
                        d'Angleterre).
                      </li>
                    </ul>
                  </li>
                  <li>
                    <b>Thematic classifications</b> are taxonomies created by
                    the team and individual researchers for specific purposes:
                    e.g. the SITC classification. The classification rules were
                    designed by Pierre Gervais METTRE LE MANUEL DE PIERRE
                    GERVAIS SUR SITC
                  </li>
                </ul>
              </p>
              <p>
                The team would gladly welcome new classifications suggestions.
              </p>
            </div>
            <div className="col-sm-10 col-sm-offset-1">
              <h2>Locations</h2>
              <p className="lead">
                "Locations" are geographical entitites that are trading partners
                with France or French directions.
              </p>
              <p>
                Locations are geographical entitites that are trading partners
                with France or French directions. They can either be
                geographical (Le Nord, Guinée, Italie...) or political entities
                (Espagne et ses possessions)... Le Nord designates the Baltic
                area reached by sea. The same location can designate different
                geographical areas depending on the time and source. For
                example, "Le Nord" includes Russia in the national sources
                before 1744 and not after. You can use the metadata view to
                explore these issues.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

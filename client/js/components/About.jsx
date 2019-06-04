/**
 * TOFLIT18 Client About Component
 * ======================================
 *
 */
import React, {Component} from 'react';

export default class About extends Component {
  render() {
    return (
      <main className="container-fluid no-padding">
        <div className="section-heading">
          <div className="text-heading">
            <div className="row">
              <div className="col-sm-4 col-md-3">
                <h1>About</h1>
              </div>
              <div className="col-sm-8 col-md-5">
                <p className="hidden-xs">
                  Various information about the project
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="container content">
          <div className="row">
            <div className="col-sm-10 col-sm-offset-1">
              <h2>User Guide</h2>
              <p className="lead">RTFM</p>
              <p>
                Alas, we could not find the time yet to do an user guide.
                However, you can consult an user guide for the first version of
                the datascape. Many concepts have not changed. https://toflit18.hypotheses.org/695
              </p>
            </div>
            <div className="col-sm-10 col-sm-offset-1">
              <h2>Github</h2>
              <p className="lead">Get inspired or contribute to the project!</p>
              <p>
                Tools produced in the TOFLIT18 project are in free access:
                Source code of the exploration tool The source code of this
                application is available on github under license AGPLv3
                https://github.com/medialab/toflit18.
              </p>
            </div>
            <div className="col-sm-10 col-sm-offset-1">
              <h2>History</h2>
              <p className="lead">Where does the TOFLIT18 project come from?</p>
              <p>
                The TOFLIT18 project is an outgrowth of L. Charles and G.
                Daudin's common interest for French eighteenth century economic
                history and more particulary its external trade. In the late
                2000s they started a systematic survey on sources on French
                eighteenth century trade in order to collect them. In early
                2011, they organized an international conference on European
                external trade statistics. In 2013, after a first try in 2012,
                they obtained a 250,000 € grant from the Agence Nationale de la
                Recherche (ANR) for 2013-2017 period. In 2018, they are looking
                to set up a digital infrastructure gathering similar projects to
                implement best practices on this subject globally.
              </p>
            </div>
            <div className="col-sm-10 col-sm-offset-1">
              <h2>Links and Publications</h2>
              <p className="lead">
                Here we list both links to similar projects and publications
                related to the TOFLIT18 project
              </p>
              <p>
                Similar projects:
                <ul>
                  <li>Irish data: http://duanaire.ie/dbases/trade_ireland</li>
                  <li>
                    Italian data (1862-1950):
                    http://www.bancaditalia.it/statistiche/tematiche/stat-storiche/stat-storiche-microdati/index.html
                  </li>
                  <li>Navigocorpus http://navigocorpus.org</li>
                  <li>
                    Norwegian data (1786-1836)
                    http://toll.lokalhistorie.no/english
                  </li>
                  <li>STRO http://soundtoll.nl</li>
                  <li>RICARDO http://ricardo.medialab.sciences-po.fr</li>
                </ul>
              </p>
              <p>
                Publications:
                <ul>
                  <li>
                    Charles, Loïc, Daudin, Guillaume. « Cross-checking the Sound
                    database with the French Balance du Commerce data », in The
                    Baltic in European maritime history, 1600-1800, sous la dir.
                    de Jan Willem Veluwenkamp et Werner Scheltjens, 2018
                  </li>
                  <li>
                    Charles, Loïc, Daudin, Guillaume (editors)
                    Eighteenth-century international trade statistics, Sources
                    and Methods. special issue of Revue de l’OFCE: Observations
                    et diagnostics économiques (33 contributors), July, n°140,
                    396 p., 2015
                    (http://www.ofce.sciences-po.fr/pdf/revue/140/revue-140.pdf)
                  </li>
                  <li>
                    Charles, Loïc, Daudin, Guillaume. «France, c. 1716- c.1821»
                    with Loïc Charles, Revue de l'OFCE 2015/4 (N° 140)
                  </li>
                  <li>
                    Charles, Loïc, Daudin, Guillaume «La collecte du chiffre au
                    xviiie siècle: Le Bureau de la Balance du Commerce et la
                    production de données sur le commerce extérieur de la
                    France», with Loïc Charles, Revue d’Histoire Moderne et
                    Contemporaine, vol. 58, n°1, p. 128-155, 2011
                    (https://www.cairn.info/revue-d-histoire-moderne-et-contemporaine-2011-1-page-128.htm)
                  </li>
                  <li>
                    Girard, Paul, ,Guillaume, Plique. «Organizing the reversible
                    chain of transformations From trade statistics records to
                    datascapes ». présenté à From Quantitative to Qualitative
                    Analysis: New Perspectives on Research in Social History,
                    Neubauer Collegium for Culture and Society, Chicago, 14
                    octobre 2016. http://medialab.github.io/toflit18/chicago/#/.
                  </li>
                </ul>
              </p>
            </div>
            <div className="col-sm-10 col-sm-offset-1">
              <h2>Credits</h2>
              <p className="lead">
                We are deeply grateful to the numerous people who contributed to
                this project
              </p>
              <p>
                <b>Project leader:</b>
                Daudin, Guillaume
              </p>
              <p>
                <b>Work package leaders:</b>
                <ul>
                  <li>Charles, Loïc</li>
                  <li>Gervais, Pierre</li>
                  <li>Girard, Paul</li>
                </ul>
              </p>
              <p>
                <b>Developers and designers</b>
                <ul>
                  <li>Jacomy, Alexis</li>
                  <li>Plique, Guillaume</li>
                  <li>Ricci, Donato</li>
                  <li>Tible, Gregory</li>
                </ul>
              </p>
              <p>
                <b>Data managers:</b>
                <ul>
                  <li>Aubourg, Alexandre</li>
                  <li>D’Onofrio, Federico</li>
                  <li>Hervelin, Jérémy</li>
                  <li>Hollegien, Pierre</li>
                  <li>Loise, Matthias</li>
                  <li>Mouton, Cyril</li>
                  <li>Perret, Florence</li>
                  <li>Ponton, Corentin</li>
                  <li>Stricot, Maëlle</li>
                  <li>Tirindell,i Elisa Maria</li>
                  <li>Vidal, Quentin</li>
                </ul>
              </p>
              <p>
                <b>Data collectors:</b>
                <ul>
                  <li>Chevret, Paul</li>
                  <li>H., Eszter</li>
                  <li>Hanzaoui, Chaker</li>
                  <li>Konaté, Demba</li>
                  <li>Mai, Saadia</li>
                  <li>Milewski, Sophie</li>
                  <li>Moutou, Laura</li>
                  <li>Nahoudha, Ahmed</li>
                  <li>Omri, Hichem</li>
                  <li>Parungao, Ramillo</li>
                  <li>Rabetafika, Ben</li>
                  <li>Rebours, Anthony</li>
                  <li>Shahban, Muhammed</li>
                  <li>Souchaire, Isabelle</li>
                  <li>Varela, Gabriel</li>
                  <li>Vergne, Isabelle</li>
                  <li>Zahra, Fatima</li>
                </ul>
              </p>
            </div>
            <div className="col-sm-10 col-sm-offset-1">
              <h2>Contacts</h2>
              <p className="lead">Who can you address your queries to?</p>
              <p>
                For history related issues, ask Loïc Charles
                (lcharles02@univ-paris8.fr) and Guillaume Daudin
                (guillaume.daudin@dauphine.psl.eu)
              </p>
              <p>
                For basic guidance in using this website, ask Guillaume Daudin
                (guillaume.daudin@dauphine.psl.eu)
              </p>
              <p>
                For advanced technical issues, ask Paul Girard
                (paul.girard@sciencespo.fr)
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

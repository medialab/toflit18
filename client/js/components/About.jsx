/**
 * TOFLIT18 Client About Component
 * ======================================
 *
 */
import React, { Component } from "react";
import LastCommits from "./misc/LastCommits.jsx";

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
              <div className="col-sm-5 col-md-7">
                <p className="hidden-xs">Various information about the project</p>
              </div>
              <div className="col-sm-3 col-md-2">
              <LastCommits/>
              </div>
            </div>
          </div>
        </div>
        <div className="container content">
          <div className="row">
            <div className="col-sm-10 col-sm-offset-1">
              <h2>User Guide</h2>
              <p>
                Alas, we could not find the time yet to do an user guide. However, you can consult an user guide for the
                first version of the datascape:{" "}
                <a href="https://toflit18.hypotheses.org/695">https://toflit18.hypotheses.org/695</a>. Many concepts
                have not changed.
              </p>
              <p className="lead">Use Regular Expressions</p>
              <p style={{ overflow: "auto" }}>
                <img
                  src="./assets/images/regexp_example.png"
                  style={{ float: "left", marginLeft: "10px" }}
                  height="200px"
                  alt="using '^fil de.*' as a regular expression in Product selection"
                />
                <span>
                  Searching in partner or product list can be enhanced by using Regular Expressions. To learn how to use
                  this query system please read{" "}
                  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions">
                    the JavaScript Regexp specification
                  </a>{" "}
                  and or play with the <a href="https://regex101.com/">Regexp 101 tool</a> with the ECMAScript
                  (JavaScript) flavor.
                  <br />
                  As illustrated in this figure, you could type '^fil de.*' to filter products that begin by 'fil de'.
                </span>
              </p>
              <p className="lead">Permalinks</p>
              <p>
                Each vizualization can be referenced with a permalink. The permalink is updated in the URL bar of your
                web browser seamlessly while using the datascape. All the filters choices made are stored in the
                permalink so that you can share the precise figure you have built. We tried to make permalinks human
                readable. That was not possible for vizualizations that embed many choices (Time Serie notably). If you
                want to learn more on the different parameters used for each vizualization, see the query settings in
                each route in{" "}
                <a href="https://github.com/medialab/toflit18/blob/master/client/js/routing.js">the source code</a>.
              </p>
            </div>
            <div className="col-sm-10 col-sm-offset-1">
              <h2>Github</h2>
              <p className="lead">Get inspired or contribute to the project!</p>
              <p>
                Tools produced in the TOFLIT18 project are in free access and available on github under license AGPLv3
                https://github.com/medialab/toflit18.
              </p>
              <p>
                The data of TOFLIT18 are in free access and available on github under license ODbl
                https://github.com/medialab/toflit18_data.
              </p>
            </div>
            <div className="col-sm-10 col-sm-offset-1">
              <h2>History</h2>
              <p className="lead">Where does the TOFLIT18 project come from?</p>
              <p>
                The TOFLIT18 project is an outgrowth of L. Charles and G. Daudin's common interest for French eighteenth
                century economic history and more particulary its external trade. In the late 2000s they started a
                systematic survey on sources on French eighteenth century trade in order to collect them. In early 2011,
                they organized an international conference on European external trade statistics. In 2013, after a first
                try in 2012, they obtained a 250,000 € grant from the Agence Nationale de la Recherche (ANR) for
                2013-2017 period. In 2018, they are looking to set up a digital infrastructure gathering similar
                projects to implement best practices on this subject globally.
              </p>
            </div>
            <div className="col-sm-10 col-sm-offset-1">
              <h2>Links and Publications</h2>
              <p className="lead">
                Here we list both links to similar projects and publications related to the TOFLIT18 project
              </p>
              <p>
                Similar projects:
                <ul>
                  <li>Irish data: <a href="http://duanaire.ie/dbases/trade_ireland"> http://duanaire.ie/dbases/trade_ireland</a></li>
                  <li>
                    Italian data (1862-1950):
                    <a href="http://www.bancaditalia.it/statistiche/tematiche/stat-storiche/stat-storiche-microdati/index.html"> http://www.bancaditalia.it/statistiche/tematiche/stat-storiche/stat-storiche-microdati/index.html</a>
                  </li>
                  <li>Navigocorpus <a href="http://navigocorpus.org"> http://navigocorpus.org</a></li>
                  <li>Norwegian data (1786-1836) <a href="http://toll.lokalhistorie.no/english"> http://toll.lokalhistorie.no/english</a></li>
                  <li>STRO <a href="http://soundtoll.nl"> http://soundtoll.nl</a></li>
                  <li>RICARDO <a href="http://ricardo.medialab.sciences-po.fr"> http://ricardo.medialab.sciences-po.fr</a></li>
                </ul>
              </p>
              <p>
                Selected publications:
                <ul>
                  <li>Loïc Charles, Guillaume Daudin, Paul Girard, Guillaume Plique « Exploring the Transformation of French and European Trade and 
                	Economy in the Long Eighteenth Century (1713-1823) : the TOFLIT18 Project », 
                	<em>Historical Methods: A Journal of Quantitative and Interdisciplinary History</em> 
                	(2022) <a href="https://doi.org/10.1080/01615440.2022.2032522">DOI: 10.1080/01615440.2022.2032522</a>
                  </li>
                  
                  <li>
                  Marzagalli, Silvia, Asselin, Cécile, Bouju, Alain, Charles, Loïc, Daudin, Guillaume, Geoffroy, Géraldine, 
                  Girard, Paul, Gourlet, Pauline, Mazoyer, Béatrice, de Mourat, Robin, Ooghe-Tabanou, Benjamin, Plique, Guillaume, 
                  Plumejeaud, Christine, Pourchasse, Pierrick, Sauzeau, Thierry, Théro, Héloïse, &amp; 
                  Zoffoli, Maxime. (2021). Commerce multi-échelles autour du port de La Rochelle au XVIIIe siècle (1.0.1). Zenodo. 
                  <a href="https://doi.org/10.5281/zenodo.5717883" title="https://doi.org/10.5281/zenodo.5717883">https://doi.org/10.5281/zenodo.5717883</a>
                  </li>
                  
                  <li>
                  Guillaume Daudin and Edouard Pignède «French Trade in the 18th century: Inflation and Revolution», <em>Dialogue</em>, n°62, Septembre 2021
                  <a https://dial.ird.fr/wp-content/uploads/2021/10/Dialogue_Eng_62_def.pdf>
                  (https://dial.ird.fr/wp-content/uploads/2021/10/Dialogue_Eng_62_def.pdf </a>
                  </li>
                         
                  <li>
                  Guillaume Daudin «Back to TOFLIT18 / TOFLIT18 le retour», <em>Dialogue</em>, n°53, April 2019 
                  <a https://dial.ird.fr/wp-content/uploads/2021/10/Dialogue-53.pdf>
                 https://dial.ird.fr/wp-content/uploads/2021/10/Dialogue-53.pdf</a>
                  </li>
				<li>
				  Alexandre Aubourg, Loïc Charles and Guillaume Daudin «La collecte du chiffre commercial au XVIIIe siècle» with Alexandre Aubourg and Loïc Charles, 
				  <em>Cahiers d’histoire des Douanes et des Droits Indirects</em>, n°59, 2nd semestre 2016
				   <a href="http://asso-ahad.blogspot.fr/2016/08/cahier-numero-59.html" 
				   title="http://asso-ahad.blogspot.fr/2016/08/cahier-numero-59.html">link</a>
				</li>

				<li>
					Guillaume Daudin, Corentin Ponton and Quentin Vidal, «Historical Analysis of France’s Foreign Trade : the TOFLIT18 project» 
					, <em>Dialogue</em>, n°43, July 2016 
					<a href="http://en.dial.ird.fr/content/view/full/241870" title="http://en.dial.ird.fr/content/view/full/241870">link</a>
				</li>

				<li>
					Guillaume Daudin, Corentin Ponton and Quentin Vidal, «Analyse historique du commerce extérieur français : le projet TOFLIT18» 
					with Corentin Ponton et Quentin Vidal, <em>Dialogue</em>, n°43, July 2016 
					<a href="http://en.dial.ird.fr/content/view/full/241870" title="http://en.dial.ird.fr/content/view/full/241870">link</a>
				</li>  
                  <li>
                    Charles, Loïc, Daudin, Guillaume. « Cross-checking the Sound database with the French Balance du
                    Commerce data », in The Baltic in European maritime history, 1600-1800, sous la dir. de Jan Willem
                    Veluwenkamp et Werner Scheltjens, 2018
                  </li>
                  <li>
                    Charles, Loïc, Daudin, Guillaume (editors) Eighteenth-century international trade statistics,
                    Sources and Methods. special issue of Revue de l’OFCE: Observations et diagnostics économiques (33
                    contributors), July, n°140, 396 p., 2015
                    (<a href="http://www.ofce.sciences-po.fr/pdf/revue/140/revue-140.pdf"> http://www.ofce.sciences-po.fr/pdf/revue/140/revue-140.pdf</a>)
                  </li>
                  <li>
                    Charles, Loïc, Daudin, Guillaume. «France, c. 1716- c.1821» with Loïc Charles, Revue de l'OFCE
                    2015/4 (N° 140) <a href="https://doi.org/10.3917/reof.140.0237"> https://doi.org/10.3917/reof.140.0237</a>
                  </li>
                  <li>
                    «La collecte du chiffre au xviiie siècle: Le Bureau de la Balance du Commerce et la production de données sur le commerce extérieur 
                    de la France», with Loïc Charles, <em>Revue d’Histoire Moderne et Contemporaine</em>, vol. 58, n°1, p. 128-155, 2011 
                    <a href="https://doi.org/10.3917/rhmc.581.0128" title="https://doi.org/10.3917/rhmc.581.0128">https://doi.org/10.3917/rhmc.581.0128</a>
                  </li>
                  <li>
                    Girard, Paul and Guillaume, Plique. «Organizing the reversible chain of transformations From trade
                    statistics records to datascapes ». présenté à From Quantitative to Qualitative Analysis: New
                    Perspectives on Research in Social History, Neubauer Collegium for Culture and Society, Chicago, 14
                    octobre 2016. <a href="http://medialab.github.io/toflit18/chicago/#/"> http://medialab.github.io/toflit18/chicago/#/</a> .
                  </li>
                </ul>
              </p>
            </div>
            <div className="col-sm-10 col-sm-offset-1">
              <h2>Credits</h2>
              <p className="lead">We are deeply grateful to the numerous people who contributed to this project</p>
              <p>
                <b>Project leader:</b>
                <ul>
                  <li>Daudin, Guillaume</li>
                </ul>
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
                <b>Developers and designers:</b>
                <ul>
                  <li>Jacomy, Alexis</li>
                  <li>Plique, Guillaume</li>
                  <li>Ricci, Donato</li>
                  <li>Tible, Gregory</li>
                  <li>Simard, Benoît</li>
                </ul>
              </p>
              <p>
                <b>Data managers:</b>
                <ul>
                  <li>Aubourg, Alexandre</li>
                  <li>D’Onofrio, Federico</li>
                  <li>Hervelin, Jérémy</li>
                  <li>Hollegien, Pierre</li>
                  <li>Jackson, Stephen</li>
                  <li>Loise, Matthias</li>
                  <li>Mouton, Cyril</li>
                  <li>Perret, Florence</li>
                  <li>Ponton, Corentin</li>
                  <li>Stricot, Maëlle</li>
                  <li>Tirindelli, Elisa Maria</li>
                  <li>Vidal, Quentin</li>
                </ul>
              </p>
              <p>
                <b>Data contributors:</b>
                <ul>
                  <li>Arnold, Torsten</li>
                  <li>Benbassat, Esther</li>
                  <li>Benyagoub, Karim</li>
                  <li>Cassagnes, David</li>
                  <li>Chagnaud, Paul</li>
                  <li>Chabih, Mohamed</li>
                  <li>Chevret, Paul</li>
                  <li>Duprez, Frédéric</li>
                  <li>El Adel, Hasna</li>
                  <li>Flaux, Romain</li>
                  <li>Fontaine, Pascal</li>
                  <li>Gouttenegre, Pascale</li>
                  <li>H., Eszter</li>
                  <li>Hamzaoui, Chaker</li>
                  <li>Konaté, Demba</li>
                  <li>Mai, Saadia</li>
                  <li>Maneuvrier-Hervieu, Paul</li>
                  <li>Marzagalli, Silvia</li>
                  <li>Medina, Kathleya</li>
                  <li>Milewski, Sophie</li>
                  <li>Moutou, Laura</li>
                  <li>Nahoudha, Ahmed</li>
                  <li>Nannini, Elisabeth</li>
                  <li>Omri, Hichem</li>
                  <li>Parungao, Ramillo</li>
                  <li>Rabetafika, Ben</li>
                  <li>Rebours, Anthony</li>
                  <li>Requia</li>
                  <li>Shahban, Muhammed</li>
                  <li>Sidorowiez, Christophe</li>
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
                For history related issues, ask Loïc Charles (lcharles02@univ-paris8.fr) and Guillaume Daudin
                (guillaume.daudin@dauphine.psl.eu)
              </p>
              <p>For basic guidance in using this website, ask Guillaume Daudin (guillaume.daudin@dauphine.psl.eu)</p>
              <p>For advanced technical issues, ask Paul Girard (paul.girard@ouestware.com)</p>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

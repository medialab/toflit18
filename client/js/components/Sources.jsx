/**
 * TOFLIT18 Client Sources Component
 * ======================================
 *
 */
import React, { Component } from "react";

export default class Sources extends Component {
  render() {
    return (
      <main className="container-fluid no-padding">
        <div className="section-heading">
          <div className="text-heading">
            <div className="row">
              <div className="col-sm-4 col-md-3">
                <h1>Sources</h1>
              </div>
              <div className="col-sm-8 col-md-5">
                <p className="hidden-xs">
                  The archives of French eighteenth century trade have been preserved in many different formats. We had
                  to integrate them into a limited number of types depending on their content.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="container content">
          <div className="row">
            <p className="lead">
              TOFLIT18 data come from a multitude of sources that have large differences in coverage and in the information they provide. TOFLIT18 sources are thus grouped into 12 source types (from "Objet Général" to "Tableau Général") that provide the same information and have the same coverage.
            </p>
            <p className="lead">
              In order to observe accross as many years as possible a specific aspect of French trade (for example, trade by customs region), it is often necessary to put together different types of sources. This work requires familiarity with the sources. It was therefore done for the main cases by the TOFLIT18 teams by creating "meta-sources types" called "Best Guesses".
            </p>
          </div>
     <div className="col-sm-10 col-sm-offset-1">
            <h1>Source types</h1>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>Objet Général</h2>
            <p className="lead">
              "Objet Généraux" is the title of documents that were produced from 1752 to 1788. They contain trade by product x partner for the whole of France. They always include the value of the flows. From 1771, they include quantities and / or unit prices. The 1752 Objet Général does not include imports from the West Indies. The 1782 and 1787 Objets Généraux do not include trade with America (except the United States), Asia or Africa. We have added to the Objet Général imports through the French East Indian Company when available on the same year (up to 1771)
            </p>
            <p>
              <ul>
                <li>AN F12 1835</li>
                <li>AN F12 242</li>
                <li>AN F12 243</li>
                <li>AN F12 245 to AN F12 250</li>
                <li>BM Rouen, Fonds Montbret, 155-1</li>
                <li>BM Rouen, Fonds Montbret, 155-2</li>
                <li>BNF Ms. 6431 (Compagnie des Indes)</li>
                <li>IIHS-122A to IIHS-122G</li>
              </ul>
            </p>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>Résumé</h2>
            <p className="lead">
              These sources cover 1787-1789 and 1797-1821. They contain trade by product x partner for the whole of France, including all products and all partners. They give the value of the flows, but not the quantities.
            </p>
            <p>
              <ul>
                <li>AN F12 251</li>
              </ul>
            </p>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>National toutes directions partenaires manquants</h2>
            <p className="lead">
              These sources contain trade by product x partner x customs region for the whole of France and some partners.
              The 1787 data only cover imports for some customs regions.
            </p>
            <p>
              <ul>
                <li>AN F12 1665</li>
                <li>AN F12 1666</li>
                <li>AN F12 1667</li>
                <li>AN F12 1667 et CCI Marseille I 31</li>
                <li>AN F12 1835</li>
                <li>AN F12 835</li>
                <li>AN Marine B 7 514 et ANOM Col F2 B 14</li>
                <li>AN Marine B 7 514 et ANOM Col F2 B 14 (tableau 17)</li>
                <li>AN Marine B 7 514 et ANOM Col F2 B 14 (tableau 18)</li>
                <li>AN Marine B 7 514 et ANOM Col F2 B 14 (tableau 21 to tableau 24) </li>
                <li>ANOM Col F2 B 13</li>
                <li>ANOM Col F2 B 13 (tableau 19 to tableau 27)</li>
                <li>ANOM Col F2 B 14 (tableau 16 to tableau 25)</li>
                <li>BNF N. Acq. 20538</li>
                <li>BNF N. Acq. 20541</li>
                <li>Fonds Gournay - M85 to MS87</li>
                <li>IIHS-133</li>
              </ul>
            </p>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>National toutes directions tous partenaires</h2>
            <p className="lead">
              These sources contain trade by product x partner x customs region for the whole of France. They include values and quantities. They only exist for 1750. Notice that 1789 in AN F12 1666 and F12 1667 nearly makes it ; but trade with America (except the United States), Africa and Asia is missing. As a result, the 1789 is classified in "National toutes directions partenaires manquants".
            </p>
            <p>
              <ul>
                <li>Fonds Gournay - M84 to MS87</li>
              </ul>
            </p>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>National toutes directions sans produits</h2>
            <p className="lead">
              These sources contain trade by partner x customs region for the whole of France. They include only values.They only exist for 1753, 1756, 1766, 1768, 1770-1, 1773-4, 1777-80.
            </p>
            <p>
              <ul>
                <li>AN F12 245 to 248</li>
                <li>BM Rouen, Fonds Montbret, 155-1</li>
                <li>IIHS-123</li>
              </ul>
            </p>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>Local</h2>
            <p className="lead">
              These sources contain data for trade by a specific customs region by product x partner x customs region. They include unit prices and quantites (and sometimes also values). They exist from 1714 to 1780. We have added in that category some information on Saint-Domingue’s imports in 1709, 1715, 1716, 1719 and 1734.

            </p>
            <p>
              <ul>
                <li>AD17 41 ETP 270/9385 to 9501</li>
                <li>AD33 C4268</li>
                <li>AD33 C4269</li>
                <li>AD33 C4386 to C4390</li>
                <li>AD34 C5488</li>
                <li>AD44 C706</li>
                <li>AD44 C716</li>
                <li>AD44 C716 n°15</li>
                <li>AD44 C716 n°30</li>
                <li>AD44 C716 n°34</li>
                <li>AD44 C717</li>
                <li>AD44 C717 n°14</li>
                <li>AD44 C718</li>
                <li>AD64 2 ETP 104</li>
                <li>AD64 2 ETP 105</li>
                <li>AD67 C1047</li>
                <li>AN F12 1669 (Exportations de Marseille en 1790)</li>
                <li>ANOM C9A 11</li>
                <li>ANOM C9A 12</li>
                <li>ANOM C9A 40</li>
                <li>ANOM C9B 01</li>
                <li>ANOM C9B 05</li>
                <li>ANOM Col F2 B 13 (tableaux 37 et 38)</li>
                <li>ANOM Col F2 B 14 (tableau 25)</li>
                <li>Archives de la CCI de Marseille - I 21 to 25</li>
                <li>Archives de la CCI de Marseille - I 29 to 31</li>
                <li>Archives de la CCI de Rouen Carton VIII 110</li>
                <li>Archives de la CCI Rouen Carton VIII</li>
                <li>BM Lyon ms 1490</li>
              </ul>
            </p>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>1792 first semester</h2>
            <p className="lead">
              These sources contains trade by product x partner for the whole of France for the first semester of 1792. They include
              mainly quantities.
            </p>
            <li>AN F12 252</li>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>National partenaires manquants</h2>
            <p className="lead">
              These sources contain trade by product x partner for the whole of France and a sub-set of all partners : only Angleterre, Barbarie, États-Unis, Russie for individual years in the 1780s, and the Colonies for 1790
            </p>
            <p>
              <ul>
                <li>AN F12 1835</li>
                <li>ANOM 07 DFC 305</li>
              </ul>
            </p>
          </div>

          <div className="col-sm-10 col-sm-offset-1">
            <h2>1792-both semesters</h2>
            <p className="lead">
              This source contains trade by product x continent for the whole of France for 1792. It contains a mix of quantities and values (but never both for a single flow).
            </p>
            <li>AN F12 252</li>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>Tableau des quantités</h2>
            <p className="lead">
              These sources contain trade by product x partner for the whole of France for 1793, 1822 and 1823. They include mainy quantities and all values
            </p>
            <p>
              <ul>
                <li>AN F12 251</li>
                <li>AN F12 1834B</li>
              </ul>
            </p>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>Tableau des marchandises</h2>
            <p className="lead">
              These sources contains trade by product for the whole of France for 1819 and 1821. They include mainly quantites and tolls paid.
            </p>
            <p>
              <ul>
                <li>AN F12 251</li>
              </ul>
            </p>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>Tableau Général</h2>
            <p className="lead">
              These sources contain trade by partner from 1716 to 1792, with gaps. We have completed the original "Tableau Général" with various other sources giving the same information at various date (up to 1792) or for the French East India Compagny.
            </p>
            <p>
              <ul>
                <li>AN F12 252 et F12 1843B</li>
                <li>Romano1957+Velde+IIHS-128</li>
                <li>WEBER Commerce de la compagnie des Indes 1904</li>
              </ul>
            </p>
          </div>
                   <div className="col-sm-10 col-sm-offset-1">
            <h1>Meta-source types</h1>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>Best Guess national product x partner</h2>
            <p className="lead">
              This "Best Guess" gathers the best sources about trade by product x partner for the whole of France in each year. This is "National toutes directions tous partenaires" for 1750, "Objet Général" from 1754 to 1780, "Résumé" in 1787-1789 and 1797-1821. These sources are supplemented by data from "Compagnie des Indes"
            </p>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>Best Guess national partner</h2>
            <p className="lead">
              This "Best Guess" gathers the best sources about trade by partner for the whole of France in each year. This is "Tableau Général" for 1716-1780 and 1792, and "Résumé" in 1787-1789 and 1797-1821.
            </p>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>Best Guess national product</h2>
            <p className="lead">
              This "Best Guess" gathers the best sources about trade by product for the whole of France in each year. Sources are the same as "Best Guess national product partner", but they are supplemented by "Tableau des Quantités" for 1793, 1822-1823.
            </p>
          </div>
           <div className="col-sm-10 col-sm-offset-1">
            <h2>Best Guess national</h2>
            <p className="lead">
              This "Best Guess" gathers the best sources about total trade for the whole of France in each year. Sources are the same as "Best Guess national product product", but they are supplemented by "Tableau Général" for 1792.
            </p>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>Best Guess customs region product x partner</h2>
            <p className="lead">
              This "Best Guess" gathers the best sources about trade by product x partner x customs region in each year. The selected sources are mostly "Local" ones (1714-1780), except for 1750 when we use "National toutes directions tous partenaires" and 1788-1789 when we use "Local" for colonial trade and "National toutes directions partenaires manquants" for the rest. Some "Local" sources from Rouen imports are excluded as they do not include all products (1737, 1739-1749, 1754, 1756-1762). We include 1789, despite it missing Asian trade because these data are very rich. We also include Marseille’s imports in 1787.
            </p>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>Best Guess national customs region</h2>
            <p className="lead">
              This "Best Guess" gathers the best sources about trade by customs region for the whole of France. It might not include all partners nor all goods. The selected source  is "National toutes directions tous partenaires" for 1750; "National toutes directions sans produits" for 1753, 1756, 1766, 1768, 1770-1, 1773-4 and 1777-80; and "National toutes directions partenaires manquants" otherwise. For 1777, trade with the United Kingdom does not come from "National toutes directions sans produit" but from "National toutes directions partenaires manquants".
              As a result, beware that only 1750, 1753, 1756, 1766, 1768, 1770-1, 1773-4, 1777-80 and 1789 cover all trade partners.
              Even when all trade partners are covered, the list of customs region is not constant. Paris appears in 1771. 1789 splits many customs regions.
            </p>
          </div>
        </div>
      </main >
    );
  }
}

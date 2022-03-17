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
        <div className="col-sm-10 col-sm-offset-1">
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
                <li>AN F12 245</li>
                <li>AN F12 246</li>
                <li>AN F12 247</li>
                <li>AN F12 248</li>
                <li>AN F12 249</li>
                <li>AN F12 250</li>
                <li>BM Rouen, Fonds Montbret, 155-1</li>
                <li>BM Rouen, Fonds Montbret, 155-2</li>
                <li>BNF Ms. 6431 (Compagnie des Indes)</li>
                <li>IIHS-122A</li>
                <li>IIHS-122B</li>
                <li>IIHS-122C</li>
                <li>IIHS-122D</li>
                <li>IIHS-122E</li>
                <li>IIHS-122F</li>
                <li>IIHS-122G</li>
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
            <h2>National toutes regions partenaires manquants</h2>
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
                <li>AN Marine B 7 514 et ANOM Col F2 B 14 (tableau 21)</li>
                <li>AN Marine B 7 514 et ANOM Col F2 B 14 (tableau 22)</li>
                <li>AN Marine B 7 514 et ANOM Col F2 B 14 (tableau 23)</li>
                <li>AN Marine B 7 514 et ANOM Col F2 B 14 (tableau 24)</li>
                <li>ANOM Col F2 B 13</li>
                <li>ANOM Col F2 B 13 (tableau 19)</li>
                <li>ANOM Col F2 B 13 (tableau 20)</li>
                <li>ANOM Col F2 B 13 (tableau 21)</li>
                <li>ANOM Col F2 B 13 (tableau 22)</li>
                <li>ANOM Col F2 B 13 (tableau 23)</li>
                <li>ANOM Col F2 B 13 (tableau 24)</li>
                <li>ANOM Col F2 B 13 (tableau 25)</li>
                <li>ANOM Col F2 B 13 (tableau 26)</li>
                <li>ANOM Col F2 B 13 (tableau 27)</li>
                <li>ANOM Col F2 B 14 (tableau 16)</li>
                <li>ANOM Col F2 B 14 (tableau 17)</li>
                <li>ANOM Col F2 B 14 (tableau 18)</li>
                <li>ANOM Col F2 B 14 (tableau 19)</li>
                <li>ANOM Col F2 B 14 (tableau 20)</li>
                <li>ANOM Col F2 B 14 (tableau 21)</li>
                <li>ANOM Col F2 B 14 (tableau 22)</li>
                <li>ANOM Col F2 B 14 (tableau 23)</li>
                <li>ANOM Col F2 B 14 (tableau 24)</li>
                <li>ANOM Col F2 B 14 (tableau 25)</li>
                <li>BNF N. Acq. 20538</li>
                <li>BNF N. Acq. 20541</li>
                <li>Fonds Gournay - M85</li>
                <li>Fonds Gournay - M86</li>
                <li>Fonds Gournay - M87</li>
                <li>IIHS-133</li>
              </ul>
            </p>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>National toutes regions tous partenaires</h2>
            <p className="lead">
              These sources contain trade by product x partner x customs region for the whole of France. They include values and quantities. They only exist for 1750. Notice that 1789 in AN F12 1666 and F12 1667 nearly makes it ; but trade with America (except the United States), Africa and Asia is missing. As a result, the 1789 is classified in "National toutes regions partenaires manquants".
            </p>
            <p>
              <ul>
                <li>Fonds Gournay - M84</li>
                <li>Fonds Gournay - M85</li>
                <li>Fonds Gournay - M86</li>
                <li>Fonds Gournay - M87</li>
              </ul>
            </p>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>National toutes regions sans produits</h2>
            <p className="lead">
              These sources contain trade by partner x customs region for the whole of France. They include only values.They only exist for 1753, 1756, 1766, 1768, 1770-1, 1773-4, 1777-80.
            </p>
            <p>
              <ul>
                <li>AN F12 245</li>
                <li>AN F12 246</li>
                <li>AN F12 247</li>
                <li>AN F12 248</li>
                <li>AN F12 248</li>
                <li>BM Rouen, Fonds Montbret, 155-1</li>
                <li>IIHS-123</li>
              </ul>
            </p>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>Local</h2>
            <p className="lead">
              These sources contain data for trade by a specific customs region by product x partner x customs region. They include
              unit prices and quantites (and sometimes also values). They exist from 1714 to 1780.
            </p>
            <p>
              <ul>
                <li>AD17 41 ETP 270/9385</li>
                <li>AD17 41 ETP 270/9386</li>
                <li>AD17 41 ETP 270/9387</li>
                <li>AD17 41 ETP 270/9388</li>
                <li>AD17 41 ETP 270/9389</li>
                <li>AD17 41 ETP 270/9390</li>
                <li>AD17 41 ETP 270/9391</li>
                <li>AD17 41 ETP 270/9392</li>
                <li>AD17 41 ETP 270/9393</li>
                <li>AD17 41 ETP 270/9394</li>
                <li>AD17 41 ETP 270/9395</li>
                <li>AD17 41 ETP 270/9396</li>
                <li>AD17 41 ETP 270/9397</li>
                <li>AD17 41 ETP 270/9398</li>
                <li>AD17 41 ETP 270/9399</li>
                <li>AD17 41 ETP 270/9400</li>
                <li>AD17 41 ETP 270/9401</li>
                <li>AD17 41 ETP 270/9402</li>
                <li>AD17 41 ETP 270/9403</li>
                <li>AD17 41 ETP 270/9404</li>
                <li>AD17 41 ETP 270/9406</li>
                <li>AD17 41 ETP 270/9407</li>
                <li>AD17 41 ETP 270/9408</li>
                <li>AD17 41 ETP 270/9409</li>
                <li>AD17 41 ETP 270/9410</li>
                <li>AD17 41 ETP 270/9411</li>
                <li>AD17 41 ETP 270/9412</li>
                <li>AD17 41 ETP 270/9413</li>
                <li>AD17 41 ETP 270/9414</li>
                <li>AD17 41 ETP 270/9415</li>
                <li>AD17 41 ETP 270/9416</li>
                <li>AD17 41 ETP 270/9417</li>
                <li>AD17 41 ETP 270/9418</li>
                <li>AD17 41 ETP 270/9419</li>
                <li>AD17 41 ETP 270/9420</li>
                <li>AD17 41 ETP 270/9421</li>
                <li>AD17 41 ETP 270/9422</li>
                <li>AD17 41 ETP 270/9423</li>
                <li>AD17 41 ETP 270/9424</li>
                <li>AD17 41 ETP 270/9425</li>
                <li>AD17 41 ETP 270/9426</li>
                <li>AD17 41 ETP 270/9427</li>
                <li>AD17 41 ETP 270/9428</li>
                <li>AD17 41 ETP 270/9429</li>
                <li>AD17 41 ETP 270/9430</li>
                <li>AD17 41 ETP 270/9431</li>
                <li>AD17 41 ETP 270/9432</li>
                <li>AD17 41 ETP 270/9433</li>
                <li>AD17 41 ETP 270/9434</li>
                <li>AD17 41 ETP 270/9435</li>
                <li>AD17 41 ETP 270/9436</li>
                <li>AD17 41 ETP 270/9437</li>
                <li>AD17 41 ETP 270/9438</li>
                <li>AD17 41 ETP 270/9439</li>
                <li>AD17 41 ETP 270/9440</li>
                <li>AD17 41 ETP 270/9441</li>
                <li>AD17 41 ETP 270/9442</li>
                <li>AD17 41 ETP 271/9443</li>
                <li>AD17 41 ETP 271/9445</li>
                <li>AD17 41 ETP 271/9446</li>
                <li>AD17 41 ETP 271/9448</li>
                <li>AD17 41 ETP 271/9449</li>
                <li>AD17 41 ETP 271/9450</li>
                <li>AD17 41 ETP 271/9451</li>
                <li>AD17 41 ETP 271/9452</li>
                <li>AD17 41 ETP 271/9453</li>
                <li>AD17 41 ETP 271/9454</li>
                <li>AD17 41 ETP 271/9455</li>
                <li>AD17 41 ETP 271/9456</li>
                <li>AD17 41 ETP 271/9457</li>
                <li>AD17 41 ETP 271/9458</li>
                <li>AD17 41 ETP 271/9459</li>
                <li>AD17 41 ETP 271/9460</li>
                <li>AD17 41 ETP 271/9461</li>
                <li>AD17 41 ETP 271/9462</li>
                <li>AD17 41 ETP 271/9463</li>
                <li>AD17 41 ETP 271/9464</li>
                <li>AD17 41 ETP 271/9465</li>
                <li>AD17 41 ETP 271/9466</li>
                <li>AD17 41 ETP 271/9467</li>
                <li>AD17 41 ETP 271/9468</li>
                <li>AD17 41 ETP 271/9469</li>
                <li>AD17 41 ETP 271/9470</li>
                <li>AD17 41 ETP 271/9471</li>
                <li>AD17 41 ETP 271/9472</li>
                <li>AD17 41 ETP 271/9473</li>
                <li>AD17 41 ETP 271/9474</li>
                <li>AD17 41 ETP 271/9475</li>
                <li>AD17 41 ETP 271/9476</li>
                <li>AD17 41 ETP 271/9477</li>
                <li>AD17 41 ETP 271/9478</li>
                <li>AD17 41 ETP 271/9479</li>
                <li>AD17 41 ETP 271/9480</li>
                <li>AD17 41 ETP 271/9481</li>
                <li>AD17 41 ETP 271/9482</li>
                <li>AD17 41 ETP 271/9483</li>
                <li>AD17 41 ETP 271/9484</li>
                <li>AD17 41 ETP 271/9485</li>
                <li>AD17 41 ETP 271/9487</li>
                <li>AD17 41 ETP 271/9488</li>
                <li>AD17 41 ETP 271/9489</li>
                <li>AD17 41 ETP 271/9490</li>
                <li>AD17 41 ETP 271/9491</li>
                <li>AD17 41 ETP 271/9492</li>
                <li>AD17 41 ETP 271/9493</li>
                <li>AD17 41 ETP 271/9494</li>
                <li>AD17 41 ETP 271/9495</li>
                <li>AD17 41 ETP 271/9496</li>
                <li>AD17 41 ETP 271/9497</li>
                <li>AD17 41 ETP 271/9498</li>
                <li>AD17 41 ETP 271/9499</li>
                <li>AD17 41 ETP 271/9500</li>
                <li>AD17 41 ETP 271/9501</li>
                <li>AD33 C4268</li>
                <li>AD33 C4269</li>
                <li>AD33 C4386</li>
                <li>AD33 C4387</li>
                <li>AD33 C4388</li>
                <li>AD33 C4389</li>
                <li>AD33 C4389</li>
                <li>AD33 C4390</li>
                <li>AD33 C4390</li>
                <li>AD34 C5488</li>
                <li>AD44 C706</li>
                <li>AD44 C716</li>
                <li>AD44 C716 n°15</li>
                <li>AD44 C716 n°30</li>
                <li>AD44 C716 n°34</li>
                <li>AD44 C717</li>
                <li>AD44 C717</li>
                <li>AD44 C717</li>
                <li>AD44 C717 n°14</li>
                <li>AD44 C718</li>
                <li>AD64 2 ETP 104</li>
                <li>AD64 2 ETP 105</li>
                <li>ANOM Col F2 B 13 (tableaux 37 et 38)</li>
                <li>ANOM Col F2 B 14 (tableau 25)</li>
                <li>Archives de la CCI de Marseille - I 21</li>
                <li>Archives de la CCI de Marseille - I 22</li>
                <li>Archives de la CCI de Marseille - I 23</li>
                <li>Archives de la CCI de Marseille - I 24</li>
                <li>Archives de la CCI de Marseille - I 25</li>
                <li>Archives de la CCI de Marseille - I 29</li>
                <li>Archives de la CCI de Marseille - I 29</li>
                <li>Archives de la CCI de Marseille - I 30</li>
                <li>Archives de la CCI de Marseille - I 31</li>
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
            <h2>1792-both semester</h2>
            <p className="lead">
              Thes source contains trade by product x continent for the whole of Frane for 1792. They contain a mix of quantities and values (but never both for a single flow)
            </p>
            <li>AN F12 252</li>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>Tableau des quantités</h2>
            <p className="lead">
              These sources contain trade by product x partner for the whole of France for 1822 and 1823. They include mainly quantities.
            </p>
            <p>
              <ul>
                <li>AN F12 251</li>
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
              This "Best Guess" gathers the best sources about trade by product x partner for the whole of France in each year. This is "National toutes regions tous partenaires" for 1750, "Objet Général" from 1754 to 1780, "Résumé" in 1787-1789 and 1797-1821. These sources are supplemented by data from "Compagnie des Indes"
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
              This "Best Guess" gathers the best sources about trade by product for the whole of France in each year. Sources are the same as "Best Guess national product x partner", but they are supplemented by "Tableau des Quantités" for 1822-1823.
            </p>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>Best Guess customs region product x partner</h2>
            <p className="lead">
              This "Best Guess" gathers the best sources about trade by product x partner x customs region in each year. The selected sources are mostly of the "Local" (1714-1780), except for 1750 when we use "National toutes regions tous partenaires" and 1788-1789 when we use "Local" for colonial trade and "National toutes regions partenaires manquants" for the rest. Some "Local" sources from Rouen imports are excluded as they do not include all products (1737, 1739-1749, 1754, 1756-1762). We include 1789, despite not missing Asian trade because these data are very rich. We also include Marseille’s imports in 1787.
            </p>
          </div>
          <div className="col-sm-10 col-sm-offset-1">
            <h2>Best Guess national customs region</h2>
            <p className="lead">
              This "Best Guess" gathers the best sources about trade by customs region for the whole of France. It might not include all partners nor all goods. The selected source  is "National toutes regions tous partenaires" for 1750; "National toutes regions sans produits" for 1753, 1756, 1766, 1768, 1770-1, 1773-4 and 1777-80; and "National toutes regions partenaires manquants" otherwise.
            </p>
          </div>
        </div>
      </main >
    );
  }
}

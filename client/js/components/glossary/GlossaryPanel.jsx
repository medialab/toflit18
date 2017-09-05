/**
 * TOFLIT18 Client Glossary View
 * ==============================
 *
 * Displaying the terms' glossary.
 */
import React, {Component} from 'react';
import GLOSSARY_DATA from '../../../glossaire.json';

const ENRICHED_DATA = GLOSSARY_DATA.map((entry, i) => {
  return {
    ...entry,
    key: i
  };
});

/**
 * Component representing a single glossary entry.
 */
function GlossaryEntry({name, definition}) {
  return (
    <div className="glossary-entry">
      <div className="glossary-name">
        {name}
      </div>
      <div className="glossary-definition">
        <em>{definition}</em>
      </div>
    </div>
  );
}

/**
 * Main component.
 */
export default class GlossaryPanel extends Component {
  render() {
    return (
      <div id="glossary">
        <div className="panel">
          <h3>Glossary</h3>
          <br />
          {ENRICHED_DATA.map(entry => {
            return (
              <GlossaryEntry
                key={entry.key}
                name={entry.name}
                definition={entry.definition} />
            );
          })}
        </div>
      </div>
    );
  }
}

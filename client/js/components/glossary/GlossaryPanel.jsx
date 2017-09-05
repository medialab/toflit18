/**
 * TOFLIT18 Client Glossary View
 * ==============================
 *
 * Displaying the terms' glossary.
 */
import React, {Component} from 'react';
import {escapeRegexp} from 'talisman/regexp';
import {debounce} from 'lodash';
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
  constructor(props, context) {
    super(props, context);

    this.state = {
      query: '',
      entries: ENRICHED_DATA
    };

    this.handleInput = this.handleInput.bind(this);
    this.debouncedSearch = debounce(this.performSearch.bind(this), 300);
  }

  handleInput(e) {
    const query = e.target.value;

    if (!query && this.state.entries.length !== ENRICHED_DATA) {
      this.setState({query, entries: ENRICHED_DATA});
    }
    else {
      this.setState({query});

      if (query.length > 2)
        this.debouncedSearch(query);
    }
  }

  performSearch(query) {
    const pattern = new RegExp(escapeRegexp(query));

    const filteredEntries = ENRICHED_DATA.filter(entry => {
      return (
        pattern.test(entry.name) ||
        pattern.test(entry.definition)
      );
    });

    this.setState({entries: filteredEntries});
  }

  render() {
    return (
      <div id="glossary">
        <div className="panel">
          <h3>Glossary</h3>
          <hr />
          <input
            className="form-control"
            placeholder="Search..."
            type="text"
            onChange={this.handleInput}
            value={this.state.query} />
          <br />
          {this.state.entries.map(entry => {
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

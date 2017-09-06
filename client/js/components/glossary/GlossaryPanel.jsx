/* eslint react/no-danger: 0 */
/**
 * TOFLIT18 Client Glossary View
 * ==============================
 *
 * Displaying the terms' glossary.
 */
import React, {Component} from 'react';
import {escapeRegexp} from 'talisman/regexp';
import {debounce} from 'lodash';
import RAW_GLOSSARY_DATA from '../../../glossary.json';

/**
 * Constants.
 */
const URL_REGEX = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;

const GLOSSARY_DATA = RAW_GLOSSARY_DATA.map(entry => {
  return {
    ...entry,
    html: entry.definition.replace(URL_REGEX, match => {
      let label = match;

      if (match.length > 70)
        label = match.slice(0, 67) + '...';

      return `<a href="${match}">${label}</a>`;
    })
  };
});

/**
 * Component representing a single glossary entry.
 */
function GlossaryEntry({name, html}) {
  return (
    <div className="glossary-entry">
      <div className="glossary-name">
        {name}
      </div>
      <div className="glossary-definition">
        <div dangerouslySetInnerHTML={{__html: html}} />
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
      entries: GLOSSARY_DATA
    };

    this.handleInput = this.handleInput.bind(this);
    this.debouncedSearch = debounce(this.performSearch.bind(this), 300);
  }

  handleInput(e) {
    const query = e.target.value;

    if (!query && this.state.entries.length !== GLOSSARY_DATA) {
      this.setState({query, entries: GLOSSARY_DATA});
    }
    else {
      this.setState({query});

      if (query.length > 2)
        this.debouncedSearch(query);
    }
  }

  performSearch(query) {
    const pattern = new RegExp(escapeRegexp(query));

    const filteredEntries = GLOSSARY_DATA.filter(entry => {
      return (
        pattern.test(entry.name) ||
        pattern.test(entry.definition)
      );
    });

    this.setState({entries: filteredEntries});
  }

  render() {

    let entries;

    if (this.state.entries.length) {
      entries = this.state.entries.map(entry => {
        return (
          <GlossaryEntry
            key={entry.name}
            name={entry.name}
            html={entry.html} />
        );
      });
    }
    else {
      entries = <div>No matching entries...</div>;
    }

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
          {entries}
        </div>
      </div>
    );
  }
}

/* eslint react/no-danger: 0 */
/**
 * TOFLIT18 Client Glossary View
 * ==============================
 *
 * Displaying the terms' glossary.
 */
import React, {Component} from 'react';
import {escapeRegexp} from 'talisman/regexp';
import cls from 'classnames';
import Icon from '../misc/Icon.jsx';
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
    <div className="well">
      <dt>{name}</dt>
      <dd dangerouslySetInnerHTML={{__html: html}} />
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
  }

  handleInput(e) {
    const query = e.target.value;

    if (!query && this.state.entries.length !== GLOSSARY_DATA) {
      this.setState({query, entries: GLOSSARY_DATA});
    }
    else {
      this.setState({query});

      if (query.length > 2)
        this.performSearch(query);
      else
        this.performSearch('');
    }
  }

  performSearch(query) {
    if (!query) {
      this.setState({entries: GLOSSARY_DATA.slice(0)});
    }
    else {
      const pattern = new RegExp(escapeRegexp(query));

      const filteredEntries = GLOSSARY_DATA.filter(entry => {
        return (
          pattern.test(entry.name) ||
          pattern.test(entry.definition)
        );
      });

      this.setState({entries: filteredEntries});
    }
  }

  render() {
    const {query} = this.state;
    const entries = this.state.entries.map(entry => {
      return (
        <GlossaryEntry
          key={entry.name}
          name={entry.name}
          html={entry.html} />
      );
    });

    return (
      <main className="container-fluid container-global no-padding">
        <div className="section-search">
          <form>
            <div className="form-group-search">
              <div className="container">
                <div className="row">
                  <div className="col-sm-8 col-sm-offset-2">
                    <div className="form-group">
                      <Icon name="icon-search-lg" />
                      <label
                        className="sr-only"
                        htmlFor="searchGlossary" >
                        Search
                      </label>
                      <input
                        id="searchGlossary"
                        className="form-control input-lg"
                        type="search"
                        placeholder="Search..."
                        onChange={this.handleInput}
                        value={query} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
          <div className="container">
            <div className="row">
              <div className="col-sm-10 col-sm-offset-1">
                <div className="search-result">
                  <h1>Glossary</h1>
                  <p className={cls((!entries.length || query.length <= 2) && 'hidden')}>
                    We found <strong>{entries.length}</strong> results found for "{query}"
                  </p>
                  <p className={cls(entries.length && 'hidden')}>
                    We're sorry. We cannot find any matches for your search.
                  </p>
                  <dl>
                    {entries}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

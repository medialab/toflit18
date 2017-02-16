 /**
 * TOFLIT18 Client Fuzzy Node Searcher
 * ====================================
 *
 * Component performing fuzzy queries in a graph's node.
 */
import React, {PureComponent} from 'react';
import Select from 'react-select';

export default class ExplorationFuzzyNodeSearcher extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      value: null
    };

    this.handleSelection = this.handleSelection.bind(this);
  }

  handleSelection(value) {
    if (typeof this.props.onChange === 'function')
      this.props.onChange(value);
    this.setState({value});
  }

  render() {
    const {nodes} = this.props;

    return (
      <div className="fuzzy-node-searcher">
        <Select
          options={nodes}
          placeholder="Search a node in the graph..."
          labelKey="label"
          onChange={this.handleSelection}
          value={this.state.value} />
      </div>
    );
  }
}

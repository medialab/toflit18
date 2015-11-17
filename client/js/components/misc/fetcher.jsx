/**
 * TOFLIT18 Fetcher Component
 * ===========================
 *
 * Component used to wrap another one by providing him some necessary.
 */
import React, {Component} from 'react';
import Client from 'djax-client';

export default class Fetcher extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {data: null};
  }

  componentDidMount() {

    // Fetching the needed data
    this.client = new Client({
      defaults: {
        contentType: 'application/json',
        dataType: 'json'
      }
    });

    const {url} = this.props;

    this.client.request({url}, (err, data) => {
      if (!err)
        this.setState({data});
    });
  }

  render() {
    const child = React.Children.only(this.props.children),
          data = this.state.data;

    if (!data)
      return null;
    else
      return React.cloneElement(child, {data});
  }
}

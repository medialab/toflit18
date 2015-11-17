/**
 * React Measured Higher Order Component
 * ======================================
 *
 * This higher-order component will wait for its target to be mounted to
 * pass its measures through props.
 *
 * This is very useful to render visualizations that need to have some amount
 * of information concerning their dom context.
 */
import React from 'react';
import ReactDOM from 'react-dom';

export default function(Component) {
  return class MeasuredComponent extends React.Component {
    constructor(props, context) {
      super(props, context);

      this.state = {width: null, height: null};
    }

    componentDidMount() {
      const dom = ReactDOM.findDOMNode(this);

      this.setState({width: dom.offsetWidth, height: dom.offsetHeight});
    }

    render() {
      const {width, height} = this.state;

      return <Component width={width} height={height} {...this.props} />;
    }
  };
}

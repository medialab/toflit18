/**
 * TOFLIT18 Client File Input Component
 * =====================================
 *
 * Simple file input component with some helpers to retrieve the uploaded's file
 * data.
 */
import React, {Component, PropTypes} from 'react';
import Button from './Button.jsx';
import {uniqueId} from 'lodash';

export default class FileInput extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      id: uniqueId(),
      uploaded: false,
      name: null
    };
  }

  static PropTypes = {
    onFile: PropTypes.func.isRequired
  };

  handleClick() {
    this.refs.file.click();
  }

  handleChange(e) {
    const file = e.target.files[0],
          callback = this.props.onFile;

    if (!file)
      return;

    const reader = new FileReader();

    reader.onload = r => {
      this.setState({uploaded: true, name: file.name});

      return callback({
        name: file.name,
        content: r.target.result
      });
    };

    reader.readAsText(file);
  }

  reset() {

    if (typeof this.props.onReset === 'function')
      this.props.onReset();

    this.setState({
      id: uniqueId(),
      uploaded: false,
      name: null
    });
  }

  render() {
    const fileChosen = this.state.uploaded,
          name = this.state.name;

    return (
      <div>
        <input ref="file"
               type="file"
               key={this.state.id}
               style={{display: 'none'}}
               onChange={e => this.handleChange(e)}/>
        <div className="input-group">
          <input type="text"
                 className="form-control"
                 disabled
                 placeholder={fileChosen ? name : '...'} />
          <span className="input-group-btn">
            {fileChosen ?
              <Button kind="danger" onClick={() => this.reset()}>
                ✖
              </Button> :
              <Button kind={fileChosen ? 'primary' : 'secondary'}
                      onClick={(e) => !fileChosen && this.handleClick(e)}>
                Choose File
              </Button>
            }
          </span>
        </div>
      </div>
    );
  }
}

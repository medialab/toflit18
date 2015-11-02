/**
 * TOFLIT18 Client File Input Component
 * =====================================
 *
 * Simple file input component with some helpers to retrieve the uploaded's file
 * data.
 */
import React, {Component, PropTypes} from 'react';
import Button from '../bootstrap/button.jsx';

export default class FileInput extends Component {
  static PropTypes = {
    onFile: PropTypes.func.isRequired
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      uploaded: false,
      name: null
    };
  }

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

  render() {
    const fileChosen = this.state.uploaded,
          name = this.state.name;

    return (
      <div>
        <input ref="file"
               type="file"
               style={{display: 'none'}}
               onChange={e => this.handleChange(e)}/>
        <div className="input-group">
          <input type="text"
                 className="form-control"
                 disabled={true}
                 placeholder={fileChosen ? name : '...'} />
          <span className="input-group-btn">
            <Button kind={fileChosen ? 'primary' : 'secondary'}
                    onClick={(e) => this.handleClick(e)}>
              {fileChosen ? '✔' : 'Choose File'}
            </Button>
          </span>
        </div>
      </div>
    );
  }
}

/**
 * Bootstrap Button Components
 * ============================
 *
 * Collection of Bootstrap v4 button-related components.
 */
import React, {Component} from 'react';
import Ladda from 'ladda';
import csvParse from 'papaparse';
import {saveAs} from 'browser-filesaver';
import gexf from 'gexf';

export default class Button extends Component {

  // Mounting the ladda button
  componentDidMount() {
    const dom = this.refs.button;
    this.ladda = Ladda.create(dom);

    if (this.props.loading)
      this.ladda.start();
  }

  // Updating loading status
  componentDidUpdate() {
    if (this.props.loading)
      this.ladda.start();
    else
      this.ladda.stop();
  }

  // Tearing the ladda button
  componentWillUnmount() {
    this.ladda.remove();
    this.ladda = null;
  }

  render() {
    const {
      kind = 'primary',
      disabled,
      onClick,
      size,
      style = {}
    } = this.props;

    let cls = `btn btn-${kind} ladda-button`;

    if (disabled)
      cls += ' disabled';

    if (size)
      cls += (size === 'small' ? ' btn-sm' : 'btn-lg');

    const optional = {};

    if (kind === 'secondary')
      optional['data-spinner-color'] = '#373a3c';

    return (
      <button
        ref="button"
        type="button"
        data-style="slide-left"
        className={cls}
        style={style}
        onClick={e => !disabled && typeof onClick === 'function' && onClick(e)}
        {...optional}>
        <span className="ladda-label">
          {this.props.children}
        </span>
      </button>
    );
  }
}

export class ButtonGroup extends Component {
  render() {
    return <div className="btn-group" role="group">{this.props.children}</div>;
  }
}

export class ExportButton extends Component {

  download() {
    const data = this.props.data,
          type = this.props.type,
          network = this.props.network;

          if (type === 'gexf' && network === 'terms') {

            const meta = {
              creator: 'toflit18',
              lastmodifieddate: '2010-05-29+01:27',
              title: 'A graph of terms'
            };

            const model = {
              node: [
                {
                  id: 'community',
                  type: 'float',
                  title: 'Community'
                },
                {
                  id: 'position',
                  type: 'float',
                  title: 'Position'
                }
              ]
            };

            const nodes = [];
            data.nodes.forEach(n => {
              const node = {
                id: n.id,
                label: n.label,
                attributes: {
                  community: n.community,
                  position: n.position
                },
                viz: {
                  color: n.communityColor,
                  size: n.size,
                  position: {
                    x: n.x,
                    y: n.y,
                    z: 0
                  }
                }
              };

              nodes.push(node);
            });

            const params = {
              version: '0.0.1',
              meta,
              model,
              nodes,
              edges: data.edges
            };

            const myGexf = gexf.create(params),
                  blob = new Blob([myGexf.serialize()], {type: 'text/gexf+xml;charset=utf-8'});

            return saveAs(blob, this.props.name);
          }
          else if (type === 'gexf' && network === 'country') {

            const meta = {
              creator: 'toflit18',
              lastmodifieddate: '2010-05-29+01:27',
              title: 'A graph of terms'
            };

            const model = {
              node: [
                {
                  id: 'community',
                  type: 'string',
                  title: 'Community'
                }
              ]
            };

            const nodes = [];
            data.nodes.forEach(n => {
              const node = {
                id: n.id,
                label: n.label,
                attributes: {
                  community: n.community
                },
                viz: {
                  color: n.color,
                  size: n.size,
                  position: {
                    x: n.x,
                    y: n.y,
                    z: 0
                  }
                }
              };

              nodes.push(node);
            });

            const params = {
              version: '0.0.1',
              defaultEdgeType: 'directed',
              meta,
              model,
              nodes,
              edges: data.edges
            };

            const myGexf = gexf.create(params),
                  blob = new Blob([myGexf.serialize()], {type: 'text/gexf+xml;charset=utf-8'});

            return saveAs(blob, this.props.name);
          }
          else {
             const csv = csvParse.unparse(data),
                   blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});

              return saveAs(blob, this.props.name);
          }
  }

  render() {
    return (
      <Button onClick={() => this.download()} kind="secondary">
        {this.props.children}
      </Button>
    );
  }
}

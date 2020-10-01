import gexf from 'gexf';
import {sum} from 'lodash';
import d2i from 'dom-to-image';
import csvParse from 'papaparse';
import {saveAs} from 'browser-filesaver';

export function exportGEXF({data, meta, model, name, params}) {
  const gexfParams = {
    meta,
    model,
    nodes: data.nodes,
    edges: data.edges,
    version: '0.0.1',
    ...params,
  };

  const writer = gexf.create(gexfParams);
  const blob = new Blob([writer.serialize()], {type: 'text/gexf+xml;charset=utf-8'});

  return saveAs(blob, name);
}

export function exportCSV({data, name}) {
  const csv = csvParse.unparse(data);
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});

  return saveAs(blob, name);
}

export function exportSVG({nodes, name}) {
  const domNodes = Array.isArray(nodes) ? nodes : [nodes];
  const svgs = [];
  const todos = domNodes.length;

  function finalize() {
    const widths = [];
    const heights = [];

    const contents = svgs.map(svg => {
      widths.push(+((svg.match(/ width="([0-9]+)(px)?"/) || [])[1] || 0));
      heights.push(+((svg.match(/ height="([0-9]+)(px)?"/) || [])[1] || 0));

      return svg
        .replace(/^<svg[^>]+>/, `<g transform="translate(0 ${sum(heights.slice(0, -1))})" x="0" y="0">`)
        .replace(/<\/svg>$/, '</g>');
    });

    const finalSvg = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(...widths) + 50}px" height="${sum(heights) + 50}px">`,
      ...contents,
      '</svg>',
    ].join('');
    const blob = new Blob([finalSvg], {type: 'text/svg;charset=utf-8'});

    return saveAs(blob, name);
  }

  Promise.all(
    domNodes.map((node, i) => {
      return new Promise((resolve, reject) => {
        if (typeof node === 'string') {
          svgs[i] = node
            .replace(/^<\?xml[^>]+>/, '')
            .replace(/<\!DOCTYPE[^>]+>/, '')
            .replace(/^\n\n/, '');
          resolve();
        } else {
          d2i.toSvg(node).then(dataUrl => {
            svgs[i] = dataUrl.replace(/^[^<]*</, '<');
            resolve();
          });
        }
      });
    }),
  ).then(() => {
    finalize();
  });
}

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
  //const todos = domNodes.length;

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
      `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(...widths) + 50}px" height="${sum(heights) + 50}px">
      <rect width="100%" height="100%" fill="white"/>`,
      ...contents,
      '</svg>',
    ].join('');
    const blob = new Blob([finalSvg], {type: 'text/svg;charset=utf-8'});

    return saveAs(blob, name);
  }

  Promise.all(
    domNodes.map((node, i) => {
      return new Promise(resolve => {
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

export function exportIndicatorsChart({vizContainer, legend, name, mode}) {
  // add legend to the viz container to include it in the snapshot
  const legendClone = legend.cloneNode(true);
  vizContainer.appendChild(legendClone);
  vizContainer.className = vizContainer.className + ' export-image';
  const options = {
    style: {
      'margin-top': '1px',
      'margin-left': '1px',
    },
    bgcolor: '#FFF',
  };
  if (mode === 'PNG')
    return d2i.toBlob(vizContainer, options).then(blob => {
      // remove the legend
      vizContainer.removeChild(legendClone);
      vizContainer.className = vizContainer.className.replace(' export-image', '');
      return saveAs(blob, name);
    });
  if (mode === 'SVG')
    return d2i.toSvg(vizContainer, options).then(finalSvg => {
      // remove the legend
      vizContainer.removeChild(legendClone);
      vizContainer.className = vizContainer.className.replace(' export-image', '');
      return saveAs(
        new Blob([finalSvg.replace('data:image/svg+xml;charset=utf-8,', '')], {type: 'text/svg;charset=utf-8'}),
        name,
      );
    });
  return null;
}

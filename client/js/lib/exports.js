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
    ...params
  };

  const writer = gexf.create(gexfParams);
  const blob = new Blob(
    [writer.serialize()],
    {type: 'text/gexf+xml;charset=utf-8'}
  );

  return saveAs(blob, name);
}

export function exportCSV({data, name}) {
  const csv = csvParse.unparse(data);
  const blob = new Blob(
    [csv],
    {type: 'text/csv;charset=utf-8'}
  );

  return saveAs(blob, name);
}

export function exportSVG({nodes, name}) {
  const domNodes = Array.isArray(nodes) ? nodes : [nodes];
  const svgs = [];
  let todos = domNodes.length;

  function finalize() {
    const widths = [];
    const heights = [];

    const contents = svgs.map(svg => {
      widths.push(+((svg.match(/ width="([^"]+)"/) || [])[1] || 0));
      heights.push(+((svg.match(/ height="([^"]+)"/) || [])[1] || 0));


      return (
        svg
          .replace(/^<svg[^>]+>/, '')
          .replace(/<\/svg>$/, '')
          .replace(/ y="[^"]*"/, ` y="${sum(heights.slice(0, -1))}"`)
      );
    });

    const finalSvg = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(...widths) + 50}" height="${sum(heights) + 50}">`,
      ...contents,
      '</svg>'
    ].join('');
    const blob = new Blob(
      [finalSvg],
      {type: 'text/svg;charset=utf-8'}
    );

    return saveAs(blob, name);
  }

  domNodes.forEach((node, i) => {
    d2i
      .toSvg(node)
      .then(dataUrl => {
        svgs[i] = dataUrl.replace(/^[^<]*</, '<');

        if (!--todos)
          finalize();
      });
  });
}

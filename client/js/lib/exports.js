import gexf from 'gexf';
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

/**
 * TOFLIT18 Download Actions
 * ==========================
 *
 * Actions related to downloads etc.
 */
import {enpoint} from '../../config.json';
import {saveAs} from 'browser-filesaver';

export function downloadClassification(tree, id) {
  const flag = tree.select('flags', 'downloading');

  flag.set(true);
  tree.client.export({params: {id}}, function(err, data) {
    flag.set(false);

    if (err) return;

    // Downloading the csv file
    const {result: {filename, csv}} = data,
          blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});

    return saveAs(blob, filename);
  });
}

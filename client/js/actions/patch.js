/**
 * TOFLIT18 Patch Actions
 * =======================
 *
 * Actions related to the patch modals related to classifications' update,
 * creations and forks.
 */
import csvParser from 'papaparse';
import {cleanText} from '../../../lib/clean';
import {checkConsistency} from '../../../lib/patch';
import _ from 'lodash';

export function parse(tree, file, options) {
  const cursor = tree.select('states', 'classification', 'modal');

  csvParser.parse(file.content, {
    skipEmptyLines: true,
    complete: function(result) {
      const rows = result.data;

      // Treating the resultant data
      const data = _(rows)
        .drop(1)
        .map(row => {
          return {
            item: cleanText(row[0]),
            group: cleanText(row[1]),
            note: cleanText(row[2]) || null
          };
        })
        .value();

      cursor.set('patch', data);

      // Checking consistency of CSV file
      const report = checkConsistency(data);

      if (report.length)
        cursor.set('inconsistencies', report);
      else
        cursor.set('step', 'review');
    }
  });
}

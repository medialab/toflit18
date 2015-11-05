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

const MODAL_PATH = ['states', 'classification', 'modal'];

/**
 * Reset the modal.
 */
export function reset(tree) {
  const cursor = tree.select(MODAL_PATH);
  cursor.set('patch', null);
  cursor.set('step', 'upload');
  cursor.set('inconsistencies', null);
  cursor.set('review', null);
}

/**
 * Parsing the received csv file.
 */
export function parse(tree, file, options) {
  const cursor = tree.select(MODAL_PATH);

  csvParser.parse(file.content, {
    skipEmptyLines: true,
    complete: function(result) {
      const rows = result.data;

      // Treating the resultant data
      const data = _(rows)
        .drop(1)
        .map(row => {
          return {
            item: cleanText(row[0]) || null,
            group: cleanText(row[1]) || null,
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

/**
 * Asking our server to perform the review of the given patch.
 */
export function review(tree, id) {
  const cursor = tree.select(MODAL_PATH),
        {step, patch} = cursor.get();

  if (step !== 'review')
    return;

  cursor.set('loading', true);
  tree.client.review({params: {id, type: 'patch'}, data: {patch}}, function(err, data) {
    cursor.set('loading', false);

    if (err || !data.result)
      return;

    cursor.set('review', data.result);
  });
}

/**
 * Committing the current patch.
 */
export function commit(tree, id) {
  const cursor = tree.select(MODAL_PATH),
        {review: {operations}, step} = cursor.get();

  if (step !== 'review')
    return;

  tree.client.commit({params: {id, type: 'patch'}, data: {operations}}, function(err, data) {
    if (err)
      return;

    // Fix UX later...
    location.reload();
  });
}

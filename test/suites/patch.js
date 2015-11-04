import assert from 'assert';
import {applyPatch, checkConsistency, checkIntegrity} from '../../lib/patch';

describe('Classification patching', function() {

  describe('Inconsistencies', function() {
    it('should be possible to search the given patch for inconsistencies.', function() {
      const patch = [
        {group: 'fruits', item: 'mango'},
        {group: 'fruits', item: 'papaya'},
        {group: 'fruits', item: 'apple'},
        {group: 'exotic', item: 'mango'}
      ];
    });
  });

  describe('Integrity', function() {

    it('should correctly return both extraneous & missing items.', function() {
      const older = [1, 2, 3],
            newer = [1, 2, 5, 6];

      assert.deepEqual(
        checkIntegrity(older, newer),
        {
          extraneous: [5, 6],
          missing: [3]
        }
      );
    });
  });

  describe('Patch', function() {

    it('should detect the correct operations.', function() {
      const older = [
        {group: 'fruits', item: 'mango'},
        {group: 'fruits', item: 'papaya'},
        {group: 'fruits', item: 'apple'},
        {group: 'colors', item: 'blue'},
        {group: 'colors', item: 'purple'},
        {group: null, item: 'yellow'},
        {group: 'names', item: 'Ney'},
        {group: 'names', item: 'Davout'},
        {group: 'days', item: 'Tuesday'},
        {group: 'days', item: 'Monday'},
        {group: 'date', item: 'February'},
        {group: 'date', item: 'October'},
        {group: null, item: 'loner'}
      ];

      const newer = [
        {group: 'exoticFruits', item: 'mango'},
        {group: 'exoticFruits', item: 'papaya'},
        {group: 'fruits', item: 'apple'},
        {group: 'colors', item: 'blue'},
        {group: null, item: 'purple'},
        {group: 'colors', item: 'yellow'},
        {group: 'generals', item: 'Ney'},
        {group: 'generals', item: 'Davout'},
        {group: 'week', item: 'Tuesday'},
        {group: 'week', item: 'Monday'},
        {group: 'week', item: 'Thursday'},
        {group: 'month', item: 'November'},
        {group: 'month', item: 'February'},
        {group: 'month', item: 'October'},
        {group: null, item: 'loner'}
      ];

      assert.deepEqual(
        applyPatch(older, newer),
        [
          // Renaming groups
          {type: 'renameGroup', from: 'names', to: 'generals'},
          {type: 'renameGroup', from: 'days', to: 'week'},
          {type: 'renameGroup', from: 'date', to: 'month'},

          // Adding groups
          {type: 'addGroup', name: 'exoticFruits'},

          // Moving items
          {type: 'moveItem', from: 'fruits', to: 'exoticFruits', item: 'mango'},
          {type: 'moveItem', from: 'fruits', to: 'exoticFruits', item: 'papaya'},
          {type: 'moveItem', from: 'colors', to: null, item: 'purple'},
          {type: 'moveItem', from: null, to: 'colors', item: 'yellow'},
          {type: 'moveItem', from: null, to: 'week', item: 'Thursday'},
          {type: 'moveItem', from: null, to: 'month', item: 'November'}
        ]
      );
    });
  });
});

import assert from 'assert';
import {applyPatch, checkIntegrity} from '../../lib/patch';

describe('Classification patching', function() {

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

    it('should work?', function() {
      const older =[
        {group: 'fruits', item: 'mango'},
        {group: 'fruits', item: 'papaya'},
        {group: 'fruits', item: 'apple'},
        {group: 'colors', item: 'blue'},
        {group: 'colors', item: 'purple'},
        {group: null, item: 'yellow'}
      ];

      const newer =[
        {group: 'exoticFruits', item: 'mango'},
        {group: 'exoticFruits', item: 'papaya'},
        {group: 'fruits', item: 'apple'},
        {group: 'colors', item: 'blue'},
        {group: null, item: 'purple'},
        {group: 'colors', item: 'yellow'}
      ];

      console.log(applyPatch(older, newer));
    });
  });
});

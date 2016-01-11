import assert from 'assert';
import {
 checkConsistency,
 checkIntegrity,
 solvePatch,
 applyOperations,
 getAffectedGroups,
 rewire
} from '../../lib/patch';

describe('Classification patching', function() {

  // Sample data
  const older = [
    {groupId: 1, group: 'fruits', item: 'mango'},
    {groupId: 1, group: 'fruits', item: 'papaya'},
    {groupId: 1, group: 'fruits', item: 'apple'},
    {groupId: 2, group: 'colors', item: 'blue'},
    {groupId: 2, group: 'colors', item: 'purple'},
    {groupId: null, group: null, item: 'yellow'},
    {groupId: 3, group: 'names', item: 'Ney'},
    {groupId: 3, group: 'names', item: 'Davout'},
    {groupId: 4, group: 'days', item: 'Tuesday'},
    {groupId: 4, group: 'days', item: 'Monday'},
    {groupId: null, group: null, item: 'Thursday'},
    {groupId: 5, group: 'date', item: 'February'},
    {groupId: 5, group: 'date', item: 'October'},
    {groupId: null, group: null, item: 'November'},
    {groupId: null, group: null, item: 'loner'},
    {groupId: null, group: null, item: 'strawberry'},
    {groupId: 6, group: 'unknown', item: 'blueberry'}
  ];

  older.forEach((row, i) => row.itemId = i);

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
    {group: null, item: 'loner'},
    {group: 'fruits', item: 'strawberry'},
    {group: 'fruits', item: 'blueberry'},
    {group: 'fruits', item: 'shawarma'},
    {group: 'useless', item: null},
    {group: 'second_useless', item: 'falafel'}
  ];

  describe('Inconsistencies', function() {
    it('should be possible to search the given patch for inconsistencies.', function() {
      const patch = [
        {group: 'fruits', item: 'mango'},
        {group: 'fruits', item: 'papaya'},
        {group: 'fruits', item: 'apple'},
        {group: 'exotic', item: 'mango'}
      ];

      assert.deepEqual(
        checkConsistency(patch),
        [
          {
            item: 'mango',
            groups: [
              {
                group: 'fruits',
                line: 2
              },
              {
                group: 'exotic',
                line: 5
              }
            ]
          }
        ]
      );
    });
  });

  describe('Integrity', function() {

    it('should correctly return both extraneous & missing items.', function() {
      const one = [1, 2, 3],
            two = [1, 2, 5, 6];

      assert.deepEqual(
        checkIntegrity(one, two),
        {
          extraneous: [5, 6],
          missing: [3]
        }
      );
    });
  });

  describe('Solving', function() {

    it('should detect the correct operations.', function() {

      assert.deepEqual(
        solvePatch(older, newer),
        [
          // Renaming groups
          {id: 3, type: 'renameGroup', from: 'names', to: 'generals'},
          {id: 4, type: 'renameGroup', from: 'days', to: 'week'},
          {id: 5, type: 'renameGroup', from: 'date', to: 'month'},

          // Adding groups
          {type: 'addGroup', name: 'exoticFruits'},

          // Moving items
          {type: 'moveItem', itemId: 0, fromId: 1, from: 'fruits', toId: null, to: 'exoticFruits', item: 'mango'},
          {type: 'moveItem', itemId: 1, fromId: 1, from: 'fruits', toId: null, to: 'exoticFruits', item: 'papaya'},
          {type: 'moveItem', itemId: 4, fromId: 2, from: 'colors', toId: null, to: null, item: 'purple'},
          {type: 'moveItem', itemId: 5, fromId: null, from: null, toId: 2, to: 'colors', item: 'yellow'},
          {type: 'moveItem', itemId: 10, fromId: null, from: null, toId: null, to: 'week', item: 'Thursday'},
          {type: 'moveItem', itemId: 13, fromId: null, from: null, toId: null, to: 'month', item: 'November'},
          {type: 'moveItem', itemId: 15, fromId: null, from: null, toId: 1, to: 'fruits', item: 'strawberry'},
          {type: 'moveItem', itemId: 16, fromId: 6, from: 'unknown', toId: 1, to: 'fruits', item: 'blueberry'}
        ]
      );
    });
  });

  describe('Applying', function() {

    it('should be possible to apply a patch\'s operations to an existing classification.', function() {

      const operations = solvePatch(older, newer),
            updatedClassification = applyOperations(older, operations);

      assert.deepEqual(updatedClassification, [
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
        {group: 'month', item: 'February'},
        {group: 'month', item: 'October'},
        {group: 'month', item: 'November'},
        {group: null, item: 'loner'},
        {group: 'fruits', item: 'strawberry'},
        {group: 'fruits', item: 'blueberry'}
      ]);
    });
  });

  describe('Rewiring', function() {

    it('should work propertly.', function() {
      const C1 = [
        {groupId: 1, group: 'fruits', item: 'mango'},
        {groupId: 1, group: 'fruits', item: 'papaya'},
        {groupId: 1, group: 'fruits', item: 'apple'},
        {groupId: 2, group: 'vegetables', item: 'cucumber'},

        {groupId: 3, group: 'flower', item: 'rose'},
        {groupId: 3, group: 'flower', item: 'magnolia'},
        {groupId: 3, group: 'flower', item: 'oak'},
        {groupId: 4, group: 'tree', item: 'poplar'}
      ];

      C1.forEach((row, i) => row.itemId = i);

      const p = [
        {group: 'exoticFruits', item: 'mango'},
        {group: 'exoticFruits', item: 'papaya'},
        {group: 'fruits', item: 'apple'},

        {group: 'flower', item: 'rose'},
        {group: 'flower', item: 'magnolia'},
        {group: 'tree', item: 'oak'},
        {group: 'tree', item: 'poplar'}
      ];

      const operations = solvePatch(C1, p),
            affectedGroups = getAffectedGroups(operations);

      assert.deepEqual(
        Array.from(affectedGroups),
        [
          'fruits',
          'exoticFruits',
          'flower',
          'tree'
        ]
      );

      const C2 = applyOperations(C1, operations);

      // NOTE: Step 1 result from Neo4j
      const D = [
        {group: 'food', items: ['fruits', 'vegetables']},
        {group: 'nature-small', items: ['flower']},
        {group: 'nature-big', items: ['tree']}
      ];

      const links = rewire(D, C1, C2, operations);

      assert.deepEqual(
        links,
        [
          {
            cluster: 'c0',
            shouldExist: true,
            upper: 'food',
            group: 'fruits'
          },
          {
            cluster: 'c0',
            shouldExist: true,
            upper: 'food',
            group: 'vegetables'
          },
          {
            cluster: 'c0',
            shouldExist: true,
            upper: '',
            group: 'exoticFruits'
          },
          {
            cluster: 'c1',
            shouldExist: false,
            upper: 'nature-small',
            group: 'flower'
          },
          {
            cluster: 'c1',
            shouldExist: false,
            upper: 'nature-big',
            group: 'tree'
          }
        ]
      );
    });
  });
});

import assert from 'assert';
import {tokenizeTerms} from '../../lib/tokenizer';

describe('Tokenizer', function() {
  it('should correctly separate the terms of an expression.', function() {
    const tests = [
      'armes de guerre',
      'bœuf'
    ];

    const results = [
      ['armes', 'guerre'],
      ['bœuf']
    ];

    tests.forEach((t, i) => assert.deepEqual(tokenizeTerms(t), results[i]));
  });
});

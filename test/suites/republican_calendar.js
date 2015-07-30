import assert from 'assert';
import _ from 'lodash';

import {normalizeYear} from '../../lib/republican_calendar';

const YEAR_INDEX = {
  '2': 1794,
  '3': 1795,
  '4': 1796,
  '5': 1797,
  '6': 1798,
  '7': 1799,
  '8': 1800,
  '9': 1801,
  '10': 1802,
  '11': 1803,
  '12': 1804,
  '13': 1805,
  '14': 1806
};

describe('Republican calendar', function() {

  it('should return the correct years.', function() {
    _(YEAR_INDEX)
      .forIn((year, nb) => {
        assert.strictEqual(normalizeYear('An ' + nb), year);
      })
      .value();

    assert.strictEqual(normalizeYear('An 14 & 1806'), 1806);
  });

  it('should throw when the year is invalid.', function() {
    assert.throws(function() {
      normalizeYear('An 18');
    }, /invalid year/);
  });

  it('should return the original variable if the regex does not match.', function() {
    assert.strictEqual(normalizeYear('1780'), 1780);
  });
});

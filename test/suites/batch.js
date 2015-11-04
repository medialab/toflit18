import assert from 'assert';
import Batch from '../../lib/batch';

describe('Neo4j Batches', function() {
  it('should be possible to save new nodes.', function() {
    const batch = new Batch();

    const dairy  = batch.save({name: 'Dairy products'}, ['ClassifiedItem', 'ClassifiedProduct']),
          milk   = batch.save({name: 'Milk'}, 'Item'),
          cheese = batch.save({name: 'Cheese'}, 'Item');

    batch.relate(dairy, 'AGGREGATES', milk);
    batch.relate(dairy, 'AGGREGATES', cheese);

    batch.commit();
  });
});

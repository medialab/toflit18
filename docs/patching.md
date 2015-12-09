# Classification Patching

## Rationale

Let's consider a classification as a list of item/group pairs. One item can only exist once in such a list, while groups may gather several items. When an item is not linked to a group (`null`), such item is said to float in limbo.

Classifications, as such, are reducers (max `n->n`) over a precise dataset (in TOFLIT18's case, over products and countries) and can recurse as many times as needed.

So, at level 0, a classification will aggregate items from the sources itself, while a classification at level 1 will simply aggregates groups from a lower classification.

The idea here is to enable a user to apply a patch (which can be a whole new version of a classification or merely a version of only a subset of the same classification) an existing classification while touching as little as possible the graph structure underlying the system and so upper classification may suffer the least amount of subsequent modifications.

## Process

1. Checking inconsistencies in the patch
  * Are some items referenced more than once?
2. Checking integrity of the patch
  * Are there extraneous items?
  * How many items are missing from the patch?
  * Are there some groups aggregating nothing? (TODO)
3. Solving the patch by finding every atomic actions performed by the patch
  * What groups were created?
  * What groups were renamed?
  * What items were moved (this includes items being dropped into limbo & former limbo items now aggregated by a group)
4. Applying the patch virtually
5. Rewire the n upper classifications accordingly

## Annex

### Checking a group was renamed

Let's consider a group `g` from a given classification and another group `pg` coming from the applied patch.

We'll say `g` was renamed into `pg`if and only if:

```
l(g ∩ pg) = l(pg)
```

That is to say if the set of `pg`'s items is identical or a superset of `g`'s items.

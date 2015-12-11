# Classification Patching

## Rationale

Let's consider a classification as a list of item/group pairs. One item can only exist once in such a list, while groups may gather several items. When an item is not linked to a group (`null`), such item is said to float in limbo.

Classifications, as such, are reducers (max `n->n`) over a precise dataset (in TOFLIT18's case, over products and countries) and can recurse as many times as needed.

So, at level 0, a classification will aggregate items from the sources itself, while a classification at level 1 will simply aggregates groups from a lower classification.

The idea here is to enable a user to apply a patch an existing classification. Such a patch can therefore apply over a whole classification, or just over a subset of said classification. The goal here is then to only perform the least amount of modification to the graph's structure underlying the classification's system so upper dependent classifications remain as consistent as possible.

## Process

1. Checking inconsistencies in the patch
  * Are some items referenced more than once?
2. Checking integrity of the patch
  * Are there extraneous items?
  * How many items are missing from the patch?
  * Are there some groups aggregating nothing?
3. Solving the patch by finding every atomic actions performed by the patch
  * What groups were created?
  * What groups were renamed?
  * What items were moved (this includes items being dropped into limbo & former limbo items now aggregated by a group)
4. Applying the patch virtually
5. Rewire the n upper classifications accordingly

## Annex

### Checking a group was renamed

Let's consider a group `g` from a given classification and another group `pg` coming from the applied patch.

We'll say `g` was renamed into `pg` if and only if:

```
length(g ∩ pg) = length(g)
```

That is to say if the set of `pg`'s items is identical to the set of `g`'s items or if the set of `pg`'s items is a superset of `g`'s items.

On the othe hand, with `rg` being `pg` minus the items that were added to a group (i.e. an item that was not aggregated in the classification before the patch)  we'll say a rename operation is "pure" if:

```
length(g ∪ rg) = length(g)
```

### Rewiring upper classifications

Let's consider a classification `C`, a patched classification `C'`, a classification `B` on which `C` is based and finally one of the n upper classifications `D`.

For each affected group `g` in `C` (a group is affected if it is the source or the target of any operation and isn't new):

1. Get the group `dg` aggregating `g` in `D`. If it does not exist, skip this `g`.
2. Get every `ags` groups from `D` aggregated by `dg` (such as `g ∈ ags`).
3. Create a set `S` gathering items from `B` aggregated by `ags` in `C`.
4. Create a set `S'` gathering items (minus those who had previously no existence in `C`) from `B` aggregated by `ags` in `C` + `C'`.
5. If `S` is strictly equal to `S'`
  * then the relevant links from `ags` to `C'` should exist.
  * else the relevant links from `ags` to `C'` should not exist.

Linking operations should be flagged so that users can decide what to do afterwards.

It should also be a good thing to check obsolete groups in `C'` (i.e. groups now aggregating no items).

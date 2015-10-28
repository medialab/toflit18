# Merging

## Possible operations:

* Create from n
* Fork from n
* Update n
* Delete (not prioritary)

## Considerations

The update operation is the only "complex" one.

### Update n

Steps to follow:

1. Check integrity of items
  1. If one of the items does not exist, we should warn the user
  2. Present coverage rates to the user so he can know if something went wrong
  3. Present the missing items
2. Perform a diff of both states (current & new)
  1. Detect add item to group
  2. Detect group rename
  3. Detect item move
  4. Detect add new group
3. Compute the impacts over the existing dependencies (only upper ones)
  1. Orphans in upper ones.

Additional info:

* Don't forget the notes.
* Check that the group aggregates something, else we drop it.
* Correctly apply the cleaning process.


### Create / Fork from n

* Show the user some stats about the classification about to be created.
* Particularly: the coverage rate and the unclassified items.

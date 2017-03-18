app.controller('controller.dashboard.report.genomic.history.detail',
['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'api.pogDataHistory', 'pog', 'entry', 'details', 'tags',
(_, $q, scope, $state, $mdDialog, $mdToast, $pog, $history, pog, entry, details, tags) => {

  scope.entry = entry;
  scope.details = details;
  scope.tags = tags;
  scope.tagSelected = entry.tags;
  scope.newEntry = details[entry.new];
  scope.previousEntry = details[entry.previous];
  scope.ignored = ['ident', 'dataVersion', 'createdAt', 'updatedAt', 'deletedAt'];
  scope.tagSearch = {
    selectedItem: null,
    searchText: null
  };

  scope.action = {
    revert: {
      disableButton: false,
      active: false,
      comment: ""
    },
    restore: {
      disableButton: false,
      active: false,
      comment: ""
    }
  };

  scope.test = "bar";

  scope.cancel = () => { $mdDialog.cancel() };

  scope.changeFields = [];

  scope.changed = (f) => { return (scope.changeFields.indexOf(f) > -1) };

  // Auto-complete search filter
  scope.tagSearch.filter = (query) => {

    let deferred = $q.defer();

    $history(pog.POGID).tag.search(query).then(
      (tags) => {
        deferred.resolve(tags);
      },
      (err) => {
        console.log('Unable to search for tags', err);
      }
    );
    return deferred.promise;
  };

  // Create new tag on API
  scope.newTag = (newTag) => {
    // Create new Tag
    $history(pog.POGID).tag.create({tag: newTag.tag}, entry.ident).then(
      (resp) => {
        // Need to find the tag we made, and replace it.
        let found = false;
        _.forEach(scope.tagSelected, (v,k) => {
          if(v.tag === resp.tag) {
            scope.tagSelected[k] = resp;
            found = true;
          }
        });

        if(!found) scope.tagSelected.push(resp);
        $mdToast.show($mdToast.simple().textContent('The tag has been added').position('bottom left'));
      },
      (err) => {
        console.log('Failed to create new tag');
      }
    );
  };

  // Remove tag on API
  scope.removeTag = (removed) => {
    let cachedTag = angular.copy(removed);

    $history(pog.POGID).tag.remove(removed.ident).then(
      (resp) => {
        let toast = $mdToast.simple()
          .textContent('The tag has been removed.')
          .action('Undo')
          .highlightAction(true)
          .highlightClass('md-acceent')
          .hideDelay(4000)
          .position('bottom left');

        $mdToast.show(toast).then(
          (undo) => {
            // Does the user want to undo?
            if(undo === 'ok') {
              // Add it again!
              scope.newTag({tag: cachedTag.tag});
            }
          } // end undo
        )
      },
      (err) => {
        console.log('Failed to create new tag');
      }
    );
  };


  // Revert the opened change
  scope.revert = () => {
    // Hit API
    $history(pog.POGID).revert(entry.ident, scope.action.revert.comment).then(
      (resp) => {
        // Add to history
        $mdDialog.hide({event: 'revert', data: resp});
      },
      (err) => {
        console.log('Failed to revert', err);
        $mdToast.show($mdToast.simple().textContent('Unable to revert the history entry').position('bottom left'));
      }
    );
  };

  // Restore entry
  scope.restore = () => {
    let cached = angular.copy(entry);
    $history(pog.POGID).restore(entry.ident, scope.action.restore.comment).then(
      (result) => {
        // Add to history
        $mdDialog.hide({event: 'restore', data: cached});
      },
      (err) => {
        $mdToast.show($mdToast.simple().textContent('Unable to restore the history event').position('bottom left'));
      }
    )

  };

  // Transform chip for auto complete
  scope.transformChip = (tag) => {
    // If it is an object, it's already a known chip
    if (angular.isObject(tag)) return tag;

    // Otherwise, create a new one
    return { tag: tag, type: 'new' }
  };


  // Search for changes
  let findChanges = (preVal, newVal) => {
    let ignored = ['dataVersion', 'createdAt', 'updatedAt', 'deletedAt'];
    _.forEach(preVal, (v, k) => {
      if(newVal[k] !== v && ignored.indexOf(k) === -1) {
        scope.changeFields.push(k);
      }
    });

  };

  // If it's a change map changes
  if(entry.type == 'change') {
    findChanges(scope.previousEntry, scope.newEntry);
  }


}]);

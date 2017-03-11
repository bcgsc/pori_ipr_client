app.controller('controller.dashboard.report.genomic.history.detail',
['_', '$q', '$scope', '$state', '$mdDialog', '$mdToast', 'api.pog', 'api.pogDataHistory', 'entry', 'details', 'tags',
(_, $q, scope, $state, $mdDialog, $mdToast, $pog, $history, entry, details, tags) => {

  scope.entry = entry;
  scope.details = details;
  scope.tags = tags;
  scope.newEntry = details[entry.new];
  scope.previousEntry = details[entry.previous];
  scope.ignored = ['ident', 'dataVersion', 'createdAt', 'updatedAt', 'deletedAt'];

  scope.cancel = () => {
    $mdDialog.cancel();
  };

  scope.changeFields = [];

  scope.changed = (f) => {
    console.log('Checking: ',f);
    return (scope.changeFields.indexOf(f) > -1);
  };

  let findChanges = (preVal, newVal) => {

    let ignored = ['dataVersion', 'createdAt', 'updatedAt', 'deletedAt'];

    _.forEach(preVal, (v, k) => {

      if(newVal[k] !== v && ignored.indexOf(k) === -1) {
        scope.changeFields.push(k);
      }
    });

  };

  if(entry.type == 'change') {
    findChanges(scope.previousEntry, scope.newEntry);
  }


}]);

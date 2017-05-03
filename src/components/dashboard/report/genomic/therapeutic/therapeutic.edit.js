app.controller('controller.dashboard.report.genomic.therapeutic.edit',
['_', '$q', '$scope', '$mdDialog', '$mdToast', 'api.complete', 'api.therapeuticOptions', 'api.knowledgebase', 'pog', 'report', 'entry', 'newEntry',
(_, $q, scope, $mdDialog, $mdToast, $complete, $therapeutic, $kb, pog, report, entry, newEntry) => {

  scope.tab = 'listing';
  scope.entry = (entry || { target: [], targetContext: null, biomarker: [], notes: null });
  scope.type = (entry) ? entry.type : newEntry;
  scope.create = (!newEntry);
  scope.bioMarkerContexts = [
    {entry: 'overexpressed', description:'a high fold-change alone is of significance'},
    {entry: 'underexpressed', description:'a low fold-change alone is of significance'},
    {entry: 'high percentile', description:'high percentile alone is of significance'},
    {entry: 'low percentile', description:'low percentile alone is of significance'},
    {entry: 'outlier high', description:'high outlier by both percentile and fold change'},
    {entry: 'outlier low', description:'low outlier by both percentile and fold change'},
    {entry: 'amp amplification', description:'(usually focal or extreme copy number)'},
    {entry: 'hom-del', description:'homozygous deletion (reviewed as real)'},
    {entry: 'copy gain', description:'any copy gain deemed significant'},
    {entry: 'copy loss', description:'any copy loss deemed significant'},
    {entry: 'LoF mutation', description:'loss-of-function mutation'},
    {entry: 'GoF mutation', description:'gain-of-function mutation'},
    {entry: 'SoF mutation', description:'switch-of-function mutation'},
    {entry: 'DN mutation', description:'dominant-negative mutation'},
    {entry: 'mutation', description:'significant mutation with no formal functional description'},
    {entry: 'structural variant', description:'any significant structural variant'},
    {entry: 'gene-fusion', description:'any significant gene fusion'},
    {entry: 'mutation signature', description:'any significant mutation signature (specify type in previous field)'},
    {entry: 'mutation burden', description:'any significant mutation burden'},
    {entry: 'high expression outlier', description: 'N/A'},
    {entry: 'low expression outlier', description: 'N/A'}
  ];

  scope.bioMarkerContexts = _.sortBy(scope.bioMarkerContexts, 'entry');

  scope.new = {
    biomarkerContextValue: null,
    biomarkerValue: null,
  };

  scope.removeBiomarkerContext = (marker, context) => {
    delete scope.entry.biomarker[marker].context.splice(context,1);
  };

  scope.removeBiomarker = (marker) => {
    delete scope.entry.biomarker.splice(marker,1);
  };

  scope.newBiomarkerContext = (marker) => {

    // New Biomarker Entry
    if(marker===null) {
      scope.entry.biomarker.push({entry: null, context: [scope.new.biomarkerContextValue]});
      scope.new.biomarkerContextValue = null; // Blank out!
      return;
    }

    if(scope.new.biomarkerContextValue === null) return;
    scope.entry.biomarker[marker].context.push(scope.new.biomarkerContextValue); // Add new entry
    scope.new.biomarkerContextValue = null; // Blank out!
  };

  scope.newBiomarker = () => {
    if(scope.new.biomarkerValue === null) return;
    scope.entry.biomarker.push({entry: scope.new.biomarkerValue, context: []});
    scope.new.biomarkerValue = null;
  };

  // Need to chipify the geneVar entries
  let targets = [];
  if(entry !== null) {
    _.forEach(entry.target, (e) => {
      if(e !== null) targets.push({entry: e});
    });
  }

  let biomarkers = [];
  // Transform chip for auto complete
  scope.transformChip = (geneVar) => {
    // If it is an object, it's already a known chip
    if (angular.isObject(geneVar)) return geneVar;

    // Otherwise, create a new one
    return { geneVar: geneVar, type: 'new' }
  };

  scope.geneVar = {};

  // Auto-complete search filter
  scope.geneVar.filter = (query) => {
    let deferred = $q.defer();
    if(query.length < 3) deferred.resolve([]);

    if(query.length >= 3) {
      $kb.genevar(query).then(
        (entries) => {
          deferred.resolve(entries);
        },
        (err) => {
          console.log('Unable to search for entries', err);
        }
      );
    }
    return deferred.promise;
  };

  scope.geneTarget = {};

  scope.geneTarget.filter = (query) => {
    return $q((resolve, reject) => {
      resolve([]);
    });
  };

  // Check, clean, and prepare save object
  scope.save = () => {

    let newTherapeutic = angular.copy(scope.entry);

    // De-objectify targets
    let targets = [];
    _.forEach(scope.entry.target, (v)=> {
      targets.push(v.geneVar);
    });

    newTherapeutic.target = targets;

    // Is this a new entry?
    if(newEntry !== false) {

      newTherapeutic.type = newEntry; // Set Type passed by creator

      // Save new entry
      $therapeutic.create(pog.POGID, report.ident, newTherapeutic).then(
        (result) => {
          // New entry created!
          $mdDialog.hide({status: 'create', data: result});
        },
        (err) => {
          console.log('Unable to create new entry!');
        }
      );
    } else {
      // Update existing entry
      $therapeutic.one(pog.POGID, report.ident, ).update(newTherapeutic.ident, newTherapeutic).then(
        (result) => {
          // New entry created!
          $mdDialog.hide({status: 'update', data: result});
        },
        (err) => {
          console.log('Unable to update entry!');
        }
      );
    }
  };

  // Remove Entry from DB
  scope.remove = () => {
    let removed = angular.copy(entry);
    $mdDialog.hide({status: 'deleted', data: {ident: removed.ident, type: removed.type}});
    /*
    $therapeutic.one(pog.POGID).remove(entry.ident).then(
      (result) => {
        console.log('Entry removed! within modal');
        // Entry removed!
        $mdDialog.hide({status: 'deleted', data: removedIdent});
      },
      (err) => {
        console.log('Unable to update entry!');
      }
    ); */
  };

  scope.cancel = () => {
    $mdDialog.cancel();
  }

}]); // End controller

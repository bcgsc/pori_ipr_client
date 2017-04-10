app.controller('knowledgebase.references',
['$rootScope', '$q', '_', '$scope', '$sanitize', '$mdDialog', '$mdToast', 'api.knowledgebase', 'references', 'ref_count', 'vocabulary',
($rootScope, $q, _, $scope, $sanitize, $mdDialog, $mdToast, $kb, references, ref_count, vocabulary) => {

  $scope.references = [];
  let filters = {};

  // Loop over references and process groups
  let processReferences = (references) => {
    _.forEach(references, (r, k) => {

      // Build Events Expression Object
      let refs = {ors: [], ands: []};

      // Split by OR first
      if (r.events_expression.indexOf('|') > -1) {

        // Take each or block and blow it into "and" groups
        _.forEach(r.events_expression.split('|'), (orGroup, i) => {

          // Are there any "and" operators?
          if (orGroup.indexOf('&') > -1) {
            // Explode!
            refs.ors[i] = orGroup.split('&');
          } else {
            refs.ors[i] = [orGroup];
          }

        });

      } else if (r.events_expression.indexOf('&') > -1) {
        refs.ands = r.events_expression.split('&');
      } else {
        refs.ors[0] = [r.events_expression];
      }

      r.events_expression = refs;


      r.disease_list = r.disease_list.split(';');
      r.context = r.context.split(';');

      // Add to array
      $scope.references.push(r);

    });
  };

  // Toggle Events Expression Dropper
  $scope.showEvExDropper = (ref) => {
    if(ref.events_expression.ors.length > 1 || ref.events_expression.ands.length > 1) ref.showEEs = !ref.showEEs;
  };

  // Toggle Dropper
  $scope.showDropper = (arr, toggle, sw) => {
    if(arr.length > 1) toggle[sw] = !toggle[sw];
  };

  // Determine if this reference has children
  $scope.hasChildren = (ref) => {
    return (ref.events_expression.ors.length > 1 || ref.events_expression.ands.length > 1);
  };

  // Open Filters Modal
  $scope.openFilters = ($event) => {
    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/knowledgebase/references/references.filter.html',
      locals: {
        filters: filters,
        vocabulary: vocabulary
      },
      clickOutToClose: false,
      controller: ['$q', '_', '$scope', '$mdDialog', 'vocabulary', ($q, _, scope, $mdDialog, vocabulary) => {
        scope.cancel = () => {
          $mdDialog.hide();
        };

        scope.vocabulary = vocabulary;

        // Transform chip for auto complete
        scope.transformChip = (disease) => {
          // If it is an object, it's already a known chip
          if (angular.isObject(disease)) return disease;

          // Otherwise, create a new one
          return { disease: disease, type: 'new' }
        };

        scope.disease = {};

        // Auto-complete search filter
        scope.disease.filter = (query) => {
          let deferred = $q.defer();
          if(query.length < 3) deferred.resolve([]);

          if(query.length >= 3) {
            $kb.diseaseOntology(query).then(
              (entries) => {
                deferred.resolve(entries);
              },
              (err) => {
                console.log('Unable to search for disease-ontology entries', err);
              }
            );
          }
          return deferred.promise;
        };

      }]
    });

  };

  let $paginate = {
    current: 1,         // current page
    limit: 100,         // # of records per page
    offset: 0,          // Current offset
    pages: 0,           // Total Pages
    records: ref_count.references, // Total References

    /**
     * Setup the page count
     */
    calcPages: () => {
      $paginate.pages = _.floor(parseInt(ref_count.references)/$paginate.limit);
    },

    /**
     * Pages to display
     *
     * @returns {object} - Returns object with min, max properties.
     */
    displayPages: () => {
      let min = ($paginate.current - 3 < 1) ? 1 : ($paginate.current - 3);
      let upperPad = (min < 3) ? (4-min) : 0;
      let max = ($paginate.current + (4+upperPad) > $paginate.pages) ? $paginate.pages : ($paginate.current + (4 + upperPad));
      let pages = [];

      for(let i=min; i < max; i++) {
        pages.push(i);
      }

      return pages;
    },

    /**
     * Next Page
     */
    nextPage: () => {

    },

    /**
     * Change Page
     */
    changePage: (target) => {

      $rootScope.showLoader = true;

      // Attempt to load the next page
      let startRecord = $paginate.limit * (target-1); // -1 as we're 0 based.

      $kb.references.all($paginate.limit, startRecord).then(
        (results) => {

          let rowsWindow = document.getElementById('kbViewerWindow');
          rowsWindow.scrollTop = 0;

          $scope.references = [];
          // Process References
          processReferences(results);

          $paginate.current = target;
          $rootScope.showLoader = false;
        },
        (err) => {

        }
      )
    }
  };

  processReferences(references);
  $paginate.calcPages();
  $scope.paginate = $paginate;

}]);
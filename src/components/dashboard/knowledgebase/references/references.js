app.controller('knowledgebase.references',
['$rootScope', '$q', '_', '$scope', '$sanitize', '$mdDialog', '$mdToast', 'api.knowledgebase', 'references', 'ref_count', 'vocabulary',
($rootScope, $q, _, $scope, $sanitize, $mdDialog, $mdToast, $kb, references, ref_count, vocabulary) => {

  $scope.references = [];

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
        filters: $paginate.filters,
        vocabulary: vocabulary
      },
      clickOutToClose: false,
      controller: 'knowledgebase.references.filter'
    }).then(
      // Save Filters
      (filters) => {
        $paginate.setFilters(filters); // Updated Filters
        $paginate.updateFilters(); // Refresh Pagination
      },
      // Cancel
      () => {

      }
    );
  };

  // Open Filters Modal
  $scope.openView = ($event, reference) => {
    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/knowledgebase/references/references.view.html',
      locals: {
        reference: reference
      },
      clickOutToClose: false,
      controller: 'knowledgebase.references.view'
    }).then(
      // Save Filters
      () => {
      },
      // Cancel
      () => {

      }
    );

  };

  let $paginate = {
    current: 1,         // current page
    limit: 100,         // # of records per page
    offset: 0,          // Current offset
    pages: 0,           // Total Pages
    records: ref_count.references, // Total References,
    filters: {},        // Filters

    /**
     * Setup the page count
     */
    calcPages: () => {
      $paginate.pages = _.ceil(parseInt($paginate.records)/$paginate.limit);
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
     * Update Count
     */
    updateCount: () => {
      $kb.references.count($paginate.filters).then(
        (count) => {
          $paginate.records = count.references;
          $paginate.calcPages(); // Recount Pages
        },
        (err) => {

        }
      )
    },

    /**
     * Set Filters
     *
     * @param {object} filters - Hashmap of filter query values
     */
    setFilters: (filters) => {
      let newFilters = {};
      _.forEach(filters, (value, filter) => {
        if(value.length > 0) newFilters[filter] = value;
      });

      // Did the user clear the filters?
      if(_.size(newFilters) === 0) return $paginate.filters = {};

      $paginate.filters = newFilters;

    },

    /**
     * Updated filters
     */
    updateFilters: () => {
      $paginate.updateCount();
      $paginate.changePage(1);
    },

    /**
     * Remove a filter
     *
     * @param {string} filter - The filter type to be spliced
     * @param {int} i - The array ID to be spliced
     */
    removeFilter: (filter, i) => {
      $paginate.filters[filter].splice(i,1);
      // If it's now empty, remove it
      if($paginate.filters[filter].length === 0) delete $paginate.filters[filter];
      $paginate.updateFilters(); // Refresh Pagination
    },

    /**
     * Change Page
     */
    changePage: (target) => {

      $rootScope.showLoader = true;

      // Attempt to load the next page
      let startRecord = $paginate.limit * (target-1); // -1 as we're 0 based.

      $kb.references.all($paginate.limit, startRecord, $paginate.filters).then(
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
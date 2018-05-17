app.controller('knowledgebase.references',
['$rootScope', '$q', '_', '$scope', '$sanitize', '$mdDialog', '$mdToast', '$kbUtils', 'api.knowledgebase', 'references', 'ref_count', 'vocabulary', '$http',
($rootScope, $q, _, $scope, $sanitize, $mdDialog, $mdToast, $kbUtils, $kb, references, ref_count, vocabulary, $http) => {

  $scope.references = [];
  $scope.externalMode = $rootScope._externalMode;

  $http.get('../assets/json/knowledgebaseGlossary.json')
  .then((glossary) => {
    $scope.glossary = glossary.data;
  });

  // Toggle Events Expression Dropper
  $scope.showEvExDropper = (ref) => {
    if(ref.events_expression_expanded.ors.length > 1 || ref.events_expression_expanded.ands.length > 1) ref.showEEs = !ref.showEEs;
  };

  // Toggle Dropper
  $scope.showDropper = (arr, toggle, sw) => {
    if(arr.length > 1) toggle[sw] = !toggle[sw];
  };

  // Determine if this reference has children
  $scope.hasChildren = (ref) => {
    return (ref.events_expression_expanded.ors.length > 1 || ref.events_expression_expanded.ands.length > 1);
  };

  $scope.threeLetter = (str) => {
    return str.substring(0,3);
  } ;
  
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

  $scope.search = {};
  $scope.search.go = () => {
    $paginate.filters.search = $scope.search.query;
    $paginate.refresh();
  };

  // Open Filters Modal
  $scope.openView = ($event, reference) => {
    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/knowledgebase/references/references.view.html',
      locals: {
        reference: reference,
        vocabulary: vocabulary,
        externalMode: $scope.externalMode
      },
      resolve: {
        history: ['$q', 'api.knowledgebase', ($q, $kb) => {
          return $kb.history('reference', reference.ident);
        }]
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
     * Refresh current page
     */
    refresh: () => {
      $paginate.changePage($paginate.current); // Trigger change page with current value
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

          // Process References
          $scope.references = $kbUtils.processReferences(results);

          $paginate.current = target;
          $rootScope.showLoader = false;
        },
        (err) => {

        }
      )
    }
  };

  /**
   * Open modal for new dialog
   *
   * @param $event
   */
  $scope.newReference = ($event) => {
    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/knowledgebase/references/references.edit.html',
      locals: {
        action: 'new',
        vocabulary: vocabulary,
        reference: {}
      },
      multiple: true,
      clickOutToClose: false,
      controller: 'knowledgebase.references.edit'
    }).then(
      // Save Filters
      (result) => {

        if(result.status === 'new') {
          // New Entry Added, refresh!
          $paginate.refresh();
          $mdToast.show($mdToast.simple({textContent: 'New entry successfully added'}))
        }

      },
      // Cancel
      () => {

      }
    );
  };

  /**
   * Open modal for glossary reference
   *
   * @param $event
   */
  $scope.showKBGlossary = ($event) => {

    let content = "<div class='content knowledgebase'>";
    content += "\t<div layout='row', class='kbTable header layout-row'>";
    content += "\t\t<div flex='20' class='flex-20'>term</div>";
    content += "\t\t<div flex='80' class='flex-80'>definition</div>";
    content += "\t\t<div class='spacer'></div>";
    content += "\t</div>";
    content += "\t<div layout='row', class='kbTable glossary-modal rows flex' flex='flex'>";

    _.each($scope.glossary, function (gloss) {
      content += "\t\t<div class='rowContainer'>";
      content += "\t\t\t<div layout='row', class='row layout-row'>";
      content += "\t\t\t\t<div flex=20 class='flex-20'>" + gloss.term + "</div>";
      content += "\t\t\t\t<div flex=80 class='flex-80'>" + gloss.definition + "</div>";
      content += "\t\t\t</div>";
      content += "\t\t</div>";
    })

    content += "\t</div>";
    content += "</div>";

    let alert = $mdDialog.show(
      $mdDialog.alert()
        .clickOutsideToClose(true)
        .title('Knowledgebase Glossary')
        .htmlContent(content)
        .ok('Close')
        .targetEvent($event)
    );

  };
  // Loop over references and process groups
  $scope.references = $kbUtils.processReferences(references);

  $paginate.calcPages();
  $scope.paginate = $paginate;

}]);
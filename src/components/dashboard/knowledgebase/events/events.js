app.controller('knowledgebase.events',
['$rootScope', '$q', '_', '$scope', '$sanitize', '$mdDialog', '$mdToast', '$kbUtils', 'api.knowledgebase', 'events', 'events_count',
($rootScope, $q, _, $scope, $sanitize, $mdDialog, $mdToast, $kbUtils, $kb, events, events_count) => {

  $scope.events = events;

  // Open Filters Modal
  $scope.openFilters = ($event) => {
    $mdDialog.show({
      targetEvent: $event,
      templateUrl: 'dashboard/knowledgebase/events/events.filter.html',
      locals: {
        filters: $paginate.filters,
      },
      clickOutToClose: false,
      controller: 'knowledgebase.events.filter'
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

  let $paginate = {
    current: 1,         // current page
    limit: 100,         // # of records per page
    offset: 0,          // Current offset
    pages: 0,           // Total Pages
    records: events_count.events, // Total References,
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
      $kb.events.count($paginate.filters).then(
        (count) => {
          $paginate.records = count.events;
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

      $kb.events.all($paginate.limit, startRecord, $paginate.filters).then(
        (results) => {

          let rowsWindow = document.getElementById('kbViewerWindow');
          rowsWindow.scrollTop = 0;

          // Process Events
          $scope.events = results;

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
      templateUrl: 'dashboard/knowledgebase/events/events.edit.html',
      locals: {
        action: 'new',
        event: {}
      },
      multiple: true,
      clickOutToClose: false,
      controller: 'knowledgebase.events.edit'
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

  $paginate.calcPages();
  $scope.paginate = $paginate;

}]);
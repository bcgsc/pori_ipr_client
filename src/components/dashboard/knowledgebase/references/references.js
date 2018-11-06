app.controller('knowledgebase.references', ['$rootScope', '$q', '_', '$scope', '$sanitize',
  '$mdDialog', '$mdToast', '$kbUtils', 'api.knowledgebase', 'references', 'ref_count', 'vocabulary',
  '$http', 'isExternalMode', '$async', ($rootScope, $q, _, $scope, $sanitize, $mdDialog, $mdToast, $kbUtils,
    $kb, references, refCount, vocabulary, $http, isExternalMode, $async) => {
    $scope.references = [];
    $scope.externalMode = isExternalMode;

    const $paginate = {
      current: 1, // current page
      limit: 100, // # of records per page
      offset: 0, // Current offset
      pages: 0, // Total Pages
      records: refCount.references, // Total References,
      filters: {}, // Filters

      /**
       * Setup the page count
       *
       * @returns {undefined}
       */
      calcPages: () => {
        $paginate.pages = _.ceil(parseInt($paginate.records) / $paginate.limit);
      },

      /**
       * Pages to display
       *
       * @returns {object} - Returns object with min, max properties.
       */
      displayPages: () => {
        const min = ($paginate.current - 3 < 1) ? 1 : ($paginate.current - 3);
        const upperPad = (min < 3) ? (4 - min) : 0;
        const max = ($paginate.current + (4 + upperPad) > $paginate.pages) ? $paginate.pages : ($paginate.current + (4 + upperPad));
        const pages = [];

        for (let i = min; i < max; i += 1) {
          pages.push(i);
        }

        return pages;
      },

      /**
       * Update Count
       *
       * @returns {undefined}
       */
      updateCount: $async(async () => {
        try {
          const count = await $kb.references.count($paginate.filters);
          $paginate.records = count.references;
          $paginate.calcPages(); // Recount Pages
        } catch (err) {
          $mdToast.showSimple(err);
        }
      }),

      /**
       * Set Filters
       *
       * @param {object} filters - Hashmap of filter query values
       *
       * @returns {undefined}
       */
      setFilters: (filters) => {
        const newFilters = {};
        _.forEach(filters, (value, filter) => {
          if (value.length > 0) newFilters[filter] = value;
        });

        // Did the user clear the filters?
        if (_.size(newFilters) === 0) {
          $paginate.filters = {};
        } else {
          $paginate.filters = newFilters;
        }
      },

      /**
       * Updated filters
       *
       * @returns {undefined}
       */
      updateFilters: () => {
        $paginate.updateCount();
        $paginate.changePage(1);
      },

      /**
       * Refresh current page
       *
       * @returns {undefined}
       */
      refresh: () => {
        $paginate.changePage($paginate.current); // Trigger change page with current value
      },

      /**
       * Remove a filter
       *
       * @param {string} filter - The filter type to be spliced
       * @param {int} i - The array ID to be spliced
       *
       * @returns {undefined}
       */
      removeFilter: (filter, i) => {
        $paginate.filters[filter].splice(i, 1);
        // If it's now empty, remove it
        if ($paginate.filters[filter].length === 0) delete $paginate.filters[filter];
        $paginate.updateFilters(); // Refresh Pagination
      },

      /**
       * Change Page
       *
       * @param {Number} target - page number to load in paginator
       *
       * @returns {undefined}
       */
      changePage: $async(async (target) => {
        $rootScope.showLoader = true;

        // Attempt to load the next page
        const startRecord = $paginate.limit * (target - 1); // -1 as we're 0 based.

        try {
          const refs = await $kb.references.all($paginate.limit, startRecord, $paginate.filters);

          const rowsWindow = document.getElementById('kbViewerWindow');
          rowsWindow.scrollTop = 0;

          // Process References
          $scope.references = $kbUtils.processReferences(refs);

          $paginate.current = target;
          $rootScope.showLoader = false;
        } catch (err) {
          $mdToast.showSimple(`There was an error switching pages: ${err}`);
          $rootScope.showLoader = false;
        }
      }),
    };

    $http.get('../assets/json/knowledgebaseGlossary.json')
      .then((glossary) => {
        $scope.glossary = _.sortBy(glossary.data, ['term']);
      });

    // Toggle Events Expression Dropper
    $scope.showEvExDropper = (ref) => {
      if (ref.events_expression_expanded.ors.length > 1 || ref.events_expression_expanded.ands.length > 1) ref.showEEs = !ref.showEEs;
    };

    // Toggle Dropper
    $scope.showDropper = (arr, toggle, sw) => {
      if (arr.length > 1) toggle[sw] = !toggle[sw];
    };

    // Determine if this reference has children
    $scope.hasChildren = (ref) => {
      return (ref.events_expression_expanded.ors.length > 1 || ref.events_expression_expanded.ands.length > 1);
    };

    $scope.threeLetter = (str) => {
      return str.substring(0, 3);
    };
  
    // Open Filters Modal
    $scope.openFilters = ($event) => {
      $mdDialog.show({
        targetEvent: $event,
        templateUrl: 'dashboard/knowledgebase/references/references.filter.html',
        locals: {
          filters: $paginate.filters,
          vocabulary: vocabulary,
        },
        clickOutToClose: false,
        controller: 'knowledgebase.references.filter',
      }).then(
      // Save Filters
        (filters) => {
          if (filters) {
            $paginate.setFilters(filters); // Updated Filters
            $paginate.updateFilters(); // Refresh Pagination
          }
        },
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
          isExternalMode: $scope.externalMode,
        },
        resolve: {
          history: ['$q', 'api.knowledgebase', ($q, $kb) => {
            return $kb.history('reference', reference.ident);
          }],
        },
        clickOutToClose: false,
        controller: 'knowledgebase.references.view',
      }).then(
      // Save Filters
        () => {
        },
        // Cancel
        () => {

        },
      );
    };

    /**
   * Open modal for new dialog
   *
   * @param {Object} $event - target event
   *
   * @returns {undefined}
   */
    $scope.newReference = ($event) => {
      $mdDialog.show({
        targetEvent: $event,
        templateUrl: 'dashboard/knowledgebase/references/references.edit.html',
        locals: {
          action: 'new',
          vocabulary: vocabulary,
          reference: {},
          isExternalMode: isExternalMode,
        },
        multiple: true,
        clickOutToClose: false,
        controller: 'knowledgebase.references.edit',
      }).then(
      // Save Filters
        (result) => {
          if (result.status === 'new') {
          // New Entry Added, refresh!
            $paginate.refresh();
            $mdToast.show($mdToast.simple({ textContent: 'New entry successfully added' }));
          }
        },
      );
    };

    /**
   * Open modal for glossary reference
   *
   * @param {Object} $event - target event
   *
   * @returns {undefined}
   */
    $scope.showKBGlossary = ($event) => {
      let content = '<div class=\'content knowledgebase\'>';
      content += '\t<div layout=\'row\', class=\'kbTable header layout-row\'>';
      content += '\t\t<div flex=\'20\' class=\'flex-20\'>term</div>';
      content += '\t\t<div flex=\'80\' class=\'flex-80\'>definition</div>';
      content += '\t\t<div class=\'spacer\'></div>';
      content += '\t</div>';
      content += '\t<div layout=\'row\', class=\'kbTable glossary-modal rows flex\' flex=\'flex\'>';

      _.each($scope.glossary, (gloss) => {
        content += '\t\t<div class=\'rowContainer\'>';
        content += '\t\t\t<div layout=\'row\', class=\'row layout-row\'>';
        content += `\t\t\t\t<div flex=20 class='flex-20'>${gloss.term}</div>`;
        content += `\t\t\t\t<div flex=80 class='flex-80'>${gloss.definition}</div>`;
        content += '\t\t\t</div>';
        content += '\t\t</div>';
      });

      content += '\t</div>';
      content += '</div>';

      $mdDialog.show(
        $mdDialog.alert()
          .clickOutsideToClose(true)
          .title('Knowledgebase Glossary')
          .htmlContent(content)
          .ok('Close')
          .targetEvent($event),
      );
    };
    // Loop over references and process groups
    $scope.references = $kbUtils.processReferences(references);

    $paginate.calcPages();
    $scope.paginate = $paginate;
  }]);

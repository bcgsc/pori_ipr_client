/**
 * uiBreadcrumbs automatic breadcrumbs directive for AngularJS & Angular ui-router.
 *
 * https://github.com/michaelbromley/angularUtils/tree/master/src/directives/uiBreadcrumbs
 */

app.directive('uiBreadcrumbs', ['$interpolate', '$state', '$transitions', ($interpolate, $state, $transitions) => {
  return {
    restrict: 'E',
    templateUrl: (elem, attrs) => {
      return attrs.templateUrl || templateUrl;
    },
    scope: {
      displaynameProperty: '@',
      abstractProxyProperty: '@?',
    },
    link: (scope) => {
      scope.dataProxy = scope.abstractProxyProperty.split('.')[1];
      scope.breadcrumbs = [];
      if ($state.$current.name !== '') {
        updateBreadcrumbsArray();
      }
      $transitions.onSuccess({ }, () => {
        updateBreadcrumbsArray();
      });

      /**
       * Start with the current state and traverse up the path to build the
       * array of breadcrumbs that can be used in an ng-repeat in the template.
       */
      function updateBreadcrumbsArray() {
        let workingState;
        let displayName;
        const breadcrumbs = [];
        let currentState = $state.$current;

        while (currentState && currentState.name !== '') {
          workingState = getWorkingState(currentState);
          if (workingState) {
            displayName = getDisplayName(workingState);

            if (displayName !== false && !stateAlreadyInBreadcrumbs(workingState, breadcrumbs)) {
              let proxyState = workingState.data[scope.dataProxy];

              // If the proxy state is a function, pass in $state and receive string back
              if (workingState.data && workingState.data[scope.dataProxy] && typeof workingState.data[scope.dataProxy] === 'function') {
                proxyState = workingState.data[scope.dataProxy]($state);
              }

              breadcrumbs.push({
                displayName: displayName,
                route: (workingState.data && workingState.data[scope.dataProxy]) ? proxyState : workingState.name,
              });
            }
          }
          currentState = currentState.parent;
        }
        breadcrumbs.reverse();
        scope.breadcrumbs = breadcrumbs;
      }

      /**
       * Get the state to put in the breadcrumbs array, taking into account that if the current state is abstract,
       * we need to either substitute it with the state named in the `scope.abstractProxyProperty` property, or
       * set it to `false` which means this breadcrumb level will be skipped entirely.
       * @param currentState
       * @returns {*}
       */
      function getWorkingState(currentState) {
        let proxyStateName;
        let workingState = currentState;
        if (currentState.abstract === true) {
          if (typeof scope.abstractProxyProperty !== 'undefined') {
            proxyStateName = getObjectValue(scope.abstractProxyProperty, currentState);
            if (proxyStateName) {
              workingState = angular.copy($state.get(proxyStateName));
              if (workingState) {
                workingState.locals = currentState.locals;
              }
            } else {
              workingState = false;
            }
          } else {
            workingState = false;
          }
        }
        return workingState;
      }

      /**
       * Resolve the displayName of the specified state. Take the property specified by the `displayname-property`
       * attribute and look up the corresponding property on the state's config object. The specified string can be interpolated against any resolved
       * properties on the state config object, by using the usual {{ }} syntax.
       * @param currentState
       * @returns {*}
       */
      function getDisplayName(currentState) {
        if (!scope.displaynameProperty) {
          // if the displayname-property attribute was not specified, default to the state's name
          return currentState.name;
        }
        const propertyReference = getObjectValue(scope.displaynameProperty, currentState);

        if (propertyReference === false) {
          return false;
        }
        if (typeof propertyReference === 'undefined') {
          return currentState.name;
        }
        // use the $interpolate service to handle any bindings in the propertyReference string.
        const interpolationContext =  (typeof currentState.locals !== 'undefined') ? currentState.locals.globals : currentState;
        const displayName = $interpolate(propertyReference)(interpolationContext);
        return displayName;
      }

      /**
       * Given a string of the type 'object.property.property', traverse the given context (eg the current $state object) and return the
       * value found at that path.
       *
       * @param objectPath
       * @param context
       * @returns {*}
       */
      function getObjectValue(objectPath, context) {
        let i;
        const propertyArray = objectPath.split('.');
        let propertyReference = context;

        for (i = 0; i < propertyArray.length; i += 1) {
          if (angular.isDefined(propertyReference[propertyArray[i]])) {
            propertyReference = propertyReference[propertyArray[i]];

            if (typeof propertyReference === 'function') {
              propertyReference = propertyReference($state);
            }
          } else {
            // if the specified property was not found, default to the state's name
            return undefined;
          }
        }
        return propertyReference;
      }

      /**
       * Check whether the current `state` has already appeared in the current breadcrumbs array. This check is necessary
       * when using abstract states that might specify a proxy that is already there in the breadcrumbs.
       * @param state
       * @param breadcrumbs
       * @returns {boolean}
       */
      function stateAlreadyInBreadcrumbs(state, breadcrumbs) {
        let i;
        let alreadyUsed = false;
        for (i = 0; i < breadcrumbs.length; i += 1) {
          if (breadcrumbs[i].route === state.name) {
            alreadyUsed = true;
          }
        }
        return alreadyUsed;
      }
    },
  };
}]);

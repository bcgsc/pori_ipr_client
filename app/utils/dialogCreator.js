const dialogCreator = ({
  $event, text, title, actions,
}) => ({
  targetEvent: $event,
  clickOutsideToClose: true,
  parent: angular.element(document.body),
  locals: {
    actions,
  },
  controllerAs: '$ctrl',
  bindToController: true,
  template: `
    <md-dialog flex="40">
      <md-toolbar class="md-toolbar-tools">
        ${title}
      </md-toolbar>
      <md-dialog-content class="layout-padding">
        <div>
          ${text}
        </div>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-accent" ng-repeat="action in $ctrl.actions" ng-click="action.click()">
          {{action.text}}
        </md-button>
      </md-dialog-actions>
    </md-dialog>
  `,
  controller: ['scope', (scope) => {
    scope.hide = () => this.$mdDialog.hide();
    scope.ok = () => this.$mdDialog.close();
  }],
});

export default dialogCreator;

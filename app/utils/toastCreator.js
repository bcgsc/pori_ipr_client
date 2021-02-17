const toastCreator = (message) => ({
  parent: angular.element(document.body),
  template: `
    <md-toast>
      <div class="md-toast-content">${message}</div>
    </md-toast>
  `,
  toastClass: 'toast--bottom-left',
});

export default toastCreator;

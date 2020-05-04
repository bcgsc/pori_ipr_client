import './feedback.scss';

const feedbackController = ($scope, $mdDialog) => {
  'ngInject';

  $scope.cancel = () => {
    $mdDialog.hide();
  };
};

export default feedbackController;

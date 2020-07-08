import './index.scss';

const feedbackController = ($scope, $mdDialog) => {
  $scope.cancel = () => {
    $mdDialog.hide();
  };
};

feedbackController.$inject = ['$scope', '$mdDialog'];

export default feedbackController;

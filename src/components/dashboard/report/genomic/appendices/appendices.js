app.controller('controller.dashboard.report.genomic.appendices',
  ['_', '$q', '$scope', 'api.pog', '$mdDialog', '$mdToast', 'pog', 'tcgaAcronyms',
    (_, $q, $scope, $pog, $mdDialog, $mdToast, pog, tcga) => {

      $scope.pog = pog;
      $scope.tcga = tcga;

      $scope.hashClean = (i) => {
        return i.replace('#','');
      }

    }
  ]
);

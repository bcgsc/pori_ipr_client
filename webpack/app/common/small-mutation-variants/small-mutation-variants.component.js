import template from './small-mutation-variants.pug';
import dataTemplate from './data-viewer.pug';
import vardbTemplate from './vardb-libraries.pug';
import './data-viewer.scss';

const bindings = {
  mutations: '<',
  pog: '<',
  report: '<',
};

class SmallMutationVariantsComponent {
  /* @ngInject */
  constructor($mdDialog) {
    this.$mdDialog = $mdDialog;
  }

  /* eslint-disable-next-line class-methods-use-this */
  copyFilter(copyChange) {
    if (copyChange) {
      return (copyChange === 'na') ? 'na' : copyChange.match(/(((\+|-)?)[0-9]{1,2})/g)[0];
    }
    return null;
  }

  openDialog($event, $index) {
    this.$mdDialog.show({
      clickOutsideToClose: true,
      targetEvent: $event,
      template: dataTemplate,
      controller: ['$scope', ($scope) => {
        // Ignored columns
        const ignored = ['ident', 'id', 'pog_id'];

        $scope.mutations = _.omit(this.mutations[$index], ignored);

        $scope.cancel = () => {
          this.$mdDialog.cancel();
        };
      }],
    });
  }

  // Currently broken, fix later when vardb is integrated. DONT JUST REMOVE THIS
  // vardbVarLib($event, mutation) {
  //   const variant = {
  //     chromosome: mutation.location.split(':')[0],
  //     position: mutation.location.split(':')[1],
  //     ref: mutation.refAlt.split('>')[0],
  //     alt: mutation.refAlt.split('>')[1],
  //   };

  //   // Prepare mutation for VarDB Lookup=
  //   this.$mdDialog.show({
  //     targetEvent: $event,
  //     clickOutsideToClose: true,
  //     locals: {
  //       variant,
  //       mutation,
  //     },
  //     template: vardbTemplate,
  //     controller: ['scope', '$mdDialog', '$timeout', 'api.vardb', 'variant', 'mutation', ($this, $mdDialog, $timeout, $vardb, variant, mutation) => {

  //       $this.libraries = [];
  //       $this.loading = true;
  //       $this.mutation = mutation;
  //       $this.step = 0;

  //       // Find libraries with alternate base
  //       $vardb.variantLibraries(variant.chromosome, variant.position, variant.ref, variant.alt).then(
  //         (vardbLibs) => {
  //           // Create response object
  //           let response = {
  //             libraries: [],
  //             total: vardbLibs.total_pog_libraries
  //           };

  //           $this.step = 1;
  //           $timeout(() => { $this.step = 2}, 1000);

  //           // Get Library Meta Data
  //           $vardb.libraryMeta(vardbLibs.libraries).then(
  //             (meta) => {
  //               response.libraries = meta;

  //               $this.loading = false;
  //               $this.libraries = response.libraries;

  //               console.log('Libraries', $this.libraries);
  //               console.log('libraries', vardbLibs);


  //             },
  //             (err) => {
  //               console.log('Unable to get POG libraries', err);
  //             }
  //           )

  //         },
  //         (err) => {
  //           console.log('Unable to get libaries with variant', err);
  //         }
  //       );


  //       $this.cancel = () => {
  //         $mdDialog.hide();
  //       };

  //     }]
  //   });
  // };
}

export default {
  template,
  bindings,
  controller: SmallMutationVariantsComponent,
};

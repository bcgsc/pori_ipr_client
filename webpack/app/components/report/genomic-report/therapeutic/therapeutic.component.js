import template from './therapeutic.pug';
import editTemplate from './therapeutic-edit.pug';
import editController from './therapeutic-edit';
import './therapeutic.scss';

const bindings = {
  pog: '<',
  report: '<',
  reportEdit: '<',
  therapeutic: '<',
};

class TherapeuticComponent {
  /* @ngInject */
  constructor($scope, $state, $mdDialog, $mdToast, PogService, TherapeuticService) {
    this.$scope = $scope;
    this.$state = $state;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.PogService = PogService;
    this.TherapeuticService = TherapeuticService;
  }

  $onInit() {
    this.therapeuticGrouped = {
      therapeutic: [],
      chemoresistance: [],
    };
    this.rowOptions = [];
    // Sort into groups
    this.groupTherapeutics = () => {
      this.therapeutic.forEach((value) => {
        if (value.type === 'therapeutic') {
          const targets = [];
          Object.values(value.target).forEach((type) => {
            targets.push((angular.isObject(type)) ? type : { geneVar: type });
          });
          value.target = targets;
          this.therapeuticGrouped.therapeutic.push(value);
        }
        if (value.type === 'chemoresistance') {
          this.therapeuticGrouped.chemoresistance.push(value);
        }
      });
    };

    this.cleanTargets = (targets) => {
      const newTargets = [];
      Object.values(targets).forEach((type) => {
        newTargets.push((angular.isObject(type)) ? type : { geneVar: type });
      });
      return newTargets;
    };

    this.groupTherapeutics();
  }

  // Edit Therapeutic Targets
  async edit($event, entry) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        clickOutsideToClose: false,
        locals: {
          newEntry: false,
          entry,
          pog: this.pog,
          report: this.report,
        },
        template: editTemplate,
        controller: editController,
        controllerAs: '$ctrl',
      });
      // If an existing entry was updated
      if (resp.status === 'updated') {
        const { data } = resp;

        if (data.type === 'therapeutic') {
          data.target = this.cleanTargets(data.target);
        }
        // Loop over entries in type, find matching ident, and replace
        Object.entries(this.therapeuticGrouped[data.type]).forEach(([value, key]) => {
          if (value.ident === data.ident) {
            this.therapeuticGrouped[data.type][key] = value;
          }
        });
        this.$mdToast.show(this.$mdToast.simple({ textContent: 'Changes saved' }));
      }
      // Removing an entry
      if (resp.status === 'deleted') {
        const { data } = resp;
        this.therapeuticGrouped[data.type] = this.therapeuticGrouped[data.type].filter((type) => {
          return (type.ident !== data.ident);
        });
        this.$mdToast.show(this.$mdToast.simple({ textContent: 'The entry has been removed' }));
      }
    } catch (err) {
      this.$mdToast.show(this.$mdToast.simple({ textContent: 'No changes were made.' }));
    }
  }


  async newEntry($event, type) {
    // Create new entry by type
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        clickOutsideToClose: false,
        locals: {
          newEntry: type,
          entry: false,
          pog: this.pog,
          report: this.report,
        },
        template: editTemplate,
        controller: editController,
        controllerAs: '$ctrl',
      });
      const { data } = resp;
      // If therapeutic
      if (data.type === 'therapeutic') {
        data.target = this.cleanTargets(data.target);
        this.therapeuticGrouped.therapeutic.push(data);
      }
      if (data.type === 'chemoresistance') {
        this.therapeuticGrouped.chemoresistance.push(data);
      }
      this.$mdToast.show(this.$mdToast.simple({ textContent: 'New entry saved' }));
    } catch (err) {
      this.$mdToast.show(this.$mdToast.simple({ textContent: 'No changes were made' }));
    }
  }

  // Order updated
  async updateSorting($partTo) {
    // Loop over each and update their positions
    const updates = [];

    // Update Each Entry
    $partTo.forEach((entry, index) => {
      entry.rank = index;
      updates.push(
        this.TherapeuticService.update(this.pog.POGID, this.report.ident, entry.ident, entry),
      );
    });

    try {
      await Promise.all(updates);
      this.$mdToast.show(this.$mdToast.simple().textContent('Changed order saved'));
    } catch (err) {
      this.$mdToast.show(this.$mdToast.simple().textContent('Unable to save the updated order'));
    } finally {
      this.$scope.$digest();
    }
  }
}

/* Must not be $ctrl due to angular-sortable-view overwriting $ctrl >_> */
/* https://github.com/kamilkp/angular-sortable-view/issues/96 */
export default {
  template,
  bindings,
  controllerAs: 'vm',
  controller: TherapeuticComponent,
};

import template from './therapeutic.pug';
import editTemplate from './therapeutic-edit.pug';
import editController from './therapeutic-edit';
import './therapeutic.scss';

const bindings = {
  pog: '<',
  report: '<',
  therapeutic: '<',
};

class TherapeuticComponent {
  /* @ngInject */
  constructor($scope, $state, $mdDialog, $mdToast, PogService, TherapeuticService, AclService) {
    this.$scope = $scope;
    this.$state = $state;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.PogService = PogService;
    this.TherapeuticService = TherapeuticService;
    this.AclService = AclService;
  }

  $onInit() {
    this.therapeuticGrouped = {
      therapeutic: [],
      chemoresistance: [],
    };
    this.rowOptions = [];
    // Sort into groups
    this.groupTherapeutics = () => {
      _.forEach(this.therapeutic, (v) => {
        if (v.type === 'therapeutic') {
          const targets = [];
          _.forEach(v.target, (e) => {
            targets.push((angular.isObject(e)) ? e : { geneVar: e });
          });
          v.target = targets;
          this.therapeuticGrouped.therapeutic.push(v);
        }
        if (v.type === 'chemoresistance') {
          this.therapeuticGrouped.chemoresistance.push(v);
        }
      });
    };

    this.cleanTargets = (targets) => {
      const newTargets = [];
      _.forEach(targets, (e) => {
        newTargets.push((angular.isObject(e)) ? e : { geneVar: e });
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
        _.forEach(this.therapeuticGrouped[data.type], (e, i) => {
          if (e.ident === data.ident) {
            this.therapeuticGrouped[data.type][i] = e;
          }
        });
        this.$mdToast.show(this.$mdToast.simple({ textContent: 'Changes saved' }));
      }
      // Removing an entry
      if (resp.status === 'deleted') {
        const { data } = resp;
        _.remove(this.therapeuticGrouped[data.type], (e) => {
          return (e.ident === data.ident);
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
    _.forEach($partTo, (e, i) => {
      e.rank = i;
      updates.push(this.TherapeuticService.update(this.pog.POGID, this.report.ident, e.ident, e));
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

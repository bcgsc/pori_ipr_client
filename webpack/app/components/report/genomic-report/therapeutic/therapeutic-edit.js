import { sortBy } from 'lodash-es';

class TherapeuticEditController {
  /* @ngInject */
  constructor($scope, $mdDialog, $mdToast, TherapeuticService, KnowledgebaseService,
    pog, report, entry, newEntry) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.TherapeuticService = TherapeuticService;
    this.KnowledgebaseService = KnowledgebaseService;
    this.pog = pog;
    this.report = report;
    this.entry = entry;
    this.newEntry = newEntry;
  }

  $onInit() {
    this.tab = 'listing';
    this.entry = (this.entry || {
      target: [], targetContext: null, biomarker: [], notes: null,
    });
    this.type = (this.entry) ? this.entry.type : this.newEntry;
    this.create = (!this.newEntry);
    this.bioMarkerContexts = [
      { entry: 'overexpressed', description: 'a high fold-change alone is of significance' },
      { entry: 'underexpressed', description: 'a low fold-change alone is of significance' },
      { entry: 'high percentile', description: 'high percentile alone is of significance' },
      { entry: 'low percentile', description: 'low percentile alone is of significance' },
      { entry: 'outlier high', description: 'high outlier by both percentile and fold change' },
      { entry: 'outlier low', description: 'low outlier by both percentile and fold change' },
      { entry: 'amplification', description: '(usually focal or extreme copy number)' },
      { entry: 'hom-del', description: 'homozygous deletion (reviewed as real)' },
      { entry: 'copy gain', description: 'any copy gain deemed significant' },
      { entry: 'copy loss', description: 'any copy loss deemed significant' },
      { entry: 'LoF mutation', description: 'loss-of-function mutation' },
      { entry: 'GoF mutation', description: 'gain-of-function mutation' },
      { entry: 'SoF mutation', description: 'switch-of-function mutation' },
      { entry: 'DN mutation', description: 'dominant-negative mutation' },
      { entry: 'mutation', description: 'significant mutation with no formal functional description' },
      { entry: 'structural variant', description: 'any significant structural variant' },
      { entry: 'gene-fusion', description: 'any significant gene fusion' },
      { entry: 'mutation signature', description: 'any significant mutation signature (specify type in previous field)' },
      { entry: 'mutation burden', description: 'any significant mutation burden' },
      { entry: 'high expression outlier', description: 'N/A' },
      { entry: 'low expression outlier', description: 'N/A' },
      { entry: 'wildtype', description: 'N/A' },
    ];

    this.bioMarkerContexts = sortBy(this.bioMarkerContexts, 'entry');

    this.new = {
      biomarkerContextValue: null,
      biomarkerValue: null,
    };

    this.searchTextTarget = '';
    this.searchTextPathway = '';
    this.selectedItem = '';
  }


  removeBiomarkerContext(marker, context) {
    delete this.entry.biomarker[marker].context.splice(context, 1);
  }

  removeBiomarker(marker) {
    delete this.entry.biomarker.splice(marker, 1);
  }

  newBiomarkerContext(marker) {
    if (marker === null) {
      this.entry.biomarker.push({ entry: null, context: [this.new.biomarkerContextValue] });
      this.new.biomarkerContextValue = null; // Blank out!
    } else if (this.new.biomarkerContextValue
        && !this.entry.biomarker[marker].context.includes(this.new.biomarkerContextValue)
    ) {
      this.entry.biomarker[marker].context.push(this.new.biomarkerContextValue); // Add new entry
      this.new.biomarkerContextValue = null; // Blank out!
    } else {
      this.new.biomarkerContextValue = null;
    }
  }

  newBiomarker() {
    if (this.new.biomarkerValue) {
      this.entry.biomarker.push({ entry: this.new.biomarkerValue, context: [] });
      this.new.biomarkerValue = null;
    }
  }

  // Transform chip for auto complete
  /* eslint-disable class-methods-use-this */
  transformChip($chip) {
    // If it is an object, it's already a known chip
    if (angular.isObject($chip)) {
      return $chip;
    }

    // Otherwise, create a new one
    return { geneVar: $chip, type: 'new' };
  }

  // Auto-complete search filter
  async varFilter(query) {
    let filteredEntries = await this.KnowledgebaseService.getGenevar(query);
    if (query.length < 3) {
      filteredEntries = this.entries.filter((entry) => {
        return (entry.length < 3);
      });
    }
    return filteredEntries;
  }

  /* eslint-disable class-methods-use-this */
  async targetFilter(query) {
    return [];
  }

  // Check, clean, and prepare save object
  async save() {
    const newTherapeutic = angular.copy(this.entry);
    // De-objectify targets
    const targets = [];
    this.entry.target.forEach((value) => {
      targets.push(value.geneVar);
    });
    newTherapeutic.target = targets;

    // Is this a new entry?
    if (this.newEntry) {
      newTherapeutic.type = this.newEntry; // Set Type passed by creator
      // Save new entry
      const resp = await this.TherapeuticService.create(
        this.pog.POGID, this.report.ident, newTherapeutic,
      );
      // New entry created!
      this.$mdDialog.hide({ status: 'create', data: resp });
    } else {
      // Update existing entry
      const resp = await this.TherapeuticService.update(
        this.pog.POGID, this.report.ident, newTherapeutic.ident, newTherapeutic,
      );
      this.$mdDialog.hide({ status: 'updated', data: resp });
    }
    this.$scope.$digest();
  }

  // Remove Entry from DB
  async remove() {
    const removed = angular.copy(this.entry);
    this.$mdDialog.hide({
      status: 'deleted',
      data: {
        ident: removed.ident, type: removed.type,
      },
    });

    const resp = await this.TherapeuticService.remove(
      this.pog.POGID, this.report.ident, this.entry.ident,
    );
    this.$mdDialog.hide({ status: 'deleted', data: resp });
  }

  cancel() {
    this.$mdDialog.cancel();
  }
}

export default TherapeuticEditController;

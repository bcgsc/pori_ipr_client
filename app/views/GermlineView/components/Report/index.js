import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import { getUser } from '@/services/management/auth';
import toastCreator from '@/utils/toastCreator';
import dialogCreator from '@/utils/dialogCreator';
import lazyInjector from '@/lazyInjector';
import GermlineService from '@/services/reports/germline.service';
import template from './germline-report.pug';
import inputTemplate from './germline-report-input.pug';
import './index.scss';

const bindings = {
  history: '<',
};

class Report {
  constructor($mdDialog, $mdToast) {
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
  }

  async $onInit() {
    this.reportIdent = this.history.location.pathname.split('/').pop();
    this.user = await getUser();
    this.report = await GermlineService.getReport(this.reportIdent);
    this.addReview = false;
    this.showExtended = false;
    this.columns = {
      flagged: {
        name: 'Flagged',
        width: 100,
        showAlways: true,
        split: ',',
      },
      clinvar: {
        name: 'ClinVar',
        width: 100,
      },
      cgl_category: {
        name: 'CGL Category',
        width: 100,
        showAlways: false,
      },
      gmaf: {
        name: 'GMAF',
        width: 100,
        showAlways: true,
      },
      transcript: {
        name: 'Trancript',
        width: 100,
        showAlways: true,
      },
      gene: {
        name: 'Gene',
        width: 100,
        showAlways: true,
      },
      variant: {
        name: 'Variant',
        width: 100,
        showAlways: true,
      },
      impact: {
        name: 'Impact',
        width: 100,
        showAlways: true,
      },
      chromosome: {
        name: 'Chr',
        width: 40,
        showAlways: true,
      },
      position: {
        name: 'Pos',
        width: 100,
        showAlways: true,
      },
      dbSNP: {
        name: 'dbSNP',
        width: 100,
        showAlways: true,
      },
      reference: {
        name: 'Ref',
        width: 40,
        showAlways: true,
      },
      alteration: {
        name: 'Alt',
        width: 40,
        showAlways: true,
      },
      score: {
        name: 'Score',
        width: 50,
        showAlways: true,
      },
      zygosity_germline: {
        name: 'Zygosity in germline',
        width: 100,
        showAlways: true,
      },
      preferred_transcript: {
        name: 'Preferred Transcript',
        width: 150,
        showAlways: true,
      },
      hgvs_cdna: {
        name: 'HGVS-cDNA',
        width: 100,
        showAlways: true,
      },
      hgvs_protein: {
        name: 'HGVS-protein',
        width: 100,
        showAlways: true,
      },
      zygosity_tumour: {
        name: 'Zygosity in tumour',
        width: 100,
        showAlways: true,
      },
      genomic_variant_reads: {
        name: 'Genomic variant reads ',
        tooltip: '(alt/total)',
        width: 120,
        showAlways: false,
      },
      rna_variant_reads: {
        name: 'RNA variant reads',
        tooltip: '(alt/total)',
        width: 120,
        showAlways: false,
      },
      gene_somatic_abberation: {
        name: 'Gene somatic aberration?',
        width: 100,
        showAlways: false,
      },
      notes: {
        name: 'Notes',
        width: 100,
        showAlways: true,
      },
      type: {
        name: 'Type',
        width: 100,
        showAlways: true,
      },
      patient_history: {
        name: 'Patient History',
        width: 100,
        showAlways: true,
      },
      family_history: {
        name: 'Family History',
        width: 100,
        showAlways: true,
      },
      tcga_comp_norm_percentile: {
        name: 'tcga_comp_norm_percentile',
        width: 100,
        showAlways: false,
      },
      tcga_comp_percentile: {
        name: 'tcga_comp_percentile',
        width: 200,
        showAlways: false,
      },
      gtex_comp_percentile: {
        name: 'gtex_comp_average_percentile',
        width: 200,
        showAlways: false,
      },
      fc_bodymap: {
        name: 'fc_bodymap',
        width: 100,
        showAlways: false,
      },
      gene_expression_rpkm: {
        name: 'Gene Expression RPKM',
        width: 100,
        showAlways: true,
      },
      additional_info: {
        name: 'Additional Info',
        width: 100,
        showAlways: false,
      },
    };
    $rootScope.$digest();
  }

  /* eslint-disable class-methods-use-this */
  hasReview(report, type) {
    return report.reviews.find(review => review.type === type);
  }


  async getHistory($event, mode, v) {
    const input = {
      value: v,
      mode,
    };

    if (mode === 'patient') {
      input.name = 'Patient History';
      input.placeholder = 'Patient History';
    }
    if (mode === 'family') {
      input.name = 'Patient History';
      input.placeholder = 'Family History';
    }

    const resp = await this.$mdDialog.show({
      template: inputTemplate,
      targetEvent: $event,
      clickOutsideToClose: true,
      parent: angular.element(document.body),
      controller: ['scope', async (scope) => {
        scope.input = input;

        scope.cancel = async () => {
          await this.$mdDialog.cancel();
        };

        scope.submit = async () => {
          await this.$mdDialog.hide(input);
        };
      }],
    });
    const updatedVariant = {};

    if (mode === 'patient') {
      this.report.variants.forEach((variant) => {
        variant.patient_history = resp.value;
        updatedVariant.patient_history = resp.value;
      });
    }
    if (mode === 'family') {
      this.report.variants.forEach((variant) => {
        variant.family_history = resp.value;
        updatedVariant.family_history = resp.value;
      });
    }

    await Promise.all(
      this.report.variants.map(variant => GermlineService.updateVariant(
        this.report.ident,
        variant.ident,
        updatedVariant,
      )),
    );
    this.$mdToast.show(toastCreator('Report has been updated.'));
  }

  async review() {
    const data = {
      type: this.new.type,
      comment: this.new.comment,
    };

    try {
      const review = await GermlineService.addReview(this.report.ident, data);
      this.report.reviews.push(review[0]);
      this.$mdToast.show(toastCreator('The review has been added.'));
      this.addReview = false;
    } catch (err) {
      this.$mdToast.show(toastCreator('Failed to add the submitted reviewed.'));
    }
  }

  async toggleVariantHidden(variant) {
    variant.hidden = !variant.hidden;

    try {
      const result = await GermlineService.updateVariant(
        this.report.ident,
        variant.ident,
        { hidden: variant.hidden },
      );
      // Update report in memory with fresh result from API.
      const i = this.report.variants.findIndex(v => v.ident === result.ident);
      this.report.variants[i] = result;
    } catch (err) {
      this.$mdToast.show(toastCreator('Failed to update variant with visibility change'));
    }
  }

  async removeReview(review) {
    try {
      await GermlineService.removeReview(this.report.ident, review.ident);
      this.report.reviews.splice(
        this.report.reviews.findIndex(rev => rev.ident === review.ident), 1,
      );
      this.$mdToast.show(toastCreator('Review removed successfully'));
      $rootScope.$digest();
    } catch (err) {
      this.$mdToast.show(toastCreator('Failed to remove the requested review'));
    }
  }

  async removeReport($event) {
    const confirm = dialogCreator({
      $event,
      title: 'Confirm remove',
      text: 'Are you sure you want to remove this germline report?',
      actions: [{ text: 'Remove', click: this.$mdDialog.hide }, { text: 'Cancel', click: this.$mdDialog.cancel }],
    });

    try {
      await this.$mdDialog.show(confirm);
      await GermlineService.deleteReport(this.reportIdent);
      this.$mdToast.show(toastCreator('Report deleted'));
      this.history.push({ pathname: '/germline' });
    } catch (err) {
      this.$mdToast.show(toastCreator('Report NOT deleted'));
    }
  }
}

Report.$inject = ['$mdDialog', '$mdToast'];

export const ReportComponent = {
  template,
  bindings,
  controller: Report,
};

export default angular2react('report', ReportComponent, lazyInjector.$injector);

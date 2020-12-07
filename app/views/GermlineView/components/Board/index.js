import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import toastCreator from '@/utils/toastCreator';
import lazyInjector from '@/lazyInjector';
import template from './germline-board.pug';
import germlineDownload from '@/services/reports/germline';
import GermlineService from '@/services/reports/germline.service';

import './index.scss';

class Board {
  constructor($mdToast) {
    this.$mdToast = $mdToast;
  }

  async $onInit() {
    this.loading = true;
    this.showSearch = true;
    this.focusSearch = false;
    this.filter = {
      search: null,
    };
    const reports = await GermlineService.getAllReports();
    this.reports = reports.reports;
    this.paginate = {
      total: reports.total,
      offset: 0,
      limit: 25,
    };
    this.loading = false;
    $rootScope.$digest();
  }

  clearSearch() {
    this.focusSearch = false;

    const filterCache = this.filter.search;

    this.filter.search = null;
    if (filterCache !== undefined) {
      this.refreshReports();
    }
  }

  displaySearch() {
    this.showSearch = true;
    this.focusSearch = true;
  }

  /* eslint-disable class-methods-use-this */
  hasReview(report, type) {
    return report.reviews.find(review => review.type === type);
  }

  async unsetExported(report) {
    try {
      if (report.exported === false) {
        return;
      }

      report.exported = false;
      const reportCache = angular.copy(report);
      reportCache.biofxAssigned = report.biofxAssigned.ident;

      const result = await GermlineService.updateReport(reportCache.ident, reportCache);
      const i = this.reports.findIndex(rep => rep.ident === reportCache.ident);

      this.reports[i] = result;
    } catch (err) {
      report.exported = true;
      this.$mdToast.show(toastCreator('Failed to update report exported status.'));
    }
  }


  /**
   * Update search criteria and trigger reload
   */
  search() {
    this.refreshReports();
  }

  /**
   * Reload tracking data from API
   *
   */
  async refreshReports() {
    this.loading = true;
    // start from first page of paginator if performing search
    if (this.filter.search) {
      this.paginate.offset = 0;
    }

    const opts = {
      offset: this.paginate.offset,
      limit: this.paginate.limit,
      patientId: this.filter.search,
    };

    const reports = await GermlineService.getAllReports(opts);
    this.paginate.total = reports.total;
    this.reports = reports.reports;
    this.loading = false;
    $rootScope.$digest();
  }

  /**
   * The download attribute doesn't work properly when href is cross-site.
   * This function gets the data first, then simulates a click and serves the content via blob
   */
  async getExport() {
    try {
      const { filename, blob } = await germlineDownload();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;

      const clickHandler = () => {
        setTimeout(() => {
          URL.revokeObjectURL(url);
          a.removeEventListener('click', clickHandler);
          this.refreshReports();
        }, 150);
      };

      a.addEventListener('click', clickHandler, false);

      a.click();
    } catch (err) {
      this.$mdToast.show(toastCreator('Failed to retrieve the downloadable export'));
    }
  }
}

Board.$inject = ['$mdToast'];

export const BoardComponent = {
  template,
  controller: Board,
};

export default angular2react('board', BoardComponent, lazyInjector.$injector);

import { $rootScope } from 'ngimport';
import { angular2react } from 'angular2react';

import toastCreator from '@/utils/toastCreator';
import PathwayService from '@/services/reports/pathway.service';
import lazyInjector from '@/lazyInjector';
import * as svgPanZoom from 'svg-pan-zoom';
import template from './pathway-analysis.pug';
import editTemplate from './pathway-analysis-edit.pug';

import './index.scss';

const bindings = {
  report: '<',
  canEdit: '<',
  print: '<',
  token: '<',
  loadedDispatch: '<',
};

class PathwayAnalysis {
  constructor($mdDialog, $mdToast, FileUploader) {
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.FileUploader = FileUploader;
  }

  $onInit() {
    this.loading = true;
  }

  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      this.pathway = await PathwayService.get(this.report.ident);
      // Show a message if pathway isn't created yet.
      if (this.pathway) {
        this.processSVG(this.pathway.pathway);
      } else {
        this.processSVG(
          '<?xml version="1.0" encoding="UTF-8"?><svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" xml:space="preserve" width="400"><text x="100" y="0" fill="rgb(0,0,0)">Pathway not yet analyzed.</text></svg>',
        );
      }
      this.loading = false;
      if (this.loadedDispatch) {
        this.loadedDispatch({ type: 'pathway' });
      }
      $rootScope.$digest();
    }
  }

  async processSVG(svg) {
    // Get container div
    const svgImage = document.getElementById('svgImage');

    if (svgImage.innerHTML.length > 0) {
      // Destroy so we can build it bigger, faster, better than before!
      svgImage.innerHTML = '';
    }

    // Create SVG DOM element from String
    this.pathway = new DOMParser().parseFromString(svg, 'application/xml');
    const {
      width: { baseVal: { value: svgVW } },
      height: { baseVal: { value: svgVH } },
    } = this.pathway.firstElementChild;

    // Extract SVG element from within XML wrapper.
    const [xmlSVG] = this.pathway.getElementsByTagName('svg');
    xmlSVG.id = 'pathway'; // Set ID that we can grapple.
    xmlSVG.setAttribute('viewBox', `0 0 ${svgVW || 10} ${svgVH || 10}`);

    svgImage.appendChild(
      svgImage.ownerDocument.importNode(this.pathway.documentElement, true),
    );

    if (!this.print) {
      const panZoom = await svgPanZoom('#pathway', {
        preventMouseEventsDefault: true,
        enableControlIcons: true,
        controlIconsEnabled: true,
      });
      panZoom.resize();
      panZoom.fit();
      panZoom.center();
    }
  }

  /**
   * Update The SVG Pathway diagram
   *
   * @param $event
   */
  async update($event) {
    try {
      const resp = await this.$mdDialog.show({
        targetEvent: $event,
        template: editTemplate,
        clickOutToClose: true,
        parent: angular.element(document.body),
        controller: ['$scope', ($scope) => {
          $scope.process = 'select';
          $scope.progress = 0;
          $scope.filename = '';

          // Cancel Dialog
          $scope.cancel = () => {
            this.$mdDialog.cancel('Canceled Edit - No changes made.');
          };

          let selectedItem;
          $scope.uploader = new this.FileUploader({
            url: `${window._env_.API_BASE_URL}/reports/${this.report.ident}/summary/pathway-analysis`,
          });

          $scope.uploader.headers.Authorization = this.token;
          $scope.uploader.method = 'PUT';
          $scope.uploader.alias = 'pathway';

          // Sync filter
          $scope.uploader.filters.push({
            name: 'syncFilter',
            fn: (item) => {
              if (item.type !== 'image/svg+xml') {
                this.$mdToast.showSimple('Only .svg files are accepted');
              }
              return (item.type === 'image/svg+xml');
            },
          });

          // Kick off upload
          $scope.uploader.onAfterAddingFile = (fileItem) => {
            $scope.filename = fileItem.file.name;
            selectedItem = fileItem;
            $scope.process = 'upload';
          };

          $scope.uploader.onProgressItem = (fileItem, progress) => {
            $scope.progress = progress;
          };

          // Initiate Upload
          $scope.initiateUpload = () => {
            $scope.startedUpload = true;
            $scope.uploader.uploadItem(selectedItem);
          };

          // Only allow 1 upload. When Finished
          $scope.uploader.onCompleteItem = (fileItem, response) => {
            this.$mdDialog.hide({ data: response, message: 'Pathway Analysis data updated.' });
          };
        }],
      });
      this.$mdToast.show(toastCreator(resp.message));
      // Update current page content
      this.pathway = resp.data.pathway;
      this.processSVG(resp.data.pathway);
    } catch (err) {
      this.$mdToast.show(toastCreator(err));
    }
  }
}

PathwayAnalysis.$inject = ['$mdDialog', '$mdToast', 'FileUploader'];

export const PathwayAnalysisComponent = {
  template,
  bindings,
  controller: PathwayAnalysis,
};

export default angular2react('pathwayAnalysis', PathwayAnalysisComponent, lazyInjector.$injector);
import * as svgPanZoom from 'svg-pan-zoom';
import template from './pathway-analysis.pug';
import editTemplate from './pathway-analysis-edit.pug';
import './pathway-analysis.scss';

const bindings = {
  pog: '<',
  report: '<',
  reportEdit: '<',
  pathway: '<',
  print: '<',
};

class PathwayAnalysisComponent {
  /* @ngInject */
  constructor($scope, $mdDialog, $mdToast, PogService, FileUploader, $localStorage) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.PogService = PogService;
    this.FileUploader = FileUploader;
    this.$localStorage = $localStorage;
  }

  $onInit() {
    // Show a message if pathway isn't created yet.
    if (this.pathway) {
      this.processSVG(this.pathway.pathway);
    } else {
      this.processSVG(
        '<?xml version="1.0" encoding="UTF-8"?><svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" xml:space="preserve" width="400"><text x="0" y="0" fill="rgb(210,210,210)">Pathway not yet analyzed.</text></svg>',
      );
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

    // Extract SVG element from within XML wrapper.
    const xmlSVG = this.pathway.getElementsByTagName('svg')[0];
    xmlSVG.id = 'pathway'; // Set ID that we can grapple.
    xmlSVG.setAttribute('viewBox', '0 0 1052 744');

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
        locals: {
          pog: this.pog,
        },
        clickOutToClose: false,
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
            url: `${CONFIG.ENDPOINTS.API}/POG/${this.pog.POGID}/report/${this.report.ident}/genomic/summary/pathwayAnalysis`,
          });

          $scope.uploader.headers.Authorization = this.$localStorage[CONFIG.STORAGE.KEYCLOAK];
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
      this.$mdToast.show(this.$mdToast.simple().textContent(resp.message));
      // Update current page content
      this.pathway = resp.data.pathway;
      this.processSVG(resp.data.pathway);
      // Display Message from Hiding
    } catch (err) {
      this.$mdToast.show(this.$mdToast.simple().textContent(err));
    }
  }
}

export default {
  template,
  bindings,
  controller: PathwayAnalysisComponent,
};

import template from './slides.pug';
import './slides.scss';

const bindings = {
  pog: '<',
  report: '<',
  slides: '<',
  print: '<',
};

class GenomicSlidesComponent {
  /* @ngInject */
  constructor($scope, $mdDialog, $mdToast, SlidesService, DiscussionService,
    FileUploader, $localStorage) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.SlidesService = SlidesService;
    this.DiscussionService = DiscussionService;
    this.FileUploader = FileUploader;
    this.$localStorage = $localStorage;
  }

  $onInit() {
    console.log(this.slides);
    this.new = { name: '' };
    this.addStep = 'select';
    this.progress = 0;
    this.filename = '';

    this.allowedImageFormats = [
      'jpeg',
      'jpg',
      'png',
      'gif',
      'svg',
    ];

    this.selectedItem = null;
    this.uploader = this.setupUploader();
  }
  
  // Remove a slide entry
  async remove(slide) {
    const confirm = this.$mdDialog.confirm()
      .textContent('Are you sure you want to remove this slide?')
      .ok('Remove Slide')
      .cancel('Cancel');

    try {
      await this.$mdDialog.show(confirm);
      await this.SlidesService.remove(this.pog.POGID, this.report.ident, slide.ident);
      this.slides = this.slides.filter((entry) => {
        return entry.ident !== slide.ident;
      });
    } catch (err) {
      this.$mdToast.showSimple('No changes were made');
    } finally {
      this.$scope.$digest();
    }
  }

  // Cancel Dialog
  cancel() {
    this.$mdDialog.cancel('No changes were made');
  }


  setupUploader() {
    this.uploader = new this.FileUploader({
      url: `${CONFIG.ENDPOINTS.API}/POG/${this.pog.POGID}/report/${this.report.ident}/genomic/presentation/slide`,
    });

    this.uploader.headers.Authorization = this.$localStorage[CONFIG.STORAGE.KEYCLOAK];
    this.uploader.method = 'POST';
    this.uploader.alias = 'file'; // Name of the file in the POST
    this.selectedItem = null;
    this.progress = 0;

    this.uploader.onErrorItem = (response) => {
      this.$mdToast.showSimple(`Unable to upload the file: ${response.message}`);
    };

    // Kick off upload
    this.uploader.onAfterAddingFile = (fileItem) => {
      this.filename = fileItem.file.name;
      this.selectedItem = fileItem;

      this.addStep = 'upload'; // Now in the uploading action
    };

    this.uploader.onProgressItem = (progress) => {
      this.progress = progress;
    };

    // Only allow 1 upload. When Finished
    this.uploader.onCompleteItem = async () => {
      // Add to tabs and notify user of great success
      this.$mdToast.showSimple('The slide was successfully uploaded');
      this.slides = await this.SlidesService.all(
        this.pog.POGID, this.report.ident,
      );
      this.new.name = '';
      this.addStep = 'select';

      // Cleanup
      this.uploader.clearQueue();
      this.selectedItem = null;
      this.progress = 0;
      this.$scope.$digest();
    };

    // Sync filter
    this.uploader.filters.push({
      name: 'syncFilter',
      fn: (item) => {
        this.uploader.formData = [{ name: this.new.name }];
        if (this.allowedImageFormats.includes(item.type)) {
          this.$mdToast.showSimple(
            `Invalid file format provided. Must be an image of type: ${this.allowedImageFormats.join(',')}`,
          );
          return false;
        }
        return true;
      },
    });

    return this.uploader;
  }

  // Initiate Upload
  initiateUpload() {
    this.startedUpload = true;

    this.uploader.alias = 'file'; // Name of the file in the POST
    this.uploader.formData = [{ name: this.new.name }];
    this.uploader.uploadItem(this.selectedItem);
  }
}

export default {
  template,
  bindings,
  controller: GenomicSlidesComponent,
};

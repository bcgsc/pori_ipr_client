import { angular2react } from 'angular2react';
import { $rootScope } from 'ngimport';

import dialogCreator from '@/utils/dialogCreator';
import toastCreator from '@/utils/toastCreator';
import SlidesService from '@/services/reports/slides.service';
import lazyInjector from '@/lazyInjector';
import template from './slides.pug';
import './slides.scss';

const bindings = {
  report: '<',
  slides: '<',
  print: '<',
  token: '<',
  loadedDispatch: '<',
  theme: '<',
};

class Slides {
  constructor($mdDialog, $mdToast, FileUploader) {
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.FileUploader = FileUploader;
  }

  $onInit() {
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
    this.loading = true;
  }

  async $onChanges(changes) {
    if (changes.report && changes.report.currentValue) {
      this.slides = await SlidesService.all(this.report.ident);
      this.uploader = this.setupUploader();
      this.loading = false;
      $rootScope.$digest();
      // must be after digest call since slides are displayed in ng-repeat
      if (this.loadedDispatch) {
        this.loadedDispatch({ type: 'slides' });
      }
    }
  }

  // Remove a slide entry
  async remove($event, slide) {
    const confirm = dialogCreator({
      $event,
      text: 'Are you sure you want to remove this slide?',
      title: 'Confirm',
      actions: [
        { text: 'Remove Slide', click: this.$mdDialog.hide },
        { text: 'Cancel', click: this.$mdDialog.cancel },
      ],
    });

    try {
      await this.$mdDialog.show(confirm);
      await SlidesService.remove(this.report.ident, slide.ident);
      this.slides = this.slides.filter(entry => entry.ident !== slide.ident);
    } catch (err) {
      this.$mdToast.show(toastCreator('No changes were made'));
    } finally {
      $rootScope.$digest();
    }
  }

  // Cancel Dialog
  cancel() {
    this.$mdDialog.cancel('No changes were made');
  }


  setupUploader() {
    this.uploader = new this.FileUploader({
      url: `${window._env_.API_BASE_URL}/reports/${this.report.ident}/presentation/slide`,
    });

    this.uploader.headers.Authorization = this.token;
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
      this.$mdToast.show(toastCreator('The slide was successfully uploaded'));
      this.slides = await SlidesService.all(
        this.report.ident,
      );
      this.new.name = '';
      this.addStep = 'select';

      // Cleanup
      this.uploader.clearQueue();
      this.selectedItem = null;
      this.progress = 0;
      $rootScope.$digest();
    };

    // Sync filter
    this.uploader.filters.push({
      name: 'syncFilter',
      fn: (item) => {
        this.uploader.formData = [{ name: this.new.name }];
        if (this.allowedImageFormats.includes(item.type)) {
          this.$mdToast.show(toastCreator(
            `Invalid file format provided. Must be an image of type: ${this.allowedImageFormats.join(',')}`,
          ));
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

Slides.$inject = ['$mdDialog', '$mdToast', 'FileUploader'];

export const SlidesComponent = {
  template,
  bindings,
  controller: Slides,
};

export default angular2react('slides', SlidesComponent, lazyInjector.$injector);

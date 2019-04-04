app.controller('controller.dashboard.report.genomic.slide',
  ['_', '$q', '$scope', 'pog', 'report', '$mdDialog', '$mdToast', 'api.presentation', 'slides', 'FileUploader', '$localStorage', '$async',
    (_, $q, $scope, pog, report, $mdDialog, $mdToast, $presentation, slides, FileUploader, $localStorage, $async) => {
      $scope.pog = pog;
      $scope.report = report;
      $scope.slides = slides;
      $scope.new = { name: '' };
  
  
      $scope.add_step = 'select';
      $scope.progress = 0;
      $scope.filename = '';
  
      // Remove a slide entry
      $scope.remove = (slide) => {
        const confirm = $mdDialog.confirm()
          .textContent('Are you sure you want to remove this slide?')
          .ok('Remove Slide')
          .cancel('Cancel');
    
        $mdDialog.show(confirm)
          .then($async(async () => {
            try {
              await $presentation.slide.remove(pog.POGID, report.ident, slide.ident)
              $scope.slides.splice(_.findKey($scope.slides, { ident: slide.ident }), 1);
            } catch (err) {
              $mdToast.showSimple('Failed to remove slide due to an internal server error');
            }
          }))
          .catch((err) => {
            $mdToast.showSimple('No changes were made');
          });
      };
  
      const allowedImageFormats = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/svg',
      ];
  
      // Cancel Dialog
      $scope.cancel = () => {
        $mdDialog.cancel('No changes were made');
      };
  
  
      let selectedItem = null;
      let uploader = {};
  
      const setupUploader = () => {
        $scope.uploader = new FileUploader({
          url: `${CONFIG.ENDPOINTS.API}/POG/${pog.POGID}/report/${report.ident}/genomic/presentation/slide`,
        });
  
        $scope.uploader.headers.Authorization = $localStorage[CONFIG.STORAGE.KEYCLOAK];
        $scope.uploader.method = 'POST';
        $scope.uploader.alias = 'file'; // Name of the file in the POST
    
        selectedItem = null;
    
        $scope.progress = 0;
    
        return $scope.uploader;
      };
  
  
      uploader = setupUploader();
  
      // Sync filter
      uploader.filters.push({
        name: 'syncFilter',
        fn: (item, options) => {
          uploader.formData = [{ name: $scope.new.name }];
          if (allowedImageFormats.indexOf(item.type) === -1) {
            $mdToast.showSimple(`Invalid file format provided. Must be an image of type: ${_.join(allowedImageFormats, ', ')}`);
            return false;
          }
          return true;
        },
      });
  
      uploader.onErrorItem = (fileItem, response, status, headers) => {
        $mdToast.showSimple(`Unable to upload the file: ${response.message}`);
      };
  
      // Kick off upload
      uploader.onAfterAddingFile = (fileItem) => {
        $scope.filename = fileItem.file.name;
        selectedItem = fileItem;
    
        $scope.add_step = 'upload'; // Now in the uploading action
      };
  
      uploader.onProgressItem = (fileItem, progress) => {
        $scope.progress = progress;
      };
  
      // Initiate Upload
      $scope.initiateUpload = () => {
        $scope.startedUpload = true;
    
        uploader.alias = 'file'; // Name of the file in the POST
        uploader.formData = [{ name: $scope.new.name }];
        uploader.uploadItem(selectedItem);
      };
  
      // Only allow 1 upload. When Finished
      uploader.onCompleteItem = (fileItem, response, status, headers) => {
        // Add to tabs and notify user of great success
        $mdToast.showSimple('The slide was successfully uploaded');
        $scope.slides.push(response);
        $scope.new.name = '';
        $scope.add_step = 'select';
    
        // Cleanup
        uploader.clearQueue();
        selectedItem = null;
        $scope.progress = 0;
      };
    }]);

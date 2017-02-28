app.controller('controller.dashboard.report.genomic.pathwayAnalysis',
  ['_', '$q', '$scope', '$mdDialog', '$mdToast', 'api.pog', 'api.summary.pathwayAnalysis', 'FileUploader', 'api.session', 'pog', 'pathway',
    (_, $q, $scope, $mdDialog, $mdToast, $pog, $pathway, FileUploader, $session, pog, pathway) => {

      $scope.pog = pog;

      let processSVG = (svg) => {

        // Create SVG DOM element from String
        $scope.pathway = new DOMParser().parseFromString(svg, 'application/xml');

        let xmlSVG = $scope.pathway.getElementsByTagName('svg')[0];
        xmlSVG.id="pathway";
        xmlSVG.style = 'width: 100%; height: 800px;';

        let panZoom = {};

        // Load in SVG after delay.
        setTimeout(() => {
          let svgImage = document.getElementById('svgImage');

          svgImage.appendChild(
            svgImage.ownerDocument.importNode($scope.pathway.documentElement, true)
          );
          let panZoom = svgPanZoom('#pathway', {
            preventMouseEventsDefault: true,
            enableControlIcons: true,
            controlIconsEnabled: true
          });
          panZoom.resize();
          panZoom.fit();
          panZoom.center();
        },500);

      };

      if(pathway !== null) processSVG(pathway.pathway);
      if(pathway === null) processSVG('<?xml version="1.0" encoding="UTF-8"?><svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" xml:space="preserve" width="400"><text x="0" y="0" fill="rgb(210,210,210)">Pathway not yet analyzed.</text></svg>');

      $scope.update = ($event) => {

        $mdDialog.show({
          targetEvent: $event,
          templateUrl: 'dashboard/report/genomic/pathwayAnalysis/pathwayAnalysis.edit.html',
          locals: {
            pog: pog
          },
          clickOutToClose: false,
          controller: ['$q', '_', '$scope', '$mdDialog', '$timeout', ($q, _, scope, $mdDialog, $timeout) => {

            // Cancel Dialog
            scope.cancel = () => {
              $mdDialog.cancel('Canceled Edit - No changes made.');
            };

            let selectedItem;
            let uploader = scope.uploader = new FileUploader({
              url: CONFIG.ENDPOINTS.API + '/POG/' + pog.POGID + '/summary/pathwayAnalysis',
            });

            uploader.headers['Authorization'] = $session.getToken();
            uploader.method = 'PUT';
            uploader.alias = "pathway";

            // Sync filter
            uploader.filters.push({
              name: 'syncFilter',
              fn: function(item, options) {
                if(item.type !== "image/svg+xml") console.log('That is not an SVG!');
                return (item.type === "image/svg+xml");
              }
            });

            uploader.onErrorItem = function(fileItem, response, status, headers) {
              console.info('onErrorItem', fileItem, response, status, headers);
            };

            // Kick off upload
            uploader.onAfterAddingFile = function(fileItem) {
              selectedItem = fileItem;
            };

            // Initiate Upload
            scope.initiateUpload = () => {
              uploader.uploadItem(selectedItem);
            };

            // Only allow 1 upload. When Finished
            uploader.onCompleteItem = function(fileItem, response, status, headers) {
              console.info('API Response on complete', response);
              $mdDialog.hide({data: response, message: 'Pathway Analysis data updated.'})
            };

          }]
        }).then((result) => {
          // Update current page content
          processSVG(result.data.pathway);

          console.log(result.data.pathway);

          // Display Message from Hiding
          $mdToast.show($mdToast.simple().textContent(result.message));
        }, (error) => {
          $mdToast.show($mdToast.simple().textContent(error));
        });
      }

    }
  ]
);

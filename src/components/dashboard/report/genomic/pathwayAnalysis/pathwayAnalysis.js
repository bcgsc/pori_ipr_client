app.controller('controller.dashboard.report.genomic.pathwayAnalysis',
  ['_', '$q', '$scope', '$mdDialog', '$mdToast', 'api.pog', 'api.summary.pathwayAnalysis', 'FileUploader', '$cookies', 'pog', 'report', 'pathway',
    (_, $q, $scope, $mdDialog, $mdToast, $pog, $pathway, FileUploader, $cookies, pog, report, pathway) => {

      $scope.pog = pog;

      let processSVG = (svg) => {

        // Get container div
        let svgImage = document.getElementById('svgImage');

        if(svgImage.innerHTML.length > 0) {
          // Destroy so we can build it bigger, faster, better than before!
          svgImage.innerHTML = '';
        }

        // Create SVG DOM element from String
        $scope.pathway = new DOMParser().parseFromString(svg, 'application/xml');

        // Extract SVG element from within XML wrapper.
        let xmlSVG = $scope.pathway.getElementsByTagName('svg')[0];
        xmlSVG.id="pathway"; // Set ID that we can grapple.
        xmlSVG.style = 'width: 100%; height: 800px;'; // Set width & height TODO: Make responsive

        // Create PanZoom object
        let panZoom = {};

        // Load in SVG after slight delay. (otherwise xmlSVG processing isn't ready.
        // TODO: Use promises to clean this up.
        setTimeout(() => {
          svgImage = document.getElementById('svgImage');

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
        },100);

      };

      // Show a message if pathway isn't created yet.
      if(pathway !== null) processSVG(pathway.pathway);
      if(pathway === null) processSVG('<?xml version="1.0" encoding="UTF-8"?><svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" xml:space="preserve" width="400"><text x="0" y="0" fill="rgb(210,210,210)">Pathway not yet analyzed.</text></svg>');


      /**
       * Update The SVG Pathway diagram
       *
       * @param $event
       */
      $scope.update = ($event) => {

        $mdDialog.show({
          targetEvent: $event,
          templateUrl: 'dashboard/report/genomic/pathwayAnalysis/pathwayAnalysis.edit.html',
          locals: {
            pog: pog
          },
          clickOutToClose: false,
          controller: ['$q', '_', '$scope', '$mdDialog', '$timeout', ($q, _, scope, $mdDialog, $timeout) => {

            scope.process = 'select';
            scope.progress = 0;
            scope.filename = "";

            // Cancel Dialog
            scope.cancel = () => {
              $mdDialog.cancel('Canceled Edit - No changes made.');
            };

            let selectedItem;
            let uploader = scope.uploader = new FileUploader({
              url: CONFIG.ENDPOINTS.API + '/POG/' + pog.POGID +  '/report/' + report.ident + '/genomic/summary/pathwayAnalysis',
            });

            uploader.headers['Authorization'] = $cookies.get(CONFIG.COOKIES.KEYCLOAK);
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
            uploader.onAfterAddingFile = (fileItem) => {
              console.log('Selected ', fileItem);
              scope.filename = fileItem.file.name;
              selectedItem = fileItem;
              scope.process="upload";
            };

            uploader.onProgressItem = (fileItem, progress) => {
              scope.progress = progress;
            };

            // Initiate Upload
            scope.initiateUpload = () => {
              scope.startedUpload = true;
              uploader.uploadItem(selectedItem);
            };

            // Only allow 1 upload. When Finished
            uploader.onCompleteItem = (fileItem, response, status, headers) => {
              console.info('API Response on complete', response);
              $mdDialog.hide({data: response, message: 'Pathway Analysis data updated.'})
            };

          }]
        }).then((result) => {
          // Update current page content
          processSVG(result.data.pathway);
          // Display Message from Hiding
          $mdToast.show($mdToast.simple().textContent(result.message));
        }, (error) => {
          $mdToast.show($mdToast.simple().textContent(error));
        });
      }

    }
  ]
);

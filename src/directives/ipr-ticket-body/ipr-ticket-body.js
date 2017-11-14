app.directive('iprTicketBody', ['$rootScope', function($rootScope) {
  return {
    link: function(scope, element, attrs) {
      $rootScope.$on('insertText', function(e, val) {
        let domElement = element[0];
        
        // Is there any text selected?
        if (document.selection) {
          domElement.focus();
          let sel = document.selection.createRange();
          sel.text = val;
          domElement.focus();
          
        // Somewhere not selected, but in the middle
        } else if (domElement.selectionStart || domElement.selectionStart === 0) {
          
          let startPos = domElement.selectionStart;
          let endPos = domElement.selectionEnd;
          let scrollTop = domElement.scrollTop;
          
          domElement.value = domElement.value.substring(0, startPos) + val + domElement.value.substring(endPos, domElement.value.length);
          domElement.focus();
          domElement.selectionStart = startPos + val.length;
          domElement.selectionEnd = startPos + val.length;
          domElement.scrollTop = scrollTop;
          
        } else {
          // Add to end
          domElement.value += val;
          domElement.focus();
        }
        
      });
    }
  }
}]);
import angular from 'angular';
import MutationSignatureComponent from './mutation-signature.component';

angular.module('mutation.signature', []);

export default angular.module('mutation.signature')
  .component('mutationSignature', MutationSignatureComponent)
  .name;

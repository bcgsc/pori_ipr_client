import template from './paginate.pug';
import './index.scss';

const bindings = {
  offset: '=',
  limit: '=',
  total: '=',
  refresh: '&',
};

class Paginate {
  constructor($timeout, $scope) {
    this.$timeout = $timeout;
    this.$scope = $scope;
  }
  
  $onInit() {
    /* eslint-disable-next-line arrow-body-style */
    this.$scope.$watch(() => this.limit, (newVal, oldVal) => {
      if (newVal === oldVal) return;
      this.offset = 0;
      this.$timeout(() => {
        this.refresh();
      }, 100);
    });
  }
  
  prevPage() {
    this.offset -= this.limit;
    this.$timeout(() => {
      this.refresh();
    }, 100);
  }
  
  nextPage() {
    this.offset += this.limit;
    this.$timeout(() => {
      this.refresh();
    }, 100);
  }
}

Paginate.$inject = ['$timeout', '$scope'];

export default {
  template,
  bindings,
  controller: Paginate,
};

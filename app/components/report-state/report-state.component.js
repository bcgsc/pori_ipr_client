import template from './report-state.pug';

const bindings = {
  state: '<',
};

class ReportState {
  $onInit() {
    const parse = (state) => {
      switch (state) {
        case 'nonproduction':
          return 'Non-Production/Test';
        case 'ready':
          return 'Ready for analysis';
        case 'presented':
          return 'Review/Presentation';
        case 'active':
          return 'Analysis underway';
        case 'archived':
          return 'Archived';
        case 'signedoff':
          return 'Signed-off';
        case 'reviewed':
          return 'Reviewed';
        case 'uploaded':
          return 'Uploaded';
        default:
          return null;
      }
    };
    this.parsedState = parse(this.state);
  }
}

export default {
  template,
  bindings,
  controller: ReportState,
};

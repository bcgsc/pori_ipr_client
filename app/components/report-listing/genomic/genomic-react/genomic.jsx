import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import angular from 'angular';

class GenomicComponent extends Component {
  static propTypes = {
    reports: PropTypes.object.isRequired,
  };

  componentDidMount() {
    const { reports } = this.props;
    console.log(reports);
  }

  render() {
    return (
      <div>
        React
      </div>
    );
  }
}

export default angular
  .module('genomic', [])
  .component('genomic', react2angular(GenomicComponent))
  .config(($stateProvider) => {
    'ngInject';

    $stateProvider
      .state('root.reportlisting.genomic', {
        url: '/genomic',
        component: 'genomic',
        resolve: {
          reports: ['ReportService', 'UserService', 'isExternalMode',
            async (ReportService, UserService, isExternalMode) => {
              const currentUser = await UserService.getSetting('genomicReportListCurrentUser');
              const project = await UserService.getSetting('selectedProject') || { name: undefined };
              
              const opts = {
                type: 'genomic',
              };

              if (currentUser === null || currentUser === undefined || currentUser === true) {
                opts.states = 'ready,active,presented';
                opts.project = project.name;
              } else {
                opts.all = true;
                opts.states = 'ready,active,presented';
                opts.project = project.name;
              }

              if (isExternalMode) {
                opts.all = true;
                opts.states = 'presented,archived';
                opts.paginated = true;
              }
              return ReportService.allFiltered(opts);
            }],
        },
      });
  })
  .name;

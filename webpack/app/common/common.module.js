import angular from 'angular';
import NavbarModule from './navbar/navbar.module';
import SidebarModule from './sidebar/sidebar.module';
import DiscussionEntryModule from './discussion-entry/discussion-entry.module';
import MutationSignatureModule from './mutation-signature/mutation-signature.module';
import PaginateModule from './paginate/paginate.module';
import ReportListingCardModule from './report-listing-card/report-listing-card.module';
import ReportStateModule from './report-state/report-state.module';
import ReportTableModule from './report-table/report-table.module';
import TumourContentModule from './tumour-content/tumour-content.module';
import SmallMutationVariantsModule from './small-mutation-variants/small-mutation-variants.module';

const CommonModule = angular
  .module('root.common', [
    NavbarModule,
    SidebarModule,
    DiscussionEntryModule,
    MutationSignatureModule,
    PaginateModule,
    ReportListingCardModule,
    ReportStateModule,
    ReportTableModule,
    TumourContentModule,
    SmallMutationVariantsModule,
  ])
  .name;

export default CommonModule;

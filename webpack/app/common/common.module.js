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
import GenomicAlterationModule from './genomic-alteration/genomic-alteration.module';
import DetailViewerModule from './detail-viewer/detail-viewer.module';
import GeneViewerModule from './gene-viewer/gene-viewer.module';
import ListCopyNumberVariantsModule from './list-copy-number-variants/list-copy-number-variants.module';
import ListStructuralVariantsModule from './list-structural-variants/list-structural-variants.module';
import ListOutliersModule from './list-outliers/list-outliers.module';
import RoleCardModule from './role-card/role-card.module';
import AdminbarModule from './adminbar/adminbar.module';
import UserEditModule from './user-edit/user-edit.module';
import ProjectsEditModule from './projects-edit/projects-edit.module';
import GroupsEditModule from './groups-edit/groups-edit.module';

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
    GenomicAlterationModule,
    DetailViewerModule,
    GeneViewerModule,
    ListCopyNumberVariantsModule,
    ListStructuralVariantsModule,
    ListOutliersModule,
    RoleCardModule,
    AdminbarModule,
    UserEditModule,
    ProjectsEditModule,
    GroupsEditModule,
  ])
  .name;

export default CommonModule;

import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router'

import { AdminLayout } from '@/components/admin/layout/admin-layout'
import { PensionerLayout } from '@/components/pensioner/layout/pensioner-layout'
import { SuperAdminLayout } from '@/components/superadmin/layout/superadmin-layout'
import { prefillLoginRole } from '@/lib/login-prefill'
import { getSession, rolePath } from '@/lib/auth'
import { AdminTasksPage } from '@/pages/admin/tasks/admin-tasks-page'
import { ActivationTaskPage } from '@/pages/admin/tasks/activation-task-page'
import { DemiseTaskPage } from '@/pages/admin/tasks/demise-task-page'
import { GrievanceTaskPage } from '@/pages/admin/tasks/grievance-task-page'
import { LifeCertificateReviewPage } from '@/pages/admin/tasks/life-certificate-review-page'
import { ProfileUpdatesListPage } from '@/pages/admin/profile-updates/profile-updates-list-page'
import { ProfileUpdateDetailPage } from '@/pages/admin/profile-updates/profile-update-detail-page'
import { VerificationRecordsPage } from '@/pages/admin/verification/verification-records-page'
import { AdminDashboardPage } from '@/pages/admin/admin-dashboard-page'
import { SuspensionsDashboardPage } from '@/pages/admin/suspensions/suspensions-dashboard-page'
import { CreateSuspensionPage } from '@/pages/admin/suspensions/create-suspension-page'
import { SuspensionDetailPage } from '@/pages/admin/suspensions/suspension-detail-page'
import { RestorationRequestsPage } from '@/pages/admin/suspensions/restoration-requests-page'
import { RestorationDetailPage } from '@/pages/admin/suspensions/restoration-detail-page'
import { AddPensionerPage } from '@/pages/admin/pensioners/add-pensioner-page'
import { BulkImportPage } from '@/pages/admin/pensioners/bulk-import-page'
import { BulkDisbursementPage } from '@/pages/admin/disbursements/bulk-disbursement-page'
import { ManualDisbursementPage } from '@/pages/admin/disbursements/manual-disbursement-page'
import { PaymentMonthComparisonPage } from '@/pages/admin/disbursements/payment-month-comparison-page'
import { PendingActivationsPage } from '@/pages/admin/pensioners/pending-activations-page'
import { PensionersListPage } from '@/pages/admin/pensioners/pensioners-list-page'
import { ViewPensionerPage } from '@/pages/admin/pensioners/view-pensioner-page'
import { EditPensionStructurePage } from '@/pages/admin/pensioners/edit-pension-structure-page'
import { PensionReportsPage } from '@/pages/admin/reports/pension-reports-page'
import { DashboardPreviewPage } from '@/pages/dashboard-preview-page'
import { LandingPage } from '@/pages/landing-page'
import { LoginPage } from '@/pages/login-page'
import { RegisterPage } from '@/pages/register-page'
import { CommunicationLayout } from '@/components/communication/layout/communication-layout'
import { CommunicationPageWrapper } from '@/components/communication/communication-page-wrapper'
import { CommunicationAuditPage } from '@/pages/communication/communication-audit-page'
import { GenerateNoticePage } from '@/pages/communication/generate-notice-page'
import { NoticeDashboardPage } from '@/pages/communication/notice-dashboard-page'
import { NoticeDetailPage } from '@/pages/communication/notice-detail-page'
import { NoticeHistoryPage } from '@/pages/communication/notice-history-page'
import { NotificationDashboardPage } from '@/pages/communication/notification-dashboard-page'
import { NotificationHistoryPage } from '@/pages/communication/notification-history-page'
import { TemplateManagementPage } from '@/pages/communication/template-management-page'
import { RecoveryLayout } from '@/components/recovery/layout/recovery-layout'
import { RecoveryPageWrapper } from '@/components/recovery/recovery-page-wrapper'
import { CreateRecoveryCasePage } from '@/pages/recovery/create-recovery-case-page'
import { RecoveryCaseDetailPage } from '@/pages/recovery/recovery-case-detail-page'
import { RecoveryCasesListPage } from '@/pages/recovery/recovery-cases-list-page'
import { RecoveryDashboardPage } from '@/pages/recovery/recovery-dashboard-page'
import { AuditLayout } from '@/components/audit/layout/audit-layout'
import { AuditCompliancePage } from '@/pages/audit/audit-compliance-page'
import { AuditDashboardPage } from '@/pages/audit/audit-dashboard-page'
import { AuditLogsPage } from '@/pages/audit/audit-logs-page'
import { AuditModuleTrailPage } from '@/pages/audit/audit-module-trail-page'
import { AdminUsersPage } from '@/pages/superadmin/admin-users-page'
import { DepartmentsPage } from '@/pages/superadmin/departments-page'
import { RolesPermissionsPage } from '@/pages/superadmin/roles-permissions-page'
import { SuperAdminDashboardPage } from '@/pages/superadmin/superadmin-dashboard-page'
import { SuperAdminPlaceholderPage } from '@/pages/superadmin/superadmin-placeholder-page'
import { SystemSettingsPage } from '@/pages/superadmin/system-settings-page'
import { ActivationPage } from '@/pages/pensioner/activate/activation-page'
import { PensionerDashboardPage } from '@/pages/pensioner/dashboard/pensioner-dashboard-page'
import { DemisePageWrapper } from '@/components/demise/demise-page-wrapper'
import { NomineeLayout } from '@/components/nominee/nominee-layout'
import { DemiseDashboardPage } from '@/pages/demise/demise-dashboard-page'
import { DemiseRequestsListPage } from '@/pages/demise/demise-requests-list-page'
import { DemiseDetailPage } from '@/pages/demise/demise-detail-page'
import { DeceasedPensionersPage } from '@/pages/demise/deceased-pensioners-page'
import { DeceasedPensionerDetailPage } from '@/pages/demise/deceased-pensioner-detail-page'
import { FamilyPensionListPage } from '@/pages/demise/family-pension-list-page'
import { FamilyPensionDetailPage } from '@/pages/demise/family-pension-detail-page'
import { NomineeLoginPage } from '@/pages/nominee/nominee-login-page'
import { NomineeDemiseIntimationPage } from '@/pages/nominee/nominee-demise-intimation-page'
import { DemiseReportingPage } from '@/pages/pensioner/demise/demise-reporting-page'
import { DocumentPageWrapper } from '@/components/documents/document-page-wrapper'
import { DocumentAuditPage } from '@/pages/documents/document-audit-page'
import { DocumentDashboardPage } from '@/pages/documents/document-dashboard-page'
import { DocumentDetailPage } from '@/pages/documents/document-detail-page'
import { DocumentHistoryPage } from '@/pages/documents/document-history-page'
import { DocumentRepositoryPage } from '@/pages/documents/document-repository-page'
import { DocumentUploadPage } from '@/pages/documents/document-upload-page'
import { VerificationQueuePage } from '@/pages/documents/verification-queue-page'
import { DocumentsPage } from '@/pages/pensioner/documents/documents-page'
import { PensionerDocumentDetailPage } from '@/pages/pensioner/documents/pensioner-document-detail-page'
import { PensionerDocumentUploadPage } from '@/pages/pensioner/documents/pensioner-document-upload-page'
import { GrievanceLayout } from '@/components/grievance/layout/grievance-layout'
import { GrievancePageWrapper } from '@/components/grievance/grievance-page-wrapper'
import { GrievanceAuditPage } from '@/pages/grievance/grievance-audit-page'
import { GrievanceDashboardPage } from '@/pages/grievance/grievance-dashboard-page'
import { GrievanceReportsPage } from '@/pages/grievance/grievance-reports-page'
import { GrievanceTicketDetailPage } from '@/pages/grievance/grievance-ticket-detail-page'
import { GrievanceTicketsPage } from '@/pages/grievance/grievance-tickets-page'
import { MyTicketsPage } from '@/pages/pensioner/grievance/my-tickets-page'
import { PensionerTicketDetailPage } from '@/pages/pensioner/grievance/pensioner-ticket-detail-page'
import { RaiseTicketPage } from '@/pages/pensioner/grievance/raise-ticket-page'
import { TicketHistoryPage } from '@/pages/pensioner/grievance/ticket-history-page'
import { NotificationsPage } from '@/pages/pensioner/notifications/notifications-page'
import { PensionDetailsPage } from '@/pages/pensioner/pension/pension-details-page'
import { PensionHistoryPage } from '@/pages/pensioner/pension/pension-history-page'
import { ProfilePage } from '@/pages/pensioner/profile/profile-page'
import { MyRequestsPage } from '@/pages/pensioner/profile/my-requests-page'
import { PensionerRequestDetailPage } from '@/pages/pensioner/profile/pensioner-request-detail-page'
import { RequestUpdatePage } from '@/pages/pensioner/profile/request-update-page'
import { RecoveryPage } from '@/pages/pensioner/recovery/recovery-page'
import { SettingsPage as PensionerSettingsPage } from '@/pages/pensioner/settings/settings-page'
import { PensionStatementsPage } from '@/pages/pensioner/statements/pension-statements-page'
import { LifeCertificatePage } from '@/pages/pensioner/verification/life-certificate-page'
import { VerificationStartPage } from '@/pages/pensioner/verification/verification-start-page'
import { SuspensionStatusPage } from '@/pages/pensioner/suspension/suspension-status-page'
import { RestorationRequestPage } from '@/pages/pensioner/suspension/restoration-request-page'
import { MyRestorationRequestsPage } from '@/pages/pensioner/suspension/my-restoration-requests-page'
import { RestorationRequestDetailPage } from '@/pages/pensioner/suspension/restoration-request-detail-page'
import { PlaceholderPage } from '@/pages/admin/placeholder-page'
import type { UserRole } from '@/types/auth'
import {
  FileText,
  Settings,
} from 'lucide-react'
import { z } from 'zod'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: () => {
    const session = getSession()
    if (session) {
      throw redirect({ to: rolePath(session.user.role) })
    }
  },
})

const pensionerLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pensioner/login',
  beforeLoad: () => {
    if (typeof window !== 'undefined') {
      prefillLoginRole('pensioner')
    }
    throw redirect({ to: '/login' })
  },
})

const pensionerActivateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pensioner/activate',
  component: ActivationPage,
})

const nomineeLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nominee',
  component: NomineeLayout,
})

const nomineeIndexRoute = createRoute({
  getParentRoute: () => nomineeLayoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/nominee/login' })
  },
})

const nomineeLoginRoute = createRoute({
  getParentRoute: () => nomineeLayoutRoute,
  path: '/login',
  component: NomineeLoginPage,
})

const nomineeDemiseRoute = createRoute({
  getParentRoute: () => nomineeLayoutRoute,
  path: '/demise',
  component: NomineeDemiseIntimationPage,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
})

const dashboardPreviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard-preview',
  component: DashboardPreviewPage,
})

const adminLoginRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/login',
  beforeLoad: () => {
    throw redirect({ to: '/login' })
  },
})

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminLayout,
  beforeLoad: () => {
    const session = getSession()
    if (!session) throw redirect({ to: '/login' })
    if (session.user.role !== 'pension_admin') {
      throw redirect({ to: rolePath(session.user.role) })
    }
  },
})

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/dashboard',
  component: AdminDashboardPage,
})

const adminPensionersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/pensioners',
  component: PensionersListPage,
})

const adminAddPensionerRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/pensioners/add',
  component: AddPensionerPage,
})

const adminBulkImportRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/pensioners/bulk-import',
  component: BulkImportPage,
})

const adminBulkDisbursementRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/disbursements/bulk',
  component: BulkDisbursementPage,
})

const adminPaymentMonthComparisonRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/disbursements/who-gets-paid',
  component: PaymentMonthComparisonPage,
})

const adminManualDisbursementRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/disbursements/manual',
  component: ManualDisbursementPage,
})

const adminPendingActivationsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/pensioners/pending-activations',
  component: PendingActivationsPage,
})

const adminViewPensionerRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/pensioners/$id',
  component: function ViewRoute() {
    const { id } = adminViewPensionerRoute.useParams()
    return <ViewPensionerPage pensionerId={id} />
  },
})

const adminEditPensionerRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/pensioners/$id/edit',
  component: function EditRoute() {
    const { id } = adminEditPensionerRoute.useParams()
    return <ViewPensionerPage pensionerId={id} />
  },
})

const adminPensionStructureRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/pensioners/$id/pension',
  component: function PensionStructureRoute() {
    const { id } = adminPensionStructureRoute.useParams()
    return <EditPensionStructurePage pensionerId={id} />
  },
})

const adminVerificationApprovedRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/verification/approved',
  component: function AdminVerificationApprovedRoute() {
    return <VerificationRecordsPage status="approved" />
  },
})

const adminVerificationRejectedRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/verification/rejected',
  component: function AdminVerificationRejectedRoute() {
    return <VerificationRecordsPage status="rejected" />
  },
})

const adminSuspensionsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/suspensions',
  component: SuspensionsDashboardPage,
})

const adminCreateSuspensionRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/suspensions/create',
  component: CreateSuspensionPage,
})

const adminSuspensionDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/suspensions/$id',
  component: function AdminSuspensionDetailRoute() {
    const { id } = adminSuspensionDetailRoute.useParams()
    return <SuspensionDetailPage caseId={id} />
  },
})

const adminRestorationRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/suspensions/restoration',
  component: RestorationRequestsPage,
})

const adminRestorationDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/suspensions/restoration/$id',
  component: function AdminRestorationDetailRoute() {
    const { id } = adminRestorationDetailRoute.useParams()
    return <RestorationDetailPage requestId={id} />
  },
})

const adminDemiseIndexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/demise',
  beforeLoad: () => {
    throw redirect({ to: '/admin/demise/dashboard' })
  },
})

const adminDemiseDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/demise/dashboard',
  component: function AdminDemiseDashboardRoute() {
    return (
      <DemisePageWrapper>
        <DemiseDashboardPage />
      </DemisePageWrapper>
    )
  },
})

const adminDemiseRequestsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/demise/requests',
  component: function AdminDemiseRequestsRoute() {
    return (
      <DemisePageWrapper>
        <DemiseRequestsListPage />
      </DemisePageWrapper>
    )
  },
})

const adminDemiseRequestDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/demise/requests/$id',
  component: function AdminDemiseRequestDetailRoute() {
    const { id } = adminDemiseRequestDetailRoute.useParams()
    return (
      <DemisePageWrapper>
        <DemiseDetailPage intimationId={id} />
      </DemisePageWrapper>
    )
  },
})

const adminDeceasedRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/demise/deceased',
  component: function AdminDeceasedRoute() {
    return (
      <DemisePageWrapper>
        <DeceasedPensionersPage />
      </DemisePageWrapper>
    )
  },
})

const adminDeceasedDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/demise/deceased/$id',
  component: function AdminDeceasedDetailRoute() {
    const { id } = adminDeceasedDetailRoute.useParams()
    return (
      <DemisePageWrapper>
        <DeceasedPensionerDetailPage profileId={id} />
      </DemisePageWrapper>
    )
  },
})

const adminFamilyPensionRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/demise/family-pension',
  component: function AdminFamilyPensionRoute() {
    return (
      <DemisePageWrapper>
        <FamilyPensionListPage />
      </DemisePageWrapper>
    )
  },
})

const adminFamilyPensionDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/demise/family-pension/$id',
  component: function AdminFamilyPensionDetailRoute() {
    const { id } = adminFamilyPensionDetailRoute.useParams()
    return (
      <DemisePageWrapper>
        <FamilyPensionDetailPage applicationId={id} />
      </DemisePageWrapper>
    )
  },
})

const adminDocumentsIndexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/documents',
  beforeLoad: () => {
    throw redirect({ to: '/admin/documents/dashboard' })
  },
})

const adminDocumentsDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/documents/dashboard',
  component: function AdminDocumentsDashboardRoute() {
    return (
      <DocumentPageWrapper>
        <DocumentDashboardPage />
      </DocumentPageWrapper>
    )
  },
})

const adminDocumentsRepositoryRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/documents/repository',
  component: function AdminDocumentsRepositoryRoute() {
    return (
      <DocumentPageWrapper>
        <DocumentRepositoryPage />
      </DocumentPageWrapper>
    )
  },
})

const adminDocumentsUploadRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/documents/upload',
  component: function AdminDocumentsUploadRoute() {
    return (
      <DocumentPageWrapper>
        <DocumentUploadPage />
      </DocumentPageWrapper>
    )
  },
})

const adminDocumentsVerificationRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/documents/verification',
  component: function AdminDocumentsVerificationRoute() {
    return (
      <DocumentPageWrapper>
        <VerificationQueuePage />
      </DocumentPageWrapper>
    )
  },
})

const adminDocumentsAuditRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/documents/audit',
  component: function AdminDocumentsAuditRoute() {
    return (
      <DocumentPageWrapper>
        <DocumentAuditPage />
      </DocumentPageWrapper>
    )
  },
})

const adminDocumentDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/documents/$id',
  component: function AdminDocumentDetailRoute() {
    const { id } = adminDocumentDetailRoute.useParams()
    return (
      <DocumentPageWrapper>
        <DocumentDetailPage documentId={id} />
      </DocumentPageWrapper>
    )
  },
})

const adminDocumentHistoryRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/documents/$id/history',
  component: function AdminDocumentHistoryRoute() {
    const { id } = adminDocumentHistoryRoute.useParams()
    return (
      <DocumentPageWrapper>
        <DocumentHistoryPage documentId={id} />
      </DocumentPageWrapper>
    )
  },
})

const adminPensionReportsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/reports/pension',
  component: PensionReportsPage,
})

const adminVerificationReportsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/reports/verification',
  component: () => (
    <PlaceholderPage title="Verification Reports" description="Generate verification compliance reports" icon={FileText} />
  ),
})

const adminProfileUpdatesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/profile-updates',
  component: ProfileUpdatesListPage,
})

const adminProfileUpdateDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/profile-updates/$id',
  component: function AdminProfileUpdateDetailRoute() {
    const { id } = adminProfileUpdateDetailRoute.useParams()
    return <ProfileUpdateDetailPage requestId={id} />
  },
})

const adminTasksSearchSchema = z.object({
  type: z
    .enum(['profile_update', 'life_certificate', 'activation', 'grievance', 'demise', 'restoration'])
    .optional(),
})

const adminTasksRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/tasks',
  validateSearch: adminTasksSearchSchema,
  component: function AdminTasksRoute() {
    const { type } = adminTasksRoute.useSearch()
    return <AdminTasksPage initialType={type ?? 'all'} />
  },
})

const adminLifeCertificateTaskRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/tasks/life-certificate/$id',
  component: function AdminLifeCertificateTaskRoute() {
    const { id } = adminLifeCertificateTaskRoute.useParams()
    return <LifeCertificateReviewPage submissionId={id} />
  },
})

const adminActivationTaskRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/tasks/activation/$id',
  component: function AdminActivationTaskRoute() {
    const { id } = adminActivationTaskRoute.useParams()
    return <ActivationTaskPage pensionerId={id} />
  },
})

const adminGrievanceTaskRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/tasks/grievance/$id',
  component: function AdminGrievanceTaskRoute() {
    const { id } = adminGrievanceTaskRoute.useParams()
    return <GrievanceTaskPage ticketId={id} />
  },
})

const adminDemiseTaskRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/tasks/demise/$id',
  component: function AdminDemiseTaskRoute() {
    const { id } = adminDemiseTaskRoute.useParams()
    return <DemiseTaskPage reportId={id} />
  },
})

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/settings',
  component: () => (
    <PlaceholderPage title="Settings" description="System configuration and admin preferences" icon={Settings} />
  ),
})

const adminIndexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/admin/dashboard' })
  },
})

function guardRole(role: UserRole) {
  return () => {
    const session = getSession()
    if (!session) throw redirect({ to: '/login' })
    if (session.user.role !== role) {
      throw redirect({ to: rolePath(session.user.role) })
    }
  }
}

const accountsDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/accounts/dashboard',
  beforeLoad: () => {
    const session = getSession()
    if (!session) throw redirect({ to: '/login' })
    if (session.user.role !== 'accounts') {
      throw redirect({ to: rolePath(session.user.role) })
    }
    throw redirect({ to: '/accounts/recovery/dashboard' })
  },
})

const recoveryLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recovery',
  component: RecoveryLayout,
  beforeLoad: guardRole('recovery'),
})

const recoveryIndexRoute = createRoute({
  getParentRoute: () => recoveryLayoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/recovery/dashboard' })
  },
})

const recoveryModuleDashboardRoute = createRoute({
  getParentRoute: () => recoveryLayoutRoute,
  path: '/dashboard',
  component: RecoveryDashboardPage,
})

const recoveryCasesRoute = createRoute({
  getParentRoute: () => recoveryLayoutRoute,
  path: '/cases',
  component: RecoveryCasesListPage,
})

const recoveryCreateCaseRoute = createRoute({
  getParentRoute: () => recoveryLayoutRoute,
  path: '/cases/create',
  component: CreateRecoveryCasePage,
})

const recoveryCaseDetailRoute = createRoute({
  getParentRoute: () => recoveryLayoutRoute,
  path: '/cases/$id',
  component: function RecoveryCaseDetailRoute() {
    const { id } = recoveryCaseDetailRoute.useParams()
    return <RecoveryCaseDetailPage caseId={id} />
  },
})

const recoveryDocumentsRoute = createRoute({
  getParentRoute: () => recoveryLayoutRoute,
  path: '/documents',
  component: function RecoveryDocumentsRoute() {
    return (
      <DocumentPageWrapper>
        <DocumentRepositoryPage />
      </DocumentPageWrapper>
    )
  },
})

const recoveryDocumentsUploadRoute = createRoute({
  getParentRoute: () => recoveryLayoutRoute,
  path: '/documents/upload',
  component: function RecoveryDocumentsUploadRoute() {
    return (
      <DocumentPageWrapper>
        <DocumentUploadPage />
      </DocumentPageWrapper>
    )
  },
})

const recoveryDocumentDetailRoute = createRoute({
  getParentRoute: () => recoveryLayoutRoute,
  path: '/documents/$id',
  component: function RecoveryDocumentDetailRoute() {
    const { id } = recoveryDocumentDetailRoute.useParams()
    return (
      <DocumentPageWrapper>
        <DocumentDetailPage documentId={id} />
      </DocumentPageWrapper>
    )
  },
})

const accountsRecoveryLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/accounts/recovery',
  component: RecoveryLayout,
  beforeLoad: guardRole('accounts'),
})

const accountsRecoveryIndexRoute = createRoute({
  getParentRoute: () => accountsRecoveryLayoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/accounts/recovery/dashboard' })
  },
})

const accountsRecoveryDashboardRoute = createRoute({
  getParentRoute: () => accountsRecoveryLayoutRoute,
  path: '/dashboard',
  component: RecoveryDashboardPage,
})

const accountsRecoveryCasesRoute = createRoute({
  getParentRoute: () => accountsRecoveryLayoutRoute,
  path: '/cases',
  component: RecoveryCasesListPage,
})

const accountsRecoveryCaseDetailRoute = createRoute({
  getParentRoute: () => accountsRecoveryLayoutRoute,
  path: '/cases/$id',
  component: function AccountsRecoveryCaseDetailRoute() {
    const { id } = accountsRecoveryCaseDetailRoute.useParams()
    return <RecoveryCaseDetailPage caseId={id} />
  },
})

const adminRecoveryDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/recovery/dashboard',
  component: function AdminRecoveryDashboardRoute() {
    return (
      <RecoveryPageWrapper>
        <RecoveryDashboardPage />
      </RecoveryPageWrapper>
    )
  },
})

const adminRecoveryCasesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/recovery/cases',
  component: function AdminRecoveryCasesRoute() {
    return (
      <RecoveryPageWrapper>
        <RecoveryCasesListPage />
      </RecoveryPageWrapper>
    )
  },
})

const adminRecoveryCaseDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/recovery/cases/$id',
  component: function AdminRecoveryCaseDetailRoute() {
    const { id } = adminRecoveryCaseDetailRoute.useParams()
    return (
      <RecoveryPageWrapper>
        <RecoveryCaseDetailPage caseId={id} />
      </RecoveryPageWrapper>
    )
  },
})

const adminCommunicationNoticeDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/communication/notices/dashboard',
  component: () => (
    <CommunicationPageWrapper>
      <NoticeDashboardPage />
    </CommunicationPageWrapper>
  ),
})

const adminCommunicationNoticesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/communication/notices',
  component: () => (
    <CommunicationPageWrapper>
      <NoticeHistoryPage />
    </CommunicationPageWrapper>
  ),
})

const adminCommunicationCreateNoticeRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/communication/notices/create',
  component: () => (
    <CommunicationPageWrapper>
      <GenerateNoticePage />
    </CommunicationPageWrapper>
  ),
})

const adminCommunicationNoticeDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/communication/notices/$id',
  component: function AdminCommunicationNoticeDetailRoute() {
    const { id } = adminCommunicationNoticeDetailRoute.useParams()
    return (
      <CommunicationPageWrapper>
        <NoticeDetailPage noticeId={id} />
      </CommunicationPageWrapper>
    )
  },
})

const adminCommunicationNotificationDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/communication/notifications/dashboard',
  component: () => (
    <CommunicationPageWrapper>
      <NotificationDashboardPage />
    </CommunicationPageWrapper>
  ),
})

const adminCommunicationNotificationsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/communication/notifications',
  component: () => (
    <CommunicationPageWrapper>
      <NotificationHistoryPage />
    </CommunicationPageWrapper>
  ),
})

const adminCommunicationNoticeTemplatesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/communication/templates/notices',
  component: () => (
    <CommunicationPageWrapper>
      <TemplateManagementPage templateType="notice" />
    </CommunicationPageWrapper>
  ),
})

const adminCommunicationNotificationTemplatesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/communication/templates/notifications',
  component: () => (
    <CommunicationPageWrapper>
      <TemplateManagementPage templateType="notification" />
    </CommunicationPageWrapper>
  ),
})

const adminCommunicationAuditRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/communication/audit',
  component: () => (
    <CommunicationPageWrapper>
      <CommunicationAuditPage />
    </CommunicationPageWrapper>
  ),
})

const communicationLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recovery/communication',
  component: CommunicationLayout,
  beforeLoad: guardRole('recovery'),
})

const communicationRecoveryIndexRoute = createRoute({
  getParentRoute: () => communicationLayoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/recovery/communication/notices/dashboard' })
  },
})

const communicationRecoveryNoticeDashboardRoute = createRoute({
  getParentRoute: () => communicationLayoutRoute,
  path: '/notices/dashboard',
  component: NoticeDashboardPage,
})

const communicationRecoveryNoticesRoute = createRoute({
  getParentRoute: () => communicationLayoutRoute,
  path: '/notices',
  component: NoticeHistoryPage,
})

const communicationRecoveryCreateNoticeRoute = createRoute({
  getParentRoute: () => communicationLayoutRoute,
  path: '/notices/create',
  component: GenerateNoticePage,
})

const communicationRecoveryNoticeDetailRoute = createRoute({
  getParentRoute: () => communicationLayoutRoute,
  path: '/notices/$id',
  component: function CommunicationRecoveryNoticeDetailRoute() {
    const { id } = communicationRecoveryNoticeDetailRoute.useParams()
    return <NoticeDetailPage noticeId={id} />
  },
})

const communicationRecoveryNotificationDashboardRoute = createRoute({
  getParentRoute: () => communicationLayoutRoute,
  path: '/notifications/dashboard',
  component: NotificationDashboardPage,
})

const communicationRecoveryNotificationsRoute = createRoute({
  getParentRoute: () => communicationLayoutRoute,
  path: '/notifications',
  component: NotificationHistoryPage,
})

const communicationRecoveryAuditRoute = createRoute({
  getParentRoute: () => communicationLayoutRoute,
  path: '/audit',
  component: CommunicationAuditPage,
})

const accountsCommunicationLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/accounts/communication',
  component: CommunicationLayout,
  beforeLoad: guardRole('accounts'),
})

const accountsCommunicationIndexRoute = createRoute({
  getParentRoute: () => accountsCommunicationLayoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/accounts/communication/notices/dashboard' })
  },
})

const accountsCommunicationNoticeDashboardRoute = createRoute({
  getParentRoute: () => accountsCommunicationLayoutRoute,
  path: '/notices/dashboard',
  component: NoticeDashboardPage,
})

const accountsCommunicationNoticesRoute = createRoute({
  getParentRoute: () => accountsCommunicationLayoutRoute,
  path: '/notices',
  component: NoticeHistoryPage,
})

const accountsCommunicationCreateNoticeRoute = createRoute({
  getParentRoute: () => accountsCommunicationLayoutRoute,
  path: '/notices/create',
  component: GenerateNoticePage,
})

const accountsCommunicationNoticeDetailRoute = createRoute({
  getParentRoute: () => accountsCommunicationLayoutRoute,
  path: '/notices/$id',
  component: function AccountsCommunicationNoticeDetailRoute() {
    const { id } = accountsCommunicationNoticeDetailRoute.useParams()
    return <NoticeDetailPage noticeId={id} />
  },
})

const accountsCommunicationNotificationDashboardRoute = createRoute({
  getParentRoute: () => accountsCommunicationLayoutRoute,
  path: '/notifications/dashboard',
  component: NotificationDashboardPage,
})

const accountsCommunicationNotificationsRoute = createRoute({
  getParentRoute: () => accountsCommunicationLayoutRoute,
  path: '/notifications',
  component: NotificationHistoryPage,
})

const accountsCommunicationAuditRoute = createRoute({
  getParentRoute: () => accountsCommunicationLayoutRoute,
  path: '/audit',
  component: CommunicationAuditPage,
})

const auditLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/audit',
  component: AuditLayout,
  beforeLoad: guardRole('audit'),
})

const auditIndexRoute = createRoute({
  getParentRoute: () => auditLayoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/audit/dashboard' })
  },
})

const auditDashboardRoute = createRoute({
  getParentRoute: () => auditLayoutRoute,
  path: '/dashboard',
  component: AuditDashboardPage,
})

const auditLogsRoute = createRoute({
  getParentRoute: () => auditLayoutRoute,
  path: '/logs',
  component: AuditLogsPage,
})

const auditComplianceRoute = createRoute({
  getParentRoute: () => auditLayoutRoute,
  path: '/compliance',
  component: AuditCompliancePage,
})

const auditModuleRecoveryRoute = createRoute({
  getParentRoute: () => auditLayoutRoute,
  path: '/modules/recovery',
  component: () => <AuditModuleTrailPage module="recovery" />,
})

const auditModuleCommunicationRoute = createRoute({
  getParentRoute: () => auditLayoutRoute,
  path: '/modules/communication',
  component: () => <AuditModuleTrailPage module="communication" />,
})

const auditModuleDocumentsRoute = createRoute({
  getParentRoute: () => auditLayoutRoute,
  path: '/modules/documents',
  component: () => <AuditModuleTrailPage module="documents" />,
})

const helpdeskLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/helpdesk',
  component: GrievanceLayout,
  beforeLoad: guardRole('helpdesk'),
})

const helpdeskIndexRoute = createRoute({
  getParentRoute: () => helpdeskLayoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/helpdesk/dashboard' })
  },
})

const helpdeskDashboardRoute = createRoute({
  getParentRoute: () => helpdeskLayoutRoute,
  path: '/dashboard',
  component: GrievanceDashboardPage,
})

const helpdeskTicketsRoute = createRoute({
  getParentRoute: () => helpdeskLayoutRoute,
  path: '/tickets',
  component: GrievanceTicketsPage,
})

const helpdeskTicketDetailRoute = createRoute({
  getParentRoute: () => helpdeskLayoutRoute,
  path: '/tickets/$id',
  component: function HelpdeskTicketDetailRoute() {
    const { id } = helpdeskTicketDetailRoute.useParams()
    return <GrievanceTicketDetailPage ticketId={id} />
  },
})

const helpdeskReportsRoute = createRoute({
  getParentRoute: () => helpdeskLayoutRoute,
  path: '/reports',
  component: GrievanceReportsPage,
})

const helpdeskAuditRoute = createRoute({
  getParentRoute: () => helpdeskLayoutRoute,
  path: '/audit',
  component: GrievanceAuditPage,
})

const adminGrievanceDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/grievance/dashboard',
  component: () => (
    <GrievancePageWrapper>
      <GrievanceDashboardPage />
    </GrievancePageWrapper>
  ),
})

const adminGrievanceTicketsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/grievance/tickets',
  component: () => (
    <GrievancePageWrapper>
      <GrievanceTicketsPage />
    </GrievancePageWrapper>
  ),
})

const adminGrievanceTicketDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/grievance/tickets/$id',
  component: function AdminGrievanceTicketDetailRoute() {
    const { id } = adminGrievanceTicketDetailRoute.useParams()
    return (
      <GrievancePageWrapper>
        <GrievanceTicketDetailPage ticketId={id} />
      </GrievancePageWrapper>
    )
  },
})

const adminGrievanceReportsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/grievance/reports',
  component: () => (
    <GrievancePageWrapper>
      <GrievanceReportsPage />
    </GrievancePageWrapper>
  ),
})

const adminGrievanceAuditRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/grievance/audit',
  component: () => (
    <GrievancePageWrapper>
      <GrievanceAuditPage />
    </GrievancePageWrapper>
  ),
})

const superAdminGrievanceDashboardRoute = createRoute({
  getParentRoute: () => superAdminLayoutRoute,
  path: '/grievance/dashboard',
  component: () => (
    <GrievancePageWrapper>
      <GrievanceDashboardPage />
    </GrievancePageWrapper>
  ),
})

const superAdminGrievanceTicketsRoute = createRoute({
  getParentRoute: () => superAdminLayoutRoute,
  path: '/grievance/tickets',
  component: () => (
    <GrievancePageWrapper>
      <GrievanceTicketsPage />
    </GrievancePageWrapper>
  ),
})

const superAdminGrievanceTicketDetailRoute = createRoute({
  getParentRoute: () => superAdminLayoutRoute,
  path: '/grievance/tickets/$id',
  component: function SuperAdminGrievanceTicketDetailRoute() {
    const { id } = superAdminGrievanceTicketDetailRoute.useParams()
    return (
      <GrievancePageWrapper>
        <GrievanceTicketDetailPage ticketId={id} />
      </GrievancePageWrapper>
    )
  },
})

const superAdminGrievanceReportsRoute = createRoute({
  getParentRoute: () => superAdminLayoutRoute,
  path: '/grievance/reports',
  component: () => (
    <GrievancePageWrapper>
      <GrievanceReportsPage />
    </GrievancePageWrapper>
  ),
})

const superAdminGrievanceAuditRoute = createRoute({
  getParentRoute: () => superAdminLayoutRoute,
  path: '/grievance/audit',
  component: () => (
    <GrievancePageWrapper>
      <GrievanceAuditPage />
    </GrievancePageWrapper>
  ),
})

const pensionerLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pensioner',
  component: PensionerLayout,
  beforeLoad: guardRole('pensioner'),
})

const pensionerDashboardRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/dashboard',
  component: PensionerDashboardPage,
})

const pensionerProfileRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/profile',
  component: ProfilePage,
})

const pensionerProfileRequestRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/profile/request',
  component: RequestUpdatePage,
})

const pensionerProfileRequestsRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/profile/requests',
  component: MyRequestsPage,
})

const pensionerProfileRequestDetailRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/profile/requests/$id',
  component: function PensionerProfileRequestDetailRoute() {
    const { id } = pensionerProfileRequestDetailRoute.useParams()
    return <PensionerRequestDetailPage requestId={id} />
  },
})

const pensionerPensionSearchSchema = z.object({
  month: z.string().optional(),
})

const pensionerPensionRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/pension',
  validateSearch: pensionerPensionSearchSchema,
  component: function PensionerPensionRoute() {
    const { month } = pensionerPensionRoute.useSearch()
    return <PensionDetailsPage month={month} />
  },
})

const pensionerPensionHistoryRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/pension/history',
  component: PensionHistoryPage,
})

const pensionerVerificationSearchSchema = z.object({
  action: z.enum(['resubmit']).optional(),
})

const pensionerVerificationRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/verification',
  validateSearch: pensionerVerificationSearchSchema,
  beforeLoad: ({ search }) => {
    if (search.action === 'resubmit') {
      throw redirect({
        to: '/pensioner/verification/start',
        search: { mode: 'resubmit' },
      })
    }
  },
  component: LifeCertificatePage,
})

const pensionerVerificationStartSearchSchema = z.object({
  mode: z.enum(['resubmit']).optional(),
})

const pensionerVerificationStartRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/verification/start',
  validateSearch: pensionerVerificationStartSearchSchema,
  component: function PensionerVerificationStartRoute() {
    const { mode } = pensionerVerificationStartRoute.useSearch()
    return <VerificationStartPage mode={mode} />
  },
})

const pensionerDocumentsRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/documents',
  component: DocumentsPage,
})

const pensionerDocumentsUploadRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/documents/upload',
  component: PensionerDocumentUploadPage,
})

const pensionerDocumentDetailRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/documents/$id',
  component: function PensionerDocumentDetailRouteComponent() {
    const { id } = pensionerDocumentDetailRoute.useParams()
    return <PensionerDocumentDetailPage documentId={id} />
  },
})

const pensionerNotificationsRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/notifications',
  component: NotificationsPage,
})

const pensionerStatementsRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/statements',
  component: PensionStatementsPage,
})

const pensionerRecoveryRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/recovery',
  component: RecoveryPage,
})

const pensionerGrievanceIndexRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/grievance',
  beforeLoad: () => {
    throw redirect({ to: '/pensioner/grievance/tickets' })
  },
})

const pensionerGrievanceRaiseRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/grievance/raise',
  component: RaiseTicketPage,
})

const pensionerGrievanceTicketsRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/grievance/tickets',
  component: MyTicketsPage,
})

const pensionerGrievanceHistoryRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/grievance/history',
  component: TicketHistoryPage,
})

const pensionerGrievanceDetailRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/grievance/$id',
  component: function PensionerGrievanceDetailRoute() {
    const { id } = pensionerGrievanceDetailRoute.useParams()
    return <PensionerTicketDetailPage ticketId={id} />
  },
})

const pensionerDemiseRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/demise',
  component: DemiseReportingPage,
})

const pensionerSuspensionRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/suspension',
  component: SuspensionStatusPage,
})

const pensionerRestorationFormRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/suspension/restoration',
  component: RestorationRequestPage,
})

const pensionerRestorationRequestsRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/suspension/requests',
  component: MyRestorationRequestsPage,
})

const pensionerRestorationRequestDetailRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/suspension/requests/$id',
  component: function PensionerRestorationRequestDetailRoute() {
    const { id } = pensionerRestorationRequestDetailRoute.useParams()
    return <RestorationRequestDetailPage requestId={id} />
  },
})

const pensionerSettingsRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/settings',
  component: PensionerSettingsPage,
})

const pensionerIndexRoute = createRoute({
  getParentRoute: () => pensionerLayoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/pensioner/dashboard' })
  },
})

const superAdminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/superadmin',
  component: SuperAdminLayout,
  beforeLoad: guardRole('super_admin'),
})

const superAdminDashboardRoute = createRoute({
  getParentRoute: () => superAdminLayoutRoute,
  path: '/dashboard',
  component: SuperAdminDashboardPage,
})

const superAdminIndexRoute = createRoute({
  getParentRoute: () => superAdminLayoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/superadmin/dashboard' })
  },
})

const superAdminAdminUsersRoute = createRoute({
  getParentRoute: () => superAdminLayoutRoute,
  path: '/admin-users',
  component: AdminUsersPage,
})

const superAdminDepartmentsRoute = createRoute({
  getParentRoute: () => superAdminLayoutRoute,
  path: '/departments',
  component: DepartmentsPage,
})

const superAdminRolesRoute = createRoute({
  getParentRoute: () => superAdminLayoutRoute,
  path: '/roles',
  component: RolesPermissionsPage,
})

const superAdminSettingsRoute = createRoute({
  getParentRoute: () => superAdminLayoutRoute,
  path: '/settings',
  component: SystemSettingsPage,
})

const superAdminAuditRoute = createRoute({
  getParentRoute: () => superAdminLayoutRoute,
  path: '/audit-logs',
  component: () => (
    <SuperAdminPlaceholderPage title="Audit Logs" description="Immutable system-wide audit trail" />
  ),
})

const superAdminSecurityRoute = createRoute({
  getParentRoute: () => superAdminLayoutRoute,
  path: '/security',
  component: () => (
    <SuperAdminPlaceholderPage title="Security" description="Authentication policies, sessions, and access controls" />
  ),
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  pensionerLoginRoute,
  pensionerActivateRoute,
  nomineeLayoutRoute.addChildren([nomineeIndexRoute, nomineeLoginRoute, nomineeDemiseRoute]),
  registerRoute,
  dashboardPreviewRoute,
  adminLoginRedirectRoute,
  accountsDashboardRoute,
  recoveryLayoutRoute.addChildren([
    recoveryIndexRoute,
    recoveryModuleDashboardRoute,
    recoveryCasesRoute,
    recoveryCreateCaseRoute,
    recoveryCaseDetailRoute,
    recoveryDocumentsRoute,
    recoveryDocumentsUploadRoute,
    recoveryDocumentDetailRoute,
  ]),
  accountsRecoveryLayoutRoute.addChildren([
    accountsRecoveryIndexRoute,
    accountsRecoveryDashboardRoute,
    accountsRecoveryCasesRoute,
    accountsRecoveryCaseDetailRoute,
  ]),
  communicationLayoutRoute.addChildren([
    communicationRecoveryIndexRoute,
    communicationRecoveryNoticeDashboardRoute,
    communicationRecoveryNoticesRoute,
    communicationRecoveryCreateNoticeRoute,
    communicationRecoveryNoticeDetailRoute,
    communicationRecoveryNotificationDashboardRoute,
    communicationRecoveryNotificationsRoute,
    communicationRecoveryAuditRoute,
  ]),
  accountsCommunicationLayoutRoute.addChildren([
    accountsCommunicationIndexRoute,
    accountsCommunicationNoticeDashboardRoute,
    accountsCommunicationNoticesRoute,
    accountsCommunicationCreateNoticeRoute,
    accountsCommunicationNoticeDetailRoute,
    accountsCommunicationNotificationDashboardRoute,
    accountsCommunicationNotificationsRoute,
    accountsCommunicationAuditRoute,
  ]),
  auditLayoutRoute.addChildren([
    auditIndexRoute,
    auditDashboardRoute,
    auditLogsRoute,
    auditComplianceRoute,
    auditModuleRecoveryRoute,
    auditModuleCommunicationRoute,
    auditModuleDocumentsRoute,
  ]),
  helpdeskLayoutRoute.addChildren([
    helpdeskIndexRoute,
    helpdeskDashboardRoute,
    helpdeskTicketsRoute,
    helpdeskTicketDetailRoute,
    helpdeskReportsRoute,
    helpdeskAuditRoute,
  ]),
  pensionerLayoutRoute.addChildren([
    pensionerIndexRoute,
    pensionerDashboardRoute,
    pensionerProfileRoute,
    pensionerProfileRequestRoute,
    pensionerProfileRequestsRoute,
    pensionerProfileRequestDetailRoute,
    pensionerPensionRoute,
    pensionerPensionHistoryRoute,
    pensionerVerificationRoute,
    pensionerVerificationStartRoute,
    pensionerDocumentsRoute,
    pensionerDocumentsUploadRoute,
    pensionerDocumentDetailRoute,
    pensionerNotificationsRoute,
    pensionerStatementsRoute,
    pensionerRecoveryRoute,
    pensionerGrievanceIndexRoute,
    pensionerGrievanceRaiseRoute,
    pensionerGrievanceTicketsRoute,
    pensionerGrievanceHistoryRoute,
    pensionerGrievanceDetailRoute,
    pensionerDemiseRoute,
    pensionerSuspensionRoute,
    pensionerRestorationFormRoute,
    pensionerRestorationRequestsRoute,
    pensionerRestorationRequestDetailRoute,
    pensionerSettingsRoute,
  ]),
  superAdminLayoutRoute.addChildren([
    superAdminIndexRoute,
    superAdminDashboardRoute,
    superAdminAdminUsersRoute,
    superAdminDepartmentsRoute,
    superAdminRolesRoute,
    superAdminSettingsRoute,
    superAdminAuditRoute,
    superAdminSecurityRoute,
    superAdminGrievanceDashboardRoute,
    superAdminGrievanceTicketsRoute,
    superAdminGrievanceTicketDetailRoute,
    superAdminGrievanceReportsRoute,
    superAdminGrievanceAuditRoute,
  ]),
  adminLayoutRoute.addChildren([
    adminIndexRoute,
    adminDashboardRoute,
    adminPensionersRoute,
    adminAddPensionerRoute,
    adminBulkImportRoute,
    adminBulkDisbursementRoute,
    adminPaymentMonthComparisonRoute,
    adminManualDisbursementRoute,
    adminPendingActivationsRoute,
    adminEditPensionerRoute,
    adminViewPensionerRoute,
    adminPensionStructureRoute,
    adminVerificationApprovedRoute,
    adminVerificationRejectedRoute,
    adminSuspensionsRoute,
    adminCreateSuspensionRoute,
    adminRestorationRoute,
    adminRestorationDetailRoute,
    adminSuspensionDetailRoute,
    adminDemiseIndexRoute,
    adminDemiseDashboardRoute,
    adminDemiseRequestsRoute,
    adminDemiseRequestDetailRoute,
    adminDeceasedRoute,
    adminDeceasedDetailRoute,
    adminFamilyPensionRoute,
    adminFamilyPensionDetailRoute,
    adminDocumentsIndexRoute,
    adminDocumentsDashboardRoute,
    adminDocumentsRepositoryRoute,
    adminDocumentsUploadRoute,
    adminDocumentsVerificationRoute,
    adminDocumentsAuditRoute,
    adminDocumentHistoryRoute,
    adminDocumentDetailRoute,
    adminPensionReportsRoute,
    adminVerificationReportsRoute,
    adminProfileUpdatesRoute,
    adminProfileUpdateDetailRoute,
    adminTasksRoute,
    adminLifeCertificateTaskRoute,
    adminActivationTaskRoute,
    adminGrievanceTaskRoute,
    adminDemiseTaskRoute,
    adminSettingsRoute,
    adminRecoveryDashboardRoute,
    adminRecoveryCasesRoute,
    adminRecoveryCaseDetailRoute,
    adminGrievanceDashboardRoute,
    adminGrievanceTicketsRoute,
    adminGrievanceTicketDetailRoute,
    adminGrievanceReportsRoute,
    adminGrievanceAuditRoute,
    adminCommunicationNoticeDashboardRoute,
    adminCommunicationNoticesRoute,
    adminCommunicationCreateNoticeRoute,
    adminCommunicationNoticeDetailRoute,
    adminCommunicationNotificationDashboardRoute,
    adminCommunicationNotificationsRoute,
    adminCommunicationNoticeTemplatesRoute,
    adminCommunicationNotificationTemplatesRoute,
    adminCommunicationAuditRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

import featureAuditLogs from '@/assets/features/feature-audit-logs.png'
import featureDocumentManagement from '@/assets/features/feature-document-management.png'
import featureInstallmentTracking from '@/assets/features/feature-installment-tracking.png'
import featureLifeVerification from '@/assets/features/feature-life-verification.png'
import featureNotifications from '@/assets/features/feature-notifications.png'
import featurePensionerManagement from '@/assets/features/feature-pensioner-management.png'
import featureRecoveryManagement from '@/assets/features/feature-recovery-management.png'
import featureRoleManagement from '@/assets/features/feature-role-management.png'
import showcaseAdminDashboard from '@/assets/showcase/showcase-admin-dashboard.png'
import showcaseRecoveryCases from '@/assets/showcase/showcase-recovery-cases.png'
import showcaseReports from '@/assets/showcase/showcase-reports.png'
import showcaseVerification from '@/assets/showcase/showcase-verification.png'
import recoveryApproval from '@/assets/recovery-flow/recovery-approval.png'
import recoveryComplete from '@/assets/recovery-flow/recovery-complete.png'
import recoveryCreateCase from '@/assets/recovery-flow/recovery-create-case.png'
import recoveryExcessPensionFound from '@/assets/recovery-flow/recovery-excess-pension-found.png'
import recoveryInstallments from '@/assets/recovery-flow/recovery-installments.png'
import registerPensionerCapture from '@/assets/videos/register-pensioner-capture.mp4'
import heroRegisterPensioner from '@/assets/videos/hero-register-pensioner.mp4'

export const workflowVideos = {
  registerPensionerCapture,
} as const

export const heroVideos = {
  registerPensioner: heroRegisterPensioner,
} as const

export const showcaseImages = {
  admin: showcaseAdminDashboard,
  verification: showcaseVerification,
  recovery: showcaseRecoveryCases,
  reports: showcaseReports,
} as const

export const featurePosterImages = [
  featurePensionerManagement,
  featureLifeVerification,
  featureRecoveryManagement,
  featureInstallmentTracking,
  featureDocumentManagement,
  featureAuditLogs,
  featureNotifications,
  featureRoleManagement,
] as const

export const recoveryFlowImages = [
  recoveryExcessPensionFound,
  recoveryCreateCase,
  recoveryApproval,
  recoveryInstallments,
  recoveryComplete,
] as const

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { PensionerPageShell, StepTransition } from '@/components/pensioner/shared/pensioner-page-ui'
import { DocumentUploadStep } from '@/components/pensioner/verification/document-upload-step'
import { FaceCaptureStep } from '@/components/pensioner/verification/face-capture-step'
import { VerificationFlowShell } from '@/components/pensioner/verification/verification-flow-shell'
import { LivenessCheckStep } from '@/components/pensioner/verification/liveness-check-step'
import { LocationCaptureStep } from '@/components/pensioner/verification/location-capture-step'
import { OtpVerificationStep } from '@/components/pensioner/verification/otp-verification-step'
import { VerificationSummaryStep } from '@/components/pensioner/verification/verification-summary-step'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  fetchVerificationData,
  submitVerification,
  updateVerificationProgress,
} from '@/data/pensioner-api'
import { captureDeviceInfo } from '@/lib/verification-capture'
import { useAuth } from '@/providers/auth-provider'
import type {
  VerificationDeviceInfo,
  VerificationGeoLocation,
  VerificationUploadedDocument,
} from '@/types/verification-submission'

interface VerificationStartPageProps {
  mode?: 'resubmit'
}

export function VerificationStartPage({ mode }: VerificationStartPageProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { user } = useAuth()
  const pensionerId = user?.pensionerId ?? ''
  const initializedRef = useRef(false)

  const [wizardStep, setWizardStep] = useState(1)
  const [faceCaptureTimestamp, setFaceCaptureTimestamp] = useState<string | null>(null)
  const [faceMatchScore, setFaceMatchScore] = useState<number | null>(null)
  const [facePreviewUrl, setFacePreviewUrl] = useState<string | null>(null)
  const [livenessScore, setLivenessScore] = useState<number | null>(null)
  const [livenessTimestamp, setLivenessTimestamp] = useState<string | null>(null)
  const [geoLocation, setGeoLocation] = useState<VerificationGeoLocation | null>(null)
  const [deviceInfo, setDeviceInfo] = useState<VerificationDeviceInfo | null>(null)
  const [uploadedDocuments, setUploadedDocuments] = useState<VerificationUploadedDocument[]>([])
  const [declaration, setDeclaration] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['pensioner-verification', pensionerId],
    queryFn: () => fetchVerificationData(pensionerId),
    enabled: !!pensionerId,
    staleTime: 0,
    refetchOnMount: 'always',
  })

  const invalidateVerificationQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['pensioner-verification', pensionerId] })
    queryClient.invalidateQueries({ queryKey: ['pensioner-dashboard', pensionerId] })
    queryClient.invalidateQueries({ queryKey: ['pensioner-notifications'] })
  }, [pensionerId, queryClient])

  const submitMutation = useMutation({
    mutationFn: (verification: Parameters<typeof submitVerification>[1]) =>
      submitVerification(pensionerId, verification),
    onSuccess: (entry) => {
      invalidateVerificationQueries()
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['admin-task-counts'] })
      queryClient.invalidateQueries({ queryKey: ['pending-admin-task-count'] })
      const isResubmission = entry.remarks?.includes('Resubmitted')
      toast.success(
        isResubmission ? 'Life certificate resubmitted successfully' : 'Life certificate submitted successfully',
        { description: 'Your submission is awaiting admin review.' },
      )
      void navigate({ to: '/pensioner/verification' })
    },
  })

  useEffect(() => {
    if (initializedRef.current || isLoading || !pensionerId || !data) return
    initializedRef.current = true

    setDeviceInfo(captureDeviceInfo())

    if (data.status !== 'rejected') {
      void updateVerificationProgress('in_progress', pensionerId).then(() => {
        invalidateVerificationQueries()
      })
    }
  }, [data, invalidateVerificationQueries, isLoading, pensionerId])

  const handleSubmit = () => {
    if (!declaration) {
      toast.error('Please accept the declaration')
      return
    }
    if (!faceCaptureTimestamp || faceMatchScore === null || !livenessScore || !livenessTimestamp) {
      toast.error('Complete face capture and liveness checks')
      return
    }
    if (!geoLocation) {
      toast.error('Capture your location before submitting')
      return
    }
    if (!deviceInfo) {
      toast.error('Device information missing — restart the verification')
      return
    }
    if (!uploadedDocuments.length) {
      toast.error('Upload at least one supporting document')
      return
    }
    submitMutation.mutate({
      faceCaptureTimestamp,
      faceMatchScore,
      livenessScore,
      livenessTimestamp,
      geoLocation,
      deviceInfo,
      uploadedDocuments,
    })
  }

  if (isLoading || !data) return <PageLoadingSkeleton />

  const isResubmission = mode === 'resubmit' || data.status === 'rejected' || !!data.rejectionReason

  return (
    <PensionerPageShell>
      <VerificationFlowShell currentStep={wizardStep}>
        <StepTransition stepKey={wizardStep}>
          {wizardStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  {isResubmission ? 'Resubmit your life certificate' : 'Before you begin'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Complete all steps to submit your annual digital life certificate securely.
                </p>
              </div>

              {data.rejectionReason && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
                  <p className="font-semibold text-destructive">Previous rejection reason</p>
                  <p className="mt-1 text-muted-foreground">{data.rejectionReason}</p>
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  'Ensure good lighting and a plain background',
                  'Keep your face clearly visible without mask or cap',
                  'Allow camera and location access when prompted',
                  'Have your registered mobile ready for OTP',
                  'Upload supporting documents (Aadhaar, photo ID)',
                  'Read and accept the declaration before submission',
                ].map((tip) => (
                  <div
                    key={tip}
                    className="flex items-start gap-2.5 rounded-xl border border-border/50 bg-muted/30 px-3.5 py-3 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    {tip}
                  </div>
                ))}
              </div>

              <Button className="rounded-xl px-6" size="lg" onClick={() => setWizardStep(2)}>
                I understand — continue
              </Button>
            </div>
          )}

          {wizardStep === 2 && (
            <FaceCaptureStep
              onComplete={({ timestamp, score, imageDataUrl }) => {
                setFaceCaptureTimestamp(timestamp)
                setFaceMatchScore(score)
                setFacePreviewUrl(imageDataUrl)
                if (!deviceInfo) setDeviceInfo(captureDeviceInfo())
              }}
              onContinue={() => setWizardStep(3)}
            />
          )}

          {wizardStep === 3 && (
            <LivenessCheckStep
              onComplete={({ timestamp, score }) => {
                setLivenessScore(score)
                setLivenessTimestamp(timestamp)
              }}
              onContinue={() => setWizardStep(4)}
            />
          )}

          {wizardStep === 4 && (
            <LocationCaptureStep
              location={geoLocation}
              onCaptured={setGeoLocation}
              onContinue={() => setWizardStep(5)}
            />
          )}

          {wizardStep === 5 && (
            <OtpVerificationStep onVerified={() => setWizardStep(6)} />
          )}

          {wizardStep === 6 && (
            <DocumentUploadStep
              documents={uploadedDocuments}
              onDocumentsChange={setUploadedDocuments}
              onContinue={() => setWizardStep(7)}
            />
          )}

          {wizardStep === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Declaration</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Please read and accept the declaration to proceed.
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 text-sm leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">Life Certificate Declaration</p>
                <p className="mt-3">
                  I hereby declare that I am alive and entitled to receive pension as per the Pension Payment Order.
                  The information and biometric data provided are true and correct to the best of my knowledge.
                  I understand that false declarations may lead to suspension of pension benefits.
                </p>
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/20">
                <Checkbox checked={declaration} onCheckedChange={(v) => setDeclaration(v === true)} />
                <span className="text-sm leading-relaxed">
                  I accept the above declaration and confirm that all submitted information is accurate.
                </span>
              </label>
              <Button
                className="w-full rounded-xl"
                size="lg"
                onClick={() => setWizardStep(8)}
                disabled={!declaration}
              >
                Continue to review
              </Button>
            </div>
          )}

          {wizardStep === 8 && (
            <VerificationSummaryStep
              facePreviewUrl={facePreviewUrl}
              faceMatchScore={faceMatchScore}
              faceCaptureTimestamp={faceCaptureTimestamp}
              livenessScore={livenessScore}
              livenessTimestamp={livenessTimestamp}
              geoLocation={geoLocation}
              deviceInfo={deviceInfo}
              uploadedDocuments={uploadedDocuments}
              declarationAccepted={declaration}
              isResubmission={isResubmission}
              isSubmitting={submitMutation.isPending}
              onSubmit={handleSubmit}
            />
          )}
        </StepTransition>
      </VerificationFlowShell>
    </PensionerPageShell>
  )
}

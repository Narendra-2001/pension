import { motion } from 'framer-motion'
import {
  CheckCircle2,
  FileText,
  Fingerprint,
  Loader2,
  MapPin,
  Monitor,
  ScanFace,
  ShieldCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatCaptureTimestamp } from '@/lib/verification-capture'
import { cn } from '@/lib/utils'
import type {
  VerificationDeviceInfo,
  VerificationGeoLocation,
  VerificationUploadedDocument,
} from '@/types/verification-submission'

interface SummaryRowProps {
  icon: React.ElementType
  label: string
  value: string
  subValue?: string
  status?: 'passed' | 'pending'
  className?: string
}

function SummaryRow({ icon: Icon, label, value, subValue, status = 'passed', className }: SummaryRowProps) {
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border border-border/50 bg-background p-4', className)}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-semibold">{value}</p>
        {subValue && <p className="mt-0.5 text-xs text-muted-foreground">{subValue}</p>}
      </div>
      {status === 'passed' && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <CheckCircle2 className="size-3" />
          Passed
        </span>
      )}
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface VerificationSummaryStepProps {
  facePreviewUrl: string | null
  faceMatchScore: number | null
  faceCaptureTimestamp: string | null
  livenessScore: number | null
  livenessTimestamp: string | null
  geoLocation: VerificationGeoLocation | null
  deviceInfo: VerificationDeviceInfo | null
  uploadedDocuments: VerificationUploadedDocument[]
  declarationAccepted: boolean
  isResubmission: boolean
  isSubmitting: boolean
  onSubmit: () => void
}

export function VerificationSummaryStep({
  facePreviewUrl,
  faceMatchScore,
  faceCaptureTimestamp,
  livenessScore,
  livenessTimestamp,
  geoLocation,
  deviceInfo,
  uploadedDocuments,
  declarationAccepted,
  isResubmission,
  isSubmitting,
  onSubmit,
}: VerificationSummaryStepProps) {
  const checksPassed =
    faceMatchScore !== null &&
    livenessScore !== null &&
    geoLocation !== null &&
    uploadedDocuments.length > 0 &&
    declarationAccepted

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-xl font-semibold tracking-tight">Review your submission</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm all verification details before submitting for admin review.
        </p>
      </div>

      {/* Identity hero card */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
        <div className="flex flex-col sm:flex-row">
          {facePreviewUrl && (
            <div className="relative shrink-0 border-b border-border/50 sm:w-44 sm:border-b-0 sm:border-r">
              <img
                src={facePreviewUrl}
                alt="Captured face"
                className="aspect-square w-full object-cover sm:size-44"
              />
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">
                <Fingerprint className="size-3" />
                Biometric capture
              </span>
            </div>
          )}
          <div className="flex flex-1 flex-col justify-center p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Identity verification
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {faceMatchScore ?? '—'}%
                  <span className="ml-1 text-base font-medium text-muted-foreground">match</span>
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-200">
                <ShieldCheck className="size-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Face captured</p>
                <p className="text-xs font-medium">
                  {faceCaptureTimestamp ? formatCaptureTimestamp(faceCaptureTimestamp) : '—'}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Liveness score</p>
                <p className="text-xs font-medium">
                  {livenessScore ?? '—'}% · {livenessTimestamp ? formatCaptureTimestamp(livenessTimestamp) : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification checks grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryRow
          icon={ScanFace}
          label="Face match"
          value={`${faceMatchScore ?? '—'}% confidence`}
          subValue={faceCaptureTimestamp ? formatCaptureTimestamp(faceCaptureTimestamp) : undefined}
        />
        <SummaryRow
          icon={Fingerprint}
          label="Liveness check"
          value={`${livenessScore ?? '—'}% — No spoof detected`}
          subValue={livenessTimestamp ? formatCaptureTimestamp(livenessTimestamp) : undefined}
        />
        <SummaryRow
          icon={MapPin}
          label="Geo-location"
          value={geoLocation?.label ?? 'Location captured'}
          subValue={
            geoLocation
              ? `${geoLocation.latitude.toFixed(4)}°, ${geoLocation.longitude.toFixed(4)}°${
                  geoLocation.accuracy ? ` · ±${Math.round(geoLocation.accuracy)}m` : ''
                }`
              : undefined
          }
        />
        <SummaryRow
          icon={Monitor}
          label="Device"
          value={deviceInfo?.platform ?? 'Unknown device'}
          subValue={
            deviceInfo
              ? `${deviceInfo.screenResolution} · ${deviceInfo.timezone}`
              : undefined
          }
        />
      </div>

      {/* Documents */}
      <div className="rounded-2xl border border-border/60 bg-background p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Supporting documents</p>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium tabular-nums">
            {uploadedDocuments.length} file{uploadedDocuments.length !== 1 ? 's' : ''}
          </span>
        </div>
        <ul className="space-y-2">
          {uploadedDocuments.map((doc) => (
            <li
              key={doc.fileName}
              className="flex items-center gap-3 rounded-xl border border-border/40 px-3 py-2.5"
            >
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{doc.fileName}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</p>
              </div>
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            </li>
          ))}
        </ul>
      </div>

      {/* Declaration badge */}
      {declarationAccepted && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-800">Declaration accepted and recorded</p>
        </div>
      )}

      {/* Submit */}
      <motion.div whileTap={{ scale: 0.99 }}>
        <Button
          size="lg"
          className="h-12 w-full rounded-xl text-base font-semibold"
          onClick={onSubmit}
          disabled={!checksPassed || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Submitting verification...
            </>
          ) : isResubmission ? (
            'Resubmit Life Certificate'
          ) : (
            'Submit Life Certificate'
          )}
        </Button>
      </motion.div>

      <p className="text-center text-xs text-muted-foreground">
        Your submission will be reviewed by the pension administrator. You will be notified once approved or rejected.
      </p>
    </div>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  History,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { DocumentAuditTimeline } from '@/components/documents/document-audit-timeline'
import { DocumentPreviewPanel } from '@/components/documents/document-preview-panel'
import { DocumentStatusBadge } from '@/components/documents/document-status-badge'
import {
  documentHistoryPath,
  documentUploadPath,
  useDocumentPortal,
} from '@/components/documents/document-portal-context'
import { RejectDocumentDialog } from '@/components/documents/reject-document-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  downloadDocumentApi,
  fetchDocumentAuditLog,
  fetchDocumentById,
  markUnderReviewApi,
  rejectDocumentApi,
  requestReuploadApi,
  verifyDocumentApi,
} from '@/data/documents-api'
import {
  DOCUMENT_INTEGRATION_LABELS,
  DOCUMENT_REJECTION_REASON_LABELS,
  DOCUMENT_TYPE_LABELS,
  getDocumentCurrentVersion,
  isPendingVerification,
} from '@/lib/documents'
import {
  requestReuploadSchema,
  verifyDocumentSchema,
  type RejectDocumentFormValues,
  type RequestReuploadFormValues,
  type VerifyDocumentFormValues,
} from '@/lib/documents-schema'
import { useAuth } from '@/providers/auth-provider'

interface DocumentDetailPageProps {
  documentId: string
}

export function DocumentDetailPage({ documentId }: DocumentDetailPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { basePath, permissions } = useDocumentPortal()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reuploadOpen, setReuploadOpen] = useState(false)

  const { data: document, isLoading } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => fetchDocumentById(documentId),
  })

  const { data: auditLog } = useQuery({
    queryKey: ['document-audit', documentId],
    queryFn: () => fetchDocumentAuditLog(documentId),
  })

  const verifyForm = useForm<VerifyDocumentFormValues>({
    resolver: zodResolver(verifyDocumentSchema),
    defaultValues: { verificationNotes: '' },
  })

  const reuploadForm = useForm<RequestReuploadFormValues>({
    resolver: zodResolver(requestReuploadSchema),
    defaultValues: { notes: '' },
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['document', documentId] })
    queryClient.invalidateQueries({ queryKey: ['documents-repository'] })
    queryClient.invalidateQueries({ queryKey: ['verification-queue'] })
    queryClient.invalidateQueries({ queryKey: ['document-dashboard-stats'] })
    queryClient.invalidateQueries({ queryKey: ['document-audit', documentId] })
    queryClient.invalidateQueries({ queryKey: ['pensioner-documents'] })
  }

  const verifyMutation = useMutation({
    mutationFn: verifyDocumentApi,
    onSuccess: () => {
      invalidate()
      toast.success('Document approved')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: rejectDocumentApi,
    onSuccess: () => {
      invalidate()
      setRejectOpen(false)
      toast.success('Document rejected', { description: 'Pensioner has been notified' })
    },
  })

  const reuploadMutation = useMutation({
    mutationFn: requestReuploadApi,
    onSuccess: () => {
      invalidate()
      setReuploadOpen(false)
      toast.success('Re-upload requested', { description: 'Pensioner has been notified' })
    },
  })

  const reviewMutation = useMutation({
    mutationFn: () => markUnderReviewApi(documentId, user?.name ?? 'Officer'),
    onSuccess: () => {
      invalidate()
      toast.info('Document marked under review')
    },
  })

  if (isLoading || !document) return <PageLoadingSkeleton />

  const version = getDocumentCurrentVersion(document)
  const canVerify = permissions.canVerify && isPendingVerification(document.status)

  const handleDownload = async () => {
    const result = await downloadDocumentApi(documentId)
    toast.success('Download started', { description: result.fileName })
  }

  const handleReject = (values: RejectDocumentFormValues) => {
    rejectMutation.mutate({
      documentId,
      rejectedBy: user?.name ?? 'Officer',
      reason: values.reason,
      notes: values.notes,
    })
  }

  const handleVerify = (values: VerifyDocumentFormValues) => {
    verifyMutation.mutate({
      documentId,
      verifiedBy: user?.name ?? 'Officer',
      verificationNotes: values.verificationNotes,
    })
  }

  const handleReupload = (values: RequestReuploadFormValues) => {
    reuploadMutation.mutate({
      documentId,
      requestedBy: user?.name ?? 'Officer',
      notes: values.notes,
    })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        variant="admin"
        title={DOCUMENT_TYPE_LABELS[document.documentType]}
        description={`${document.id} · ${document.ppoNumber} · ${document.pensionerName}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => navigate({ href: basePath })}>
              <ArrowLeft className="mr-1.5 size-4" /> Back
            </Button>
            <Button variant="outline" className="rounded-full" onClick={handleDownload}>
              <Download className="mr-1.5 size-4" /> Download
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => navigate({ href: documentHistoryPath(basePath, documentId) })}
            >
              <History className="mr-1.5 size-4" /> History
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Document Preview</CardTitle>
              <DocumentStatusBadge status={document.status} />
            </CardHeader>
            <CardContent>
              <DocumentPreviewPanel document={document} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Document Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid gap-2">
                <InfoRow label="Document ID" value={document.id} mono />
                <InfoRow label="PPO Number" value={document.ppoNumber} />
                <InfoRow label="Document Type" value={DOCUMENT_TYPE_LABELS[document.documentType]} />
                <InfoRow label="Upload Date" value={format(parseISO(document.uploadDate), 'dd MMM yyyy')} />
                <InfoRow label="Version" value={`v${document.currentVersion}`} />
                <InfoRow label="File" value={version.fileName} />
                <InfoRow label="Source" value={DOCUMENT_INTEGRATION_LABELS[document.integrationSource]} />
                {document.integrationRefId && (
                  <InfoRow label="Reference" value={document.integrationRefId} mono />
                )}
                {document.verifiedBy && <InfoRow label="Verified By" value={document.verifiedBy} />}
                {document.verificationDate && (
                  <InfoRow
                    label="Verification Date"
                    value={format(parseISO(document.verificationDate), 'dd MMM yyyy')}
                  />
                )}
                {document.rejectionReason && (
                  <InfoRow
                    label="Rejection Reason"
                    value={DOCUMENT_REJECTION_REASON_LABELS[document.rejectionReason]}
                  />
                )}
              </div>
              {document.description && (
                <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">{document.description}</p>
              )}
              {document.verificationNotes && (
                <div>
                  <p className="mb-1 text-xs font-medium">Verification Notes</p>
                  <p className="rounded-lg bg-emerald-50 p-3 text-xs dark:bg-emerald-950">
                    {document.verificationNotes}
                  </p>
                </div>
              )}
              {document.rejectionNotes && (
                <div>
                  <p className="mb-1 text-xs font-medium">Rejection Notes</p>
                  <p className="rounded-lg bg-red-50 p-3 text-xs dark:bg-red-950">{document.rejectionNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {canVerify && (
            <Card className="rounded-2xl border-emerald-200 dark:border-emerald-900">
              <CardHeader>
                <CardTitle className="text-base">Verification Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {document.status === 'pending_verification' && (
                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={() => reviewMutation.mutate()}
                    disabled={reviewMutation.isPending}
                  >
                    Mark Under Review
                  </Button>
                )}
                <Form {...verifyForm}>
                  <form onSubmit={verifyForm.handleSubmit(handleVerify)} className="space-y-3">
                    <FormField
                      control={verifyForm.control}
                      name="verificationNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Optional approval notes..."
                              className="min-h-[80px] rounded-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="submit"
                        className="flex-1 rounded-full"
                        disabled={verifyMutation.isPending}
                      >
                        <CheckCircle2 className="mr-1.5 size-4" /> Approve
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        className="flex-1 rounded-full"
                        onClick={() => setRejectOpen(true)}
                      >
                        <XCircle className="mr-1.5 size-4" /> Reject
                      </Button>
                    </div>
                  </form>
                </Form>
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => setReuploadOpen(true)}
                >
                  <RefreshCw className="mr-1.5 size-4" /> Request Re-upload
                </Button>
              </CardContent>
            </Card>
          )}

          {document.status === 'rejected' && permissions.canUpload && (
            <Button
              className="w-full rounded-full"
              onClick={() =>
                navigate({
                  href: `${documentUploadPath(basePath)}?ppo=${document.ppoNumber}&type=${document.documentType}`,
                })
              }
            >
              <RefreshCw className="mr-1.5 size-4" /> Upload New Version
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="audit" className="mt-6">
        <TabsList className="rounded-full">
          <TabsTrigger value="audit" className="rounded-full">
            Audit Trail
          </TabsTrigger>
        </TabsList>
        <TabsContent value="audit" className="mt-4">
          <DocumentAuditTimeline entries={auditLog ?? []} />
        </TabsContent>
      </Tabs>

      <RejectDocumentDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onSubmit={handleReject}
        isPending={rejectMutation.isPending}
      />

      {reuploadOpen && (
        <Card className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl border shadow-xl sm:inset-x-auto sm:right-6 sm:bottom-6">
          <CardHeader>
            <CardTitle className="text-base">Request Re-upload</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...reuploadForm}>
              <form onSubmit={reuploadForm.handleSubmit(handleReupload)} className="space-y-3">
                <FormField
                  control={reuploadForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions for Pensioner</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Explain what needs to be re-uploaded..."
                          className="min-h-[80px] rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={() => setReuploadOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 rounded-full" disabled={reuploadMutation.isPending}>
                    Send Request
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? 'font-mono text-xs font-medium text-right' : 'font-medium text-right'}>
        {value}
      </span>
    </div>
  )
}

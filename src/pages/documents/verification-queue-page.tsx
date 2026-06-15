import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import { CheckCircle2, Eye, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { DocumentStatusBadge } from '@/components/documents/document-status-badge'
import { documentPath, useDocumentPortal } from '@/components/documents/document-portal-context'
import { RejectDocumentDialog } from '@/components/documents/reject-document-dialog'
import { Button } from '@/components/ui/button'
import { fetchVerificationQueue, verifyDocumentApi, rejectDocumentApi } from '@/data/documents-api'
import { DOCUMENT_TYPE_LABELS } from '@/lib/documents'
import { matchesListSearch } from '@/lib/list-search'
import type { RejectDocumentFormValues } from '@/lib/documents-schema'
import { useAuth } from '@/providers/auth-provider'
import type { PensionDocument } from '@/types/documents'

export function VerificationQueuePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { basePath, permissions } = useDocumentPortal()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useListViewMode()
  const [rejectDocId, setRejectDocId] = useState<string | null>(null)

  const { data: queue, isLoading } = useQuery({
    queryKey: ['verification-queue'],
    queryFn: fetchVerificationQueue,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['verification-queue'] })
    queryClient.invalidateQueries({ queryKey: ['documents-repository'] })
    queryClient.invalidateQueries({ queryKey: ['document-dashboard-stats'] })
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
      setRejectDocId(null)
      toast.success('Document rejected')
    },
  })

  const filtered = useMemo(() => {
    if (!queue) return []
    return queue.filter((doc) =>
      matchesListSearch(search, [
        doc.id,
        doc.ppoNumber,
        doc.pensionerName,
        DOCUMENT_TYPE_LABELS[doc.documentType],
      ]),
    )
  }, [queue, search])

  const handleQuickApprove = (doc: PensionDocument) => {
    verifyMutation.mutate({
      documentId: doc.id,
      verifiedBy: user?.name ?? 'Officer',
    })
  }

  const handleReject = (values: RejectDocumentFormValues) => {
    if (!rejectDocId) return
    rejectMutation.mutate({
      documentId: rejectDocId,
      rejectedBy: user?.name ?? 'Officer',
      reason: values.reason,
      notes: values.notes,
    })
  }

  const columns = useMemo<ColumnDef<PensionDocument>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Document ID',
        cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.id}</span>,
      },
      { accessorKey: 'ppoNumber', header: 'PPO Number' },
      { accessorKey: 'pensionerName', header: 'Pensioner Name' },
      {
        accessorKey: 'documentType',
        header: 'Document Type',
        cell: ({ row }) => DOCUMENT_TYPE_LABELS[row.original.documentType],
      },
      {
        accessorKey: 'uploadDate',
        header: 'Upload Date',
        cell: ({ row }) => format(parseISO(row.original.uploadDate), 'dd MMM yyyy'),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <DocumentStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const doc = row.original
          return (
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={() => navigate({ href: documentPath(basePath, doc.id) })}
              >
                <Eye className="mr-1 size-3.5" /> Preview
              </Button>
              {permissions.canVerify && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-emerald-700"
                    onClick={() => handleQuickApprove(doc)}
                  >
                    <CheckCircle2 className="mr-1 size-3.5" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-red-700"
                    onClick={() => setRejectDocId(doc.id)}
                  >
                    <XCircle className="mr-1 size-3.5" /> Reject
                  </Button>
                </>
              )}
            </div>
          )
        },
      },
    ],
    [basePath, navigate, permissions.canVerify],
  )

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <AdminListPageHeader
        title="Document Verification Queue"
        count={filtered.length}
        description="Review and verify pending pension documents"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by PPO, name, document ID..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <DataListView
        columns={columns}
        data={filtered}
        pageSize={10}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={false}
        renderCard={(doc, serialNo) => (
          <ListRecordCard
            serialNo={serialNo}
            title={DOCUMENT_TYPE_LABELS[doc.documentType]}
            subtitle={`${doc.ppoNumber} · ${doc.pensionerName}`}
            badges={<DocumentStatusBadge status={doc.status} />}
            fields={[
              { label: 'Document ID', value: doc.id },
              { label: 'Upload Date', value: format(parseISO(doc.uploadDate), 'dd MMM yyyy') },
            ]}
            action={
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => navigate({ href: documentPath(basePath, doc.id) })}
                >
                  <Eye className="mr-1 size-3.5" /> Preview
                </Button>
                {permissions.canVerify && (
                  <>
                    <Button
                      size="sm"
                      className="rounded-full"
                      onClick={() => handleQuickApprove(doc)}
                    >
                      <CheckCircle2 className="mr-1 size-3.5" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-full"
                      onClick={() => setRejectDocId(doc.id)}
                    >
                      <XCircle className="mr-1 size-3.5" /> Reject
                    </Button>
                  </>
                )}
              </div>
            }
          />
        )}
      />

      <RejectDocumentDialog
        open={!!rejectDocId}
        onOpenChange={(open) => !open && setRejectDocId(null)}
        onSubmit={handleReject}
        isPending={rejectMutation.isPending}
      />
    </motion.div>
  )
}

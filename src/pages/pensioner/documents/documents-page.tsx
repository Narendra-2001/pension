import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import { Download, Eye, FileText, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { adminStaggerContainer, adminStaggerItem } from '@/components/admin/shared/admin-analytics-ui'
import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { ListFiltersPopover } from '@/components/admin/shared/list-filters-popover'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { EmptyState, PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { DocumentStatusBadge } from '@/components/documents/document-status-badge'
import { PensionerDocumentCard } from '@/components/pensioner/documents/pensioner-document-card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { downloadDocumentApi, fetchPensionerDocumentsFromStore } from '@/data/documents-api'
import { DOCUMENT_TYPE_LABELS } from '@/lib/documents'
import { matchesListSearch } from '@/lib/list-search'
import { useAuth } from '@/providers/auth-provider'
import type { DocumentVerificationStatus, PensionDocument } from '@/types/documents'

export function DocumentsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const pensionerId = user?.pensionerId ?? ''
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | DocumentVerificationStatus>('all')
  const [viewMode, setViewMode] = useListViewMode('card')

  const { data: documents, isLoading } = useQuery({
    queryKey: ['pensioner-documents', pensionerId],
    queryFn: () => fetchPensionerDocumentsFromStore(pensionerId),
    enabled: !!pensionerId,
  })

  const filteredDocuments = useMemo(() => {
    if (!documents) return []
    return documents.filter((doc) => {
      if (statusFilter !== 'all' && doc.status !== statusFilter) return false
      return matchesListSearch(search, [
        DOCUMENT_TYPE_LABELS[doc.documentType],
        doc.ppoNumber,
        doc.status,
        doc.id,
      ])
    })
  }, [documents, search, statusFilter])

  const handleDownload = async (doc: PensionDocument) => {
    const result = await downloadDocumentApi(doc.id)
    toast.success('Download started', { description: result.fileName })
  }

  const columns = useMemo<ColumnDef<PensionDocument>[]>(
    () => [
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
        accessorKey: 'currentVersion',
        header: 'Version',
        cell: ({ row }) => `v${row.original.currentVersion}`,
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
                onClick={() => navigate({ href: `/pensioner/documents/${doc.id}` })}
              >
                <Eye className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={() => handleDownload(doc)}
              >
                <Download className="size-3.5" />
              </Button>
              {(doc.status === 'rejected' || doc.status === 'expired') && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => navigate({ href: '/pensioner/documents/upload' })}
                >
                  <Upload className="size-3.5" />
                </Button>
              )}
            </div>
          )
        },
      },
    ],
    [navigate],
  )

  const docActions = (doc: PensionDocument) => (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        className="rounded-full"
        onClick={() => navigate({ href: `/pensioner/documents/${doc.id}` })}
      >
        <Eye className="mr-1 size-3.5" /> View
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="rounded-full"
        onClick={() => handleDownload(doc)}
      >
        <Download className="mr-1 size-3.5" /> Download
      </Button>
      {(doc.status === 'rejected' || doc.status === 'expired') && (
        <Button
          size="sm"
          className="rounded-full"
          onClick={() => navigate({ href: '/pensioner/documents/upload' })}
        >
          <Upload className="mr-1 size-3.5" /> Upload New Version
        </Button>
      )}
    </div>
  )

  const activeFilterCount = statusFilter !== 'all' ? 1 : 0

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <motion.div variants={adminStaggerContainer} initial="hidden" animate="show">
      <motion.div variants={adminStaggerItem}>
        <AdminListPageHeader
          title="My Documents"
          count={filteredDocuments.length}
          description="View, download, and upload your pension documents"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search documents"
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={
            <Button className="rounded-full" onClick={() => navigate({ href: '/pensioner/documents/upload' })}>
              <Upload className="mr-1.5 size-4" /> Upload Document
            </Button>
          }
          filters={
            <ListFiltersPopover
              activeCount={activeFilterCount}
              title="Filter documents"
              onClear={() => setStatusFilter('all')}
            >
              <div className="space-y-2">
                <Label htmlFor="document-status-filter">Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as 'all' | DocumentVerificationStatus)}
                >
                  <SelectTrigger id="document-status-filter" className="w-full rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending_verification">Pending Verification</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="uploaded">Uploaded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </ListFiltersPopover>
          }
        />
      </motion.div>

      <motion.div variants={adminStaggerItem}>
        {!filteredDocuments.length ? (
          <EmptyState
            icon={<FileText className="size-7 text-muted-foreground" />}
            title="No documents yet"
            description="Upload your required documents — they will appear here immediately after submission"
            action={
              <Button className="rounded-full" onClick={() => navigate({ href: '/pensioner/documents/upload' })}>
                Upload Document
              </Button>
            }
          />
        ) : viewMode === 'card' ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredDocuments.map((doc, index) => (
              <PensionerDocumentCard
                key={doc.id}
                document={doc}
                index={index}
                onView={(item) => navigate({ href: `/pensioner/documents/${item.id}` })}
                onDownload={handleDownload}
                onReupload={() => navigate({ href: '/pensioner/documents/upload' })}
              />
            ))}
          </div>
        ) : (
          <DataListView
            columns={columns}
            data={filteredDocuments}
            pageSize={9}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showViewToggle={false}
            renderCard={(doc, serialNo) => (
              <ListRecordCard
                serialNo={serialNo}
                title={DOCUMENT_TYPE_LABELS[doc.documentType]}
                subtitle={doc.ppoNumber}
                badges={<DocumentStatusBadge status={doc.status} />}
                fields={[
                  { label: 'Upload Date', value: format(parseISO(doc.uploadDate), 'dd MMM yyyy') },
                  { label: 'Version', value: `v${doc.currentVersion}` },
                ]}
                action={docActions(doc)}
              />
            )}
          />
        )}
      </motion.div>
    </motion.div>
  )
}

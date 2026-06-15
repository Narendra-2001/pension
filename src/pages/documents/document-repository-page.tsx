import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import { Download, Eye, History, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { ListFiltersPopover } from '@/components/admin/shared/list-filters-popover'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { DocumentStatusBadge } from '@/components/documents/document-status-badge'
import {
  documentHistoryPath,
  documentPath,
  documentUploadPath,
  useDocumentPortal,
} from '@/components/documents/document-portal-context'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { downloadDocumentApi, fetchDocuments } from '@/data/documents-api'
import { DOCUMENT_TYPE_LABELS } from '@/lib/documents'
import { matchesListSearch } from '@/lib/list-search'
import type { DocumentType, DocumentVerificationStatus, PensionDocument } from '@/types/documents'

export function DocumentRepositoryPage() {
  const navigate = useNavigate()
  const { basePath, permissions } = useDocumentPortal()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | DocumentType>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | DocumentVerificationStatus>('all')
  const [viewMode, setViewMode] = useListViewMode()

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents-repository'],
    queryFn: fetchDocuments,
  })

  const filtered = useMemo(() => {
    if (!documents) return []
    return documents.filter((doc) => {
      if (!permissions.canViewAll && doc.category !== 'recovery') return false
      if (typeFilter !== 'all' && doc.documentType !== typeFilter) return false
      if (statusFilter !== 'all' && doc.status !== statusFilter) return false
      return matchesListSearch(search, [
        doc.id,
        doc.ppoNumber,
        doc.pensionerName,
        DOCUMENT_TYPE_LABELS[doc.documentType],
        doc.status,
      ])
    })
  }, [documents, search, typeFilter, statusFilter, permissions.canViewAll])

  const handleDownload = async (doc: PensionDocument) => {
    const result = await downloadDocumentApi(doc.id)
    toast.success('Download started', { description: result.fileName })
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
                onClick={() => navigate({ href: documentPath(basePath, doc.id) })}
              >
                <Eye className="mr-1 size-3.5" /> Preview
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={() => handleDownload(doc)}
              >
                <Download className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={() => navigate({ href: documentHistoryPath(basePath, doc.id) })}
              >
                <History className="size-3.5" />
              </Button>
            </div>
          )
        },
      },
    ],
    [basePath, navigate],
  )

  const activeFilterCount = (typeFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <AdminListPageHeader
        title="Document Repository"
        count={filtered.length}
        description="Centralized document repository for all pension-related records"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by PPO, name, document type..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        actions={
          permissions.canUpload ? (
            <Button className="rounded-full" onClick={() => navigate({ href: documentUploadPath(basePath) })}>
              <Plus className="mr-1.5 size-4" /> Upload
            </Button>
          ) : undefined
        }
        filters={
          <ListFiltersPopover
            activeCount={activeFilterCount}
            title="Filter documents"
            onClear={() => {
              setTypeFilter('all')
              setStatusFilter('all')
            }}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'all' | DocumentType)}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All types</SelectItem>
                    {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Verification Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as 'all' | DocumentVerificationStatus)}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending_verification">Pending Verification</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="uploaded">Uploaded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ListFiltersPopover>
        }
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
              { label: 'Version', value: `v${doc.currentVersion}` },
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
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => navigate({ href: documentHistoryPath(basePath, doc.id) })}
                >
                  <History className="mr-1 size-3.5" /> History
                </Button>
              </div>
            }
          />
        )}
      />
    </motion.div>
  )
}

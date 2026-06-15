import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { DocumentHistoryTimeline } from '@/components/documents/document-history-timeline'
import { useDocumentPortal } from '@/components/documents/document-portal-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/admin/shared/data-table'
import { fetchDocumentById } from '@/data/documents-api'
import { DOCUMENT_TYPE_LABELS } from '@/lib/documents'
import type { ColumnDef } from '@tanstack/react-table'
import { format, parseISO } from 'date-fns'
import { useMemo } from 'react'
import type { DocumentVersion } from '@/types/documents'
import { DocumentStatusBadge } from '@/components/documents/document-status-badge'

interface DocumentHistoryPageProps {
  documentId: string
}

export function DocumentHistoryPage({ documentId }: DocumentHistoryPageProps) {
  const navigate = useNavigate()
  const { basePath } = useDocumentPortal()

  const { data: document, isLoading } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => fetchDocumentById(documentId),
  })

  const columns = useMemo<ColumnDef<DocumentVersion>[]>(
    () => [
      {
        accessorKey: 'version',
        header: 'Version',
        cell: ({ row }) => `v${row.original.version}`,
      },
      {
        accessorKey: 'uploadDate',
        header: 'Upload Date',
        cell: ({ row }) => format(parseISO(row.original.uploadDate), 'dd MMM yyyy'),
      },
      { accessorKey: 'uploadedBy', header: 'Uploaded By' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <DocumentStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'verifiedBy',
        header: 'Verified By',
        cell: ({ row }) => row.original.verifiedBy ?? '—',
      },
      {
        accessorKey: 'verificationDate',
        header: 'Verification Date',
        cell: ({ row }) =>
          row.original.verificationDate
            ? format(parseISO(row.original.verificationDate), 'dd MMM yyyy')
            : '—',
      },
    ],
    [],
  )

  if (isLoading || !document) return <PageLoadingSkeleton />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        variant="admin"
        title="Document History"
        description={`${DOCUMENT_TYPE_LABELS[document.documentType]} · ${document.ppoNumber}`}
        action={
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => navigate({ href: `${basePath}/${documentId}` })}
          >
            <ArrowLeft className="mr-1.5 size-4" /> Back to Document
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Version Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentHistoryTimeline versions={document.versions} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Version History Table</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={[...document.versions].sort((a, b) => b.version - a.version)} showSerialNumber />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

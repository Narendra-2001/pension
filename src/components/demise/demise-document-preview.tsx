import { FileText, Image } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DEMISE_DOCUMENT_LABELS } from '@/lib/demise'
import type { DemiseDocument } from '@/types/demise'

interface DemiseDocumentPreviewProps {
  documents: DemiseDocument[]
  className?: string
}

export function DemiseDocumentPreview({ documents, className }: DemiseDocumentPreviewProps) {
  if (!documents.length) {
    return <p className="text-sm text-muted-foreground">No documents uploaded.</p>
  }

  return (
    <div className={className}>
      <div className="grid gap-3 sm:grid-cols-2">
        {documents.map((doc) => {
          const isPdf = doc.fileName.endsWith('.pdf')
          return (
            <Card key={doc.id} className="admin-card overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3">
                  {isPdf ? (
                    <FileText className="size-5 shrink-0 text-red-500" />
                  ) : (
                    <Image className="size-5 shrink-0 text-blue-500" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{DEMISE_DOCUMENT_LABELS[doc.type]}</p>
                    <p className="truncate text-xs text-muted-foreground">{doc.fileName}</p>
                  </div>
                  {doc.mandatory && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                      Required
                    </span>
                  )}
                </div>
                <div className="flex h-32 items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
                  <div className="text-center">
                    {isPdf ? (
                      <FileText className="mx-auto size-10 text-muted-foreground/50" />
                    ) : (
                      <Image className="mx-auto size-10 text-muted-foreground/50" />
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">Document Preview</p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-xs text-muted-foreground">Uploaded {doc.uploadedAt}</span>
                  <Button variant="ghost" size="sm" className="h-7 rounded-full text-xs">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

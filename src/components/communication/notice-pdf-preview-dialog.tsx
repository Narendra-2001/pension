import { Download, Printer, X } from 'lucide-react'

import { NoticeDocument, printNoticeDocument } from '@/components/communication/notice-document'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { NOTICE_TYPE_LABELS } from '@/lib/communication'
import type { OfficialNotice } from '@/types/communication'

interface NoticePdfPreviewDialogProps {
  notice: OfficialNotice | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload?: () => void
}

export function NoticePdfPreviewDialog({
  notice,
  open,
  onOpenChange,
  onDownload,
}: NoticePdfPreviewDialogProps) {
  if (!notice) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl p-0">
        <DialogHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <div>
            <DialogTitle className="text-base">Notice Preview</DialogTitle>
            <p className="text-xs text-muted-foreground">
              {notice.id} · {NOTICE_TYPE_LABELS[notice.noticeType]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => printNoticeDocument()}
            >
              <Printer className="mr-1.5 size-3.5" /> Print / PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={onDownload}
            >
              <Download className="mr-1.5 size-3.5" /> Download
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="overflow-y-auto bg-muted/30 p-6">
          <NoticeDocument notice={notice} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

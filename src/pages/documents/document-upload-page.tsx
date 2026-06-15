import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, FileText, FileUp, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { PageHeader } from '@/components/admin/shared/page-header'
import { useDocumentPortal } from '@/components/documents/document-portal-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { uploadDocumentApi } from '@/data/documents-api'
import {
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_TYPES_BY_CATEGORY,
  DOCUMENT_TYPE_LABELS,
  SUPPORTED_FILE_EXTENSIONS,
  formatFileSize,
} from '@/lib/documents'
import { isImageFile, isPdfFile } from '@/lib/file-utils'
import { uploadDocumentSchema, type UploadDocumentFormValues } from '@/lib/documents-schema'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import type { DocumentMimeType, PensionDocument } from '@/types/documents'

function getMimeType(fileName: string): DocumentMimeType {
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'))
  if (ext === '.pdf') return 'application/pdf'
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg') return 'image/jpg'
  return 'image/jpeg'
}

interface DocumentUploadPageProps {
  defaultPpoNumber?: string
}

export function DocumentUploadPage({ defaultPpoNumber }: DocumentUploadPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { basePath, role } = useDocumentPortal()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const form = useForm<UploadDocumentFormValues>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: {
      ppoNumber: defaultPpoNumber ?? '',
      documentType: 'aadhaar_card',
      fileName: '',
      fileSize: 0,
      mimeType: 'application/pdf',
      description: '',
      uploadDate: new Date().toISOString().split('T')[0],
    },
  })

  const mutation = useMutation({
    mutationFn: uploadDocumentApi,
    onSuccess: (doc) => {
      const pensionerId = user?.pensionerId
      if (pensionerId) {
        queryClient.setQueryData<PensionDocument[]>(
          ['pensioner-documents', pensionerId],
          (current) => [doc, ...(current ?? [])],
        )
      }
      queryClient.invalidateQueries({ queryKey: ['documents-repository'] })
      queryClient.invalidateQueries({ queryKey: ['document-dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['verification-queue'] })
      queryClient.invalidateQueries({ queryKey: ['pensioner-documents'] })
      setUploadSuccess(true)
      toast.success('Document uploaded', {
        description: `${DOCUMENT_TYPE_LABELS[doc.documentType]} is now visible in your portal`,
      })
      setTimeout(() => {
        navigate({ href: role === 'pensioner' ? basePath : `${basePath}/${doc.id}` })
      }, 1200)
    },
    onError: (err: Error) => {
      toast.error('Upload failed', { description: err.message })
    },
  })

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    if (!SUPPORTED_FILE_EXTENSIONS.includes(ext as (typeof SUPPORTED_FILE_EXTENSIONS)[number])) {
      toast.error('Unsupported file format', {
        description: 'Supported formats: PDF, JPG, JPEG, PNG',
      })
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }

    form.setValue('fileName', file.name, { shouldValidate: true })
    form.setValue('fileSize', file.size, { shouldValidate: true })
    form.setValue('mimeType', getMimeType(file.name), { shouldValidate: true })
  }

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    form.setValue('fileName', '', { shouldValidate: true })
    form.setValue('fileSize', 0, { shouldValidate: true })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const selectedFileSize = form.watch('fileSize')
  const selectedMimeType = form.watch('mimeType')

  const onSubmit = (values: UploadDocumentFormValues) => {
    mutation.mutate({
      ...values,
      pensionerId: user?.pensionerId,
      uploadedBy: user?.name ?? 'User',
      uploadedByRole: role,
      integrationSource: role === 'pensioner' ? 'manual' : 'manual',
    })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        variant="admin"
        title="Upload Document"
        description="Upload pension-related documents for verification. Supported formats: PDF, JPG, JPEG, PNG"
        action={
          <Button variant="outline" className="rounded-full" onClick={() => navigate({ href: basePath })}>
            <ArrowLeft className="mr-1.5 size-4" /> Back
          </Button>
        }
      />

      <Card className="max-w-2xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Document Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="ppoNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PPO Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. PPO123456" className="rounded-lg" disabled={!!defaultPpoNumber} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-72 rounded-xl">
                        {Object.entries(DOCUMENT_TYPES_BY_CATEGORY).map(([category, types]) => (
                          <div key={category}>
                            <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                              {DOCUMENT_CATEGORY_LABELS[category as keyof typeof DOCUMENT_CATEGORY_LABELS]}
                            </p>
                            {types.map((type) => (
                              <SelectItem key={type} value={type}>
                                {DOCUMENT_TYPE_LABELS[type]}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fileName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Upload</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <motion.div
                          layout
                          className={cn(
                            'relative overflow-hidden rounded-2xl border-2 border-dashed transition-colors duration-300',
                            field.value
                              ? 'border-emerald-300/70 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                              : 'border-border bg-muted/20 hover:border-primary/30 hover:bg-primary/[0.03]',
                          )}
                        >
                          <div
                            className="flex cursor-pointer flex-col items-center justify-center gap-3 p-8"
                            onClick={() => fileInputRef.current?.click()}
                            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                            role="button"
                            tabIndex={0}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                            {field.value ? (
                              <>
                                <motion.div
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                                >
                                  <CheckCircle2 className="size-7" />
                                </motion.div>
                                <div className="text-center">
                                  <p className="text-sm font-semibold">{field.value}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(selectedFileSize)} · Click to change file
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <Upload className="size-10 text-muted-foreground" />
                                <div className="text-center">
                                  <p className="text-sm font-medium">Click to upload or drag file here</p>
                                  <p className="text-xs text-muted-foreground">PDF, JPG, JPEG, PNG (max 10 MB)</p>
                                </div>
                              </>
                            )}
                          </div>

                          <AnimatePresence>
                            {field.value && previewUrl && isImageFile(field.value, selectedMimeType) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t border-border/50 bg-background/80 p-4"
                              >
                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  Live Preview
                                </p>
                                <img
                                  src={previewUrl}
                                  alt="Document preview"
                                  className="mx-auto max-h-48 rounded-xl border border-border/50 object-contain shadow-sm"
                                />
                              </motion.div>
                            )}
                            {field.value && isPdfFile(field.value, selectedMimeType) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t border-border/50 bg-background/80 p-4"
                              >
                                <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-4">
                                  <FileText className="size-8 text-red-600" />
                                  <div>
                                    <p className="text-sm font-medium">PDF ready to upload</p>
                                    <p className="text-xs text-muted-foreground">Preview available after upload</p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {field.value && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-2 size-8 rounded-full p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                clearFile()
                              }}
                            >
                              <X className="size-4" />
                            </Button>
                          )}
                        </motion.div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Optional description or remarks..."
                        className="min-h-[80px] rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="uploadDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className="rounded-lg" />
                    </FormControl>
                    <FormDescription>Version number will be assigned automatically</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full rounded-full" disabled={mutation.isPending || uploadSuccess}>
                {uploadSuccess ? (
                  <>
                    <CheckCircle2 className="mr-1.5 size-4" /> Uploaded — redirecting...
                  </>
                ) : mutation.isPending ? (
                  'Uploading...'
                ) : (
                  <>
                    <FileUp className="mr-1.5 size-4" /> Submit Document
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

import { FileImage, FileText, type LucideIcon } from 'lucide-react'

export function getFileExtension(fileName: string): string {
  const index = fileName.lastIndexOf('.')
  return index >= 0 ? fileName.slice(index + 1).toLowerCase() : ''
}

export function isImageFile(fileName: string, mimeType?: string): boolean {
  if (mimeType?.startsWith('image/')) return true
  const ext = getFileExtension(fileName)
  return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp'
}

export function isPdfFile(fileName: string, mimeType?: string): boolean {
  if (mimeType === 'application/pdf') return true
  return getFileExtension(fileName) === 'pdf'
}

export function getFileTypeIcon(fileName: string, mimeType?: string): LucideIcon {
  return isImageFile(fileName, mimeType) ? FileImage : FileText
}

export function getFileTypeLabel(fileName: string, mimeType?: string): string {
  if (isPdfFile(fileName, mimeType)) return 'PDF Document'
  if (isImageFile(fileName, mimeType)) return 'Image'
  return 'Document'
}

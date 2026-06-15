import type { PensionDocument } from '@/types/documents'
import type { RestorationRequest, SuspensionDocument } from '@/types/suspension'

function inferRestorationDocumentType(doc: SuspensionDocument): PensionDocument['documentType'] {
  if (doc.documentType) return doc.documentType

  const hint = `${doc.name} ${doc.fileName}`.toLowerCase()
  if (hint.includes('life certificate') || hint.includes('life_cert') || hint.includes('lc_')) {
    return 'life_certificate'
  }
  if (hint.includes('aadhaar')) return 'aadhaar_card'
  if (hint.includes('pan')) return 'pan_card'
  if (hint.includes('ppo')) return 'ppo_copy'
  if (hint.includes('passbook') || hint.includes('bank')) return 'bank_passbook'
  if (hint.includes('cheque')) return 'cancelled_cheque'
  if (hint.includes('photo')) return 'passport_photo'
  if (hint.includes('inquiry') || hint.includes('closure')) return 'restoration_supporting'
  return 'restoration_supporting'
}

function defaultMimeType(fileName: string): PensionDocument['versions'][number]['mimeType'] {
  if (fileName.match(/\.png$/i)) return 'image/png'
  if (fileName.match(/\.jpe?g$/i)) return 'image/jpeg'
  return 'application/pdf'
}

export function toRestorationPreviewDocument(
  request: Pick<
    RestorationRequest,
    'id' | 'pensionerId' | 'ppoNumber' | 'pensionerName' | 'requestDate'
  >,
  doc: SuspensionDocument,
  index: number,
): PensionDocument {
  const documentType = inferRestorationDocumentType(doc)
  const mimeType = doc.mimeType ?? defaultMimeType(doc.fileName)
  const fileSize = doc.fileSize ?? (mimeType === 'application/pdf' ? 842_000 : 420_000)
  const uploadDate = request.requestDate

  return {
    id: `${request.id}-doc-${index}`,
    pensionerId: request.pensionerId,
    ppoNumber: request.ppoNumber,
    pensionerName: request.pensionerName,
    documentType,
    category: 'suspension',
    currentVersion: 1,
    versions: [
      {
        version: 1,
        uploadDate,
        uploadedBy: request.pensionerName,
        uploadedByRole: 'pensioner',
        fileName: doc.fileName,
        fileSize,
        mimeType,
        status: 'pending_verification',
      },
    ],
    status: 'pending_verification',
    uploadDate,
    integrationSource: 'suspension_restoration',
    integrationRefId: request.id,
    createdAt: `${uploadDate}T10:00:00.000Z`,
    updatedAt: `${uploadDate}T10:00:00.000Z`,
  }
}

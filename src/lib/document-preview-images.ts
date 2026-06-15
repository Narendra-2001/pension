import aadhaarCardImage from '@/assets/documents/previews/aadhaar-card.png'
import bankPassbookImage from '@/assets/documents/previews/bank-passbook.png'
import cancelledChequeImage from '@/assets/documents/previews/cancelled-cheque.png'
import lifeCertificateImage from '@/assets/documents/previews/life-certificate.png'
import officialDocumentImage from '@/assets/documents/previews/official-document.png'
import panCardImage from '@/assets/documents/previews/pan-card.png'
import passportPhotoImage from '@/assets/documents/previews/passport-photo.png'
import ppoCopyImage from '@/assets/documents/previews/ppo-copy.png'
import signatureSpecimenImage from '@/assets/documents/previews/signature-specimen.png'
import type { DocumentType } from '@/types/documents'

const DOCUMENT_PREVIEW_IMAGES: Record<DocumentType, string> = {
  aadhaar_card: aadhaarCardImage,
  nominee_aadhaar: aadhaarCardImage,
  pan_card: panCardImage,
  passport_photo: passportPhotoImage,
  signature: signatureSpecimenImage,
  ppo_copy: ppoCopyImage,
  pension_sanction_order: officialDocumentImage,
  retirement_order: officialDocumentImage,
  bank_passbook: bankPassbookImage,
  cancelled_cheque: cancelledChequeImage,
  relationship_proof: officialDocumentImage,
  life_certificate: lifeCertificateImage,
  restoration_supporting: officialDocumentImage,
  death_certificate: officialDocumentImage,
  legal_heir_certificate: officialDocumentImage,
  recovery_notice: officialDocumentImage,
  recovery_evidence: officialDocumentImage,
}

export function getDocumentPreviewImage(documentType: DocumentType): string {
  return DOCUMENT_PREVIEW_IMAGES[documentType]
}

export {
  aadhaarCardImage,
  bankPassbookImage,
  cancelledChequeImage,
  lifeCertificateImage,
  officialDocumentImage,
  panCardImage,
  passportPhotoImage,
  ppoCopyImage,
  signatureSpecimenImage,
}

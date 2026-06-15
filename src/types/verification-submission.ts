export interface VerificationGeoLocation {
  latitude: number
  longitude: number
  accuracy?: number
  label?: string
  capturedAt: string
}

export interface VerificationDeviceInfo {
  userAgent: string
  platform: string
  language: string
  screenResolution: string
  timezone: string
  capturedAt: string
}

export interface VerificationUploadedDocument {
  name: string
  fileName: string
  fileSize: number
  uploadedAt: string
}

export interface LifeCertificateVerificationPayload {
  faceCaptureTimestamp: string
  livenessScore: number
  livenessTimestamp: string
  faceMatchScore: number
  geoLocation: VerificationGeoLocation
  deviceInfo: VerificationDeviceInfo
  uploadedDocuments: VerificationUploadedDocument[]
}

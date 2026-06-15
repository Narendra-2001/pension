import { useQuery } from '@tanstack/react-query'

import { DocumentPageWrapper } from '@/components/documents/document-page-wrapper'
import { DocumentUploadPage } from '@/pages/documents/document-upload-page'
import { fetchPensionerProfile } from '@/data/pensioner-api'
import { useAuth } from '@/providers/auth-provider'

export function PensionerDocumentUploadPage() {
  const { user } = useAuth()
  const pensionerId = user?.pensionerId ?? ''

  const { data: profile } = useQuery({
    queryKey: ['pensioner-profile', pensionerId],
    queryFn: () => fetchPensionerProfile(pensionerId),
    enabled: !!pensionerId,
  })

  return (
    <DocumentPageWrapper>
      <DocumentUploadPage defaultPpoNumber={profile?.service.ppoNumber} />
    </DocumentPageWrapper>
  )
}

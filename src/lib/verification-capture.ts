import type {
  VerificationDeviceInfo,
  VerificationGeoLocation,
} from '@/types/verification-submission'

const DEMO_LOCATION: VerificationGeoLocation = {
  latitude: 19.076,
  longitude: 72.8777,
  accuracy: 25,
  label: 'Fort, Mumbai, Maharashtra 400001, India',
  capturedAt: new Date().toISOString(),
}

const INDIAN_LOCATIONS = [
  'Connaught Place, New Delhi, Delhi 110001, India',
  'Fort, Mumbai, Maharashtra 400001, India',
  'MG Road, Bengaluru, Karnataka 560001, India',
  'Park Street, Kolkata, West Bengal 700016, India',
  'HITEC City, Hyderabad, Telangana 500081, India',
  'Anna Salai, Chennai, Tamil Nadu 600002, India',
  'Ashram Road, Ahmedabad, Gujarat 380009, India',
  'Civil Lines, Jaipur, Rajasthan 302006, India',
]

export function captureDeviceInfo(): VerificationDeviceInfo {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform || 'Unknown',
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    capturedAt: new Date().toISOString(),
  }
}

export function generateLivenessScore(): number {
  return Math.floor(Math.random() * 11) + 88
}

export function generateFaceMatchScore(): number {
  return Math.floor(Math.random() * 8) + 91
}

export async function captureGeoLocation(): Promise<VerificationGeoLocation> {
  if (!navigator.geolocation) {
    return { ...DEMO_LOCATION, capturedAt: new Date().toISOString() }
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: new Date().toISOString(),
        })
      },
      () => {
        resolve({ ...DEMO_LOCATION, capturedAt: new Date().toISOString() })
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    )
  })
}

export async function reverseGeocodeLabel(
  latitude: number,
  longitude: number,
): Promise<string> {
  await new Promise((r) => setTimeout(r, 400))

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16`,
      { headers: { Accept: 'application/json' } },
    )
    if (response.ok) {
      const data = (await response.json()) as { display_name?: string }
      if (data.display_name) {
        return data.display_name
      }
    }
  } catch {
    // Fall through to demo labels
  }

  const index =
    Math.abs(Math.floor(latitude * 100) + Math.floor(longitude * 100)) %
    INDIAN_LOCATIONS.length
  return INDIAN_LOCATIONS[index]
}

export function formatCaptureTimestamp(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

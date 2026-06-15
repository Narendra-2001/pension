import { useCallback, useEffect, useRef, useState } from 'react'

interface UseCameraStreamOptions {
  facingMode?: 'user' | 'environment'
  autoStart?: boolean
}

export function useCameraStream(options: UseCameraStreamOptions = {}) {
  const { facingMode = 'user', autoStart = false } = options
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsActive(false)
    setIsReady(false)
  }, [])

  const startCamera = useCallback(async () => {
    setError(null)
    setIsReady(false)

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported on this device')
      }

      stopCamera()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        await video.play()
        setIsActive(true)
        setIsReady(true)
      }
    } catch {
      setError('Unable to access camera. Please allow camera permission and try again.')
      setIsActive(false)
      setIsReady(false)
    }
  }, [facingMode, stopCamera])

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return null

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.85)
  }, [])

  useEffect(() => {
    if (autoStart) {
      void startCamera()
    }
    return () => stopCamera()
  }, [autoStart, startCamera, stopCamera])

  return {
    videoRef,
    isActive,
    isReady,
    error,
    startCamera,
    stopCamera,
    captureFrame,
  }
}

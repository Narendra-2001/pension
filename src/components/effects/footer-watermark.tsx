export function FooterWatermark({ text }: { text: string }) {
  return (
    <div
      aria-hidden
      className="footer-watermark-wrap pointer-events-none relative w-full select-none px-4 sm:px-6 lg:px-8"
    >
      <span className="footer-watermark-size">{text}</span>
      <span className="footer-watermark-layer footer-watermark-depth">{text}</span>
      <span className="footer-watermark-layer footer-watermark-stroke">{text}</span>
      <span className="footer-watermark-layer footer-watermark-fill">{text}</span>
      <span className="footer-watermark-layer footer-watermark-rim">{text}</span>
    </div>
  )
}

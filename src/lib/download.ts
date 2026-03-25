export function triggerDownload(url: string, filename: string): void {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  triggerDownload(dataUrl, filename)
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  triggerDownload(url, filename)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

export function downloadSvgFromElement(
  svgElement: SVGSVGElement,
  filename: string,
): void {
  const svgStr = new XMLSerializer().serializeToString(svgElement)
  const blob = new Blob([svgStr], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, filename)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

export function downloadPngFromElement(
  svgElement: SVGSVGElement,
  filename: string,
  scale = 2,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let svgW: number
    let svgH: number
    try {
      const bbox = svgElement.getBBox()
      svgW = svgElement.width.baseVal.value || bbox.width + bbox.x * 2
      svgH = svgElement.height.baseVal.value || bbox.height + bbox.y * 2
    } catch {
      svgW = svgElement.width.baseVal.value || 300
      svgH = svgElement.height.baseVal.value || 150
    }
    const width = Math.round(svgW * scale)
    const height = Math.round(svgH * scale)

    const svgStr = new XMLSerializer().serializeToString(svgElement)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Não foi possível criar o contexto do canvas'))
      return
    }
    const img = new Image()
    const url = URL.createObjectURL(
      new Blob([svgStr], { type: 'image/svg+xml' }),
    )
    img.onload = () => {
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      triggerDownload(canvas.toDataURL('image/png'), filename)
      resolve()
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Falha ao converter SVG para PNG'))
    }
    img.src = url
  })
}

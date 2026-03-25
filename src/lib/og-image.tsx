import { ImageResponse } from 'next/og'

export const ogSize = { width: 1200, height: 630 }
export const ogContentType = 'image/png'

export function makeOGImage(title: string, description: string, accent = '#4f46e5') {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f8fafc',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Barra lateral colorida */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: 12, height: 630, backgroundColor: accent, display: 'flex' }} />

        {/* Conteúdo */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '64px 80px', flex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: accent }}>GeraCode</div>
            <div style={{ fontSize: 16, color: '#64748b', backgroundColor: '#e0e7ff', padding: '4px 12px', borderRadius: 20 }}>
              geracodigo.com.br
            </div>
          </div>

          {/* Título */}
          <div style={{ fontSize: 56, fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginBottom: 24, flex: 1 }}>
            {title}
          </div>

          {/* Descrição */}
          <div style={{ fontSize: 24, color: '#475569', lineHeight: 1.4, marginBottom: 48 }}>
            {description}
          </div>

          {/* Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 18, color: '#10b981', fontWeight: 600 }}>
              Gerado direto no navegador. Seus dados nunca saem do seu computador
            </div>
          </div>
        </div>
      </div>
    ),
    { ...ogSize }
  )
}

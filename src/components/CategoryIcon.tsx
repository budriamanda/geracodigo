interface CategoryIconProps {
  categoria: string
  size?: number
  color?: string
}

const ICONS: Record<string, (color: string) => React.JSX.Element> = {
  pix: (c) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4L44 24L24 44L4 24L24 4Z" stroke={c} strokeWidth="3" strokeLinejoin="round" fill="none" opacity="0.9"/>
      <path d="M24 12L36 24L24 36L12 24L24 12Z" fill={c} opacity="0.6"/>
    </svg>
  ),
  'codigo-barras': (c) => (
    <svg viewBox="0 0 48 48" fill={c} xmlns="http://www.w3.org/2000/svg">
      <rect x="4"  y="8" width="4"  height="32"/>
      <rect x="10" y="8" width="2"  height="32"/>
      <rect x="14" y="8" width="5"  height="32"/>
      <rect x="21" y="8" width="2"  height="32"/>
      <rect x="25" y="8" width="4"  height="32"/>
      <rect x="31" y="8" width="2"  height="32"/>
      <rect x="35" y="8" width="5"  height="32"/>
      <rect x="42" y="8" width="2"  height="32"/>
    </svg>
  ),
  ean: (c) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4"  y="8" width="3"   height="32" fill={c}/>
      <rect x="9"  y="8" width="1.5" height="32" fill={c}/>
      <rect x="12" y="8" width="4"   height="32" fill={c}/>
      <rect x="18" y="8" width="2"   height="32" fill={c}/>
      <rect x="22" y="8" width="3"   height="32" fill={c}/>
      <rect x="27" y="8" width="1.5" height="32" fill={c}/>
      <rect x="30" y="8" width="4"   height="32" fill={c}/>
      <rect x="36" y="8" width="2"   height="32" fill={c}/>
      <rect x="40" y="8" width="4"   height="32" fill={c}/>
      <text x="24" y="46" textAnchor="middle" fontSize="6" fill={c} fontFamily="monospace">EAN-13</text>
    </svg>
  ),
  sku: (c) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="36" height="24" rx="3" stroke={c} strokeWidth="2.5"/>
      <path d="M14 22H34M14 27H26" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M32 38L38 38M38 38L35 35M38 38L35 41" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  leitor: (c) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="12" width="32" height="24" rx="4" stroke={c} strokeWidth="2.5"/>
      <circle cx="24" cy="24" r="7" stroke={c} strokeWidth="2.5"/>
      <circle cx="24" cy="24" r="3" fill={c} opacity="0.7"/>
      <path d="M4 24H8M40 24H44" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  'qr-code': (c) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6"  y="6"  width="14" height="14" rx="2" stroke={c} strokeWidth="2.5"/>
      <rect x="10" y="10" width="6"  height="6"  fill={c}/>
      <rect x="28" y="6"  width="14" height="14" rx="2" stroke={c} strokeWidth="2.5"/>
      <rect x="32" y="10" width="6"  height="6"  fill={c}/>
      <rect x="6"  y="28" width="14" height="14" rx="2" stroke={c} strokeWidth="2.5"/>
      <rect x="10" y="32" width="6"  height="6"  fill={c}/>
      <rect x="28" y="28" width="6"  height="6"  fill={c} opacity="0.7"/>
      <rect x="36" y="28" width="6"  height="6"  fill={c} opacity="0.5"/>
      <rect x="28" y="36" width="6"  height="6"  fill={c} opacity="0.5"/>
      <rect x="36" y="36" width="6"  height="6"  fill={c}/>
    </svg>
  ),
  geral: (c) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 12H38M10 20H38M10 28H28M10 36H22" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
}

export default function CategoryIcon({ categoria, size = 64, color = '#fff' }: CategoryIconProps) {
  const render = ICONS[categoria] ?? ICONS.geral
  return (
    <span style={{ width: size, height: size, display: 'inline-flex', opacity: 0.85 }} aria-hidden="true">
      {render(color)}
    </span>
  )
}

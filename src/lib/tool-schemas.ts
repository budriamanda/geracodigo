import { SITE_URL } from '@/lib/constants'

interface ToolSchemaData {
  slug: string
  h1: string
  schemaAppName?: string
  schemaAppDescription?: string
  schemaFeatureList?: string[]
  schemaHowToName?: string
  schemaHowToDescription?: string
  schemaHowToTotalTime?: string
  schemaHowToSteps?: { nome: string; texto: string }[]
  schemaAboutName?: string
  schemaDatePublished?: string
  schemaDateModified?: string
}

export function buildToolSchemas(tool: ToolSchemaData): object[] {
  const url = `${SITE_URL}/${tool.slug}`
  const schemas: object[] = []

  // WebApplication + SoftwareApplication
  if (tool.schemaAppName) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': ['WebApplication', 'SoftwareApplication'],
      name: tool.schemaAppName,
      description: tool.schemaAppDescription || '',
      url,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      author: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'pt-BR',
      isAccessibleForFree: true,
      ...(tool.schemaFeatureList && tool.schemaFeatureList.length > 0
        ? { featureList: tool.schemaFeatureList }
        : {}),
    })
  }

  // HowTo
  if (tool.schemaHowToName && tool.schemaHowToSteps && tool.schemaHowToSteps.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: tool.schemaHowToName,
      description: tool.schemaHowToDescription || '',
      totalTime: tool.schemaHowToTotalTime || 'PT2M',
      inLanguage: 'pt-BR',
      tool: { '@type': 'HowToTool', name: `GeraCode: ${tool.schemaAppName || tool.h1}` },
      step: tool.schemaHowToSteps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.nome,
        text: s.texto,
        url: `${url}#passo-${i + 1}`,
      })),
    })
  }

  // WebPage
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: tool.h1,
    description: tool.schemaAppDescription || '',
    url,
    inLanguage: 'pt-BR',
    datePublished: tool.schemaDatePublished || '2026-01-15',
    dateModified: tool.schemaDateModified || '2026-03-27',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    ...(tool.schemaAboutName ? { about: { '@type': 'Thing', name: tool.schemaAboutName } } : {}),
    publisher: { '@id': `${SITE_URL}/#organization` },
  })

  // BreadcrumbList
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'GeraCode', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: tool.h1, item: url },
    ],
  })

  return schemas
}

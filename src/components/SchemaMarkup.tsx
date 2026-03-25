interface SchemaMarkupProps {
  schema: object | object[]
}

function safeJsonLd(obj: object): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c')
}

export default function SchemaMarkup({ schema }: SchemaMarkupProps) {
  const schemas = Array.isArray(schema) ? schema : [schema]
  const graph = {
    '@context': 'https://schema.org',
    '@graph': schemas.map((s) => {
      const { '@context': _ctx, ...rest } = s as Record<string, unknown>
      void _ctx
      return rest
    }),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(graph) }}
    />
  )
}

import MarkdownContent from '@/components/MarkdownContent'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSectionProps {
  items: FAQItem[]
}

export default function FAQSection({ items }: FAQSectionProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <section className="mt-16" aria-labelledby="faq-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
      />
      <h2 id="faq-heading" className="text-2xl font-bold text-gray-900 mb-8">Perguntas Frequentes</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <details
            key={item.question}
            className="bg-white border border-gray-200 rounded-xl group transition-shadow hover:shadow-sm"
          >
            <summary
              className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded-xl p-6"
            >
              {item.question}
              <span className="text-indigo-500 text-xl shrink-0 group-open:rotate-45 transition-transform duration-200" aria-hidden="true">+</span>
            </summary>
            <div className="px-6 pb-6">
              <MarkdownContent
                content={item.answer}
                className="[&_p]:text-gray-600 [&_p]:leading-relaxed [&_p:last-child]:mb-0 [&_ul]:mt-2 [&_li]:mt-1 [&_a]:text-indigo-600 [&_a]:underline"
              />
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

import Link from 'next/link'
import MarkdownContent from '@/components/MarkdownContent'

interface SectionItem {
  titulo: string
  descricao: string
  icone?: string
}

interface SectionLink {
  href: string
  label: string
  descricao: string
  badgeText?: string
  badgeColor?: string
}

export interface ContentSection {
  tipo: 'steps' | 'cards' | 'prose' | 'tags' | 'links'
  titulo: string
  subtitulo?: string
  conteudo?: string
  stepColor?: string
  bgCard?: boolean
  columns?: '2' | '3' | '4'
  items?: SectionItem[]
  tags?: string[]
  links?: SectionLink[]
}

const stepColorMap: Record<string, { bg: string; text: string }> = {
  green: { bg: 'bg-green-100', text: 'text-green-700' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700' },
  sky: { bg: 'bg-sky-100', text: 'text-sky-700' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-700' },
  red: { bg: 'bg-red-100', text: 'text-red-700' },
}

const colsMap: Record<string, string> = {
  '2': 'grid-cols-1 md:grid-cols-2',
  '3': 'grid-cols-1 md:grid-cols-3',
  '4': 'grid-cols-2 md:grid-cols-4',
}

function StepsSection({ section }: { section: ContentSection }) {
  const color = stepColorMap[section.stepColor || 'indigo'] || stepColorMap.indigo
  const cols = colsMap[section.columns || '3']

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.titulo}</h2>
      {section.subtitulo && <p className="text-gray-600 text-sm mb-6">{section.subtitulo}</p>}
      <div className={`grid ${cols} gap-6`}>
        {(section.items || []).map((item, i) => (
          <article key={i} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className={`w-10 h-10 rounded-full ${color.bg} ${color.text} font-bold text-lg flex items-center justify-center mb-4`} aria-hidden="true">
              {i + 1}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{item.titulo}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{item.descricao}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function CardsSection({ section }: { section: ContentSection }) {
  const cols = colsMap[section.columns || '3']
  const wrapper = section.bgCard
    ? 'mt-16 bg-white rounded-xl border border-gray-200 p-8'
    : 'mt-16'

  return (
    <section className={wrapper}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.titulo}</h2>
      {section.subtitulo && <p className="text-gray-600 text-sm mb-6">{section.subtitulo}</p>}
      <div className={`grid ${cols} gap-6`}>
        {(section.items || []).map((item, i) => (
          <article key={i} className={section.bgCard ? '' : 'bg-white rounded-xl border border-gray-200 p-6'}>
            {item.icone && <span className="text-2xl mb-2 block" aria-hidden="true">{item.icone}</span>}
            <h3 className="font-semibold text-gray-900 mb-2">{item.titulo}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{item.descricao}</p>
          </article>
        ))}
      </div>
      {section.conteudo && (
        <div className="mt-6">
          <MarkdownContent content={section.conteudo} />
        </div>
      )}
    </section>
  )
}

function ProseSection({ section }: { section: ContentSection }) {
  const wrapper = section.bgCard
    ? 'mt-16 bg-white rounded-xl border border-gray-200 p-8'
    : 'mt-16'

  return (
    <section className={wrapper}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.titulo}</h2>
      {section.subtitulo && <p className="text-gray-600 text-sm mb-4">{section.subtitulo}</p>}
      {section.conteudo && (
        <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
          <MarkdownContent content={section.conteudo} />
        </div>
      )}
      {section.items && section.items.length > 0 && (
        <div className={`grid ${colsMap[section.columns || '2']} gap-6 mt-6`}>
          {section.items.map((item, i) => (
            <article key={i}>
              <h3 className="font-semibold text-gray-900 mb-1">{item.titulo}</h3>
              <p className="text-sm text-gray-500">{item.descricao}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function TagsSection({ section }: { section: ContentSection }) {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.titulo}</h2>
      {section.subtitulo && (
        <div className="text-gray-600 mb-6">
          <MarkdownContent content={section.subtitulo} />
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {(section.tags || []).map((tag) => (
          <span key={tag} className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>
      {section.conteudo && (
        <div className="mt-4 text-sm text-gray-500">
          <MarkdownContent content={section.conteudo} />
        </div>
      )}
    </section>
  )
}

function LinksSection({ section }: { section: ContentSection }) {
  const cols = colsMap[section.columns || '3']

  return (
    <section className="mt-16" aria-labelledby={`section-${slugify(section.titulo)}`}>
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 id={`section-${slugify(section.titulo)}`} className="text-2xl font-bold text-gray-900 mb-1">{section.titulo}</h2>
          {section.subtitulo && <p className="text-gray-600 text-sm">{section.subtitulo}</p>}
        </div>
      </div>
      <div className={`grid ${cols} gap-4`}>
        {(section.links || []).map((link, i) => (
          <Link
            key={i}
            href={link.href}
            className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-all hover:border-gray-300"
          >
            {link.badgeText && (
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded mb-3 ${link.badgeColor || 'text-indigo-600 bg-indigo-50'}`}>
                {link.badgeText}
              </span>
            )}
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{link.label}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{link.descricao}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function ToolPageSections({ sections }: { sections: ContentSection[] }) {
  return (
    <>
      {sections.map((section, i) => {
        switch (section.tipo) {
          case 'steps':
            return <StepsSection key={i} section={section} />
          case 'cards':
            return <CardsSection key={i} section={section} />
          case 'prose':
            return <ProseSection key={i} section={section} />
          case 'tags':
            return <TagsSection key={i} section={section} />
          case 'links':
            return <LinksSection key={i} section={section} />
          default:
            return null
        }
      })}
    </>
  )
}

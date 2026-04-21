import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'

/**
 * Renderizador de Markdown minimalista para o conteúdo do blog/landings/comparações.
 *
 * Suporta um subset deliberado:
 * - Parágrafos (separados por linha em branco)
 * - Cabeçalhos: ## H2, ### H3
 * - Listas não-ordenadas (linhas iniciando com "- ") e ordenadas (linhas "1. ")
 * - Blockquote (> texto)
 * - Links internos e externos: [texto](url)
 * - Negrito: **texto**
 * - Itálico: *texto* ou _texto_
 * - Código inline: `texto`
 * - Separador: ---
 *
 * Decisão arquitetural: evitamos dependências novas (marked, react-markdown). O conteúdo
 * vem de YAML editado por humano/IA — restringir a sintaxe mantém previsibilidade e
 * evita XSS (nada é renderizado via dangerouslySetInnerHTML). Se a equipe editorial
 * precisar de mais recursos, trocar este módulo por react-markdown é trivial.
 */

interface MarkdownContentProps {
  content: string | undefined | null
  className?: string
}

export default function MarkdownContent({ content, className }: MarkdownContentProps) {
  if (!content) return null
  const blocks = parseBlocks(content.trim())
  return (
    <div className={className}>
      {blocks.map((block, i) => (
        <Fragment key={i}>{renderBlock(block, i)}</Fragment>
      ))}
    </div>
  )
}

type Block =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'blockquote'; lines: string[] }
  | { type: 'hr' }

function parseBlocks(input: string): Block[] {
  const lines = input.split(/\r?\n/)
  const blocks: Block[] = []
  let buffer: string[] = []
  let listBuffer: string[] = []
  let listType: 'ul' | 'ol' | null = null

  const flushParagraph = () => {
    if (buffer.length > 0) {
      blocks.push({ type: 'paragraph', text: buffer.join(' ').trim() })
      buffer = []
    }
  }
  let bqBuffer: string[] = []

  const flushList = () => {
    if (listBuffer.length > 0 && listType) {
      blocks.push({ type: listType, items: [...listBuffer] })
      listBuffer = []
      listType = null
    }
  }
  const flushBlockquote = () => {
    if (bqBuffer.length > 0) {
      blocks.push({ type: 'blockquote', lines: [...bqBuffer] })
      bqBuffer = []
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()

    // Linha em branco separa blocos
    if (line.trim() === '') {
      flushParagraph()
      flushList()
      flushBlockquote()
      continue
    }

    // Separador ---
    if (/^-{3,}$/.test(line.trim())) {
      flushParagraph()
      flushList()
      flushBlockquote()
      blocks.push({ type: 'hr' })
      continue
    }

    // Cabeçalhos
    if (line.startsWith('### ')) {
      flushParagraph()
      flushList()
      flushBlockquote()
      blocks.push({ type: 'h3', text: line.slice(4).trim() })
      continue
    }
    if (line.startsWith('## ')) {
      flushParagraph()
      flushList()
      flushBlockquote()
      blocks.push({ type: 'h2', text: line.slice(3).trim() })
      continue
    }

    // Blockquote (acumula linhas consecutivas)
    if (line.startsWith('> ')) {
      flushParagraph()
      flushList()
      bqBuffer.push(line.slice(2).trim())
      continue
    }

    // Lista ordenada
    const olMatch = /^(\d+)\.\s+(.*)$/.exec(line)
    if (olMatch) {
      flushParagraph()
      if (listType !== 'ol') flushList()
      listType = 'ol'
      listBuffer.push(olMatch[2])
      continue
    }

    // Lista não-ordenada
    if (line.startsWith('- ') || line.startsWith('* ')) {
      flushParagraph()
      if (listType !== 'ul') flushList()
      listType = 'ul'
      listBuffer.push(line.slice(2))
      continue
    }

    // Parágrafo normal — agrupa linhas consecutivas
    flushList()
    flushBlockquote()
    buffer.push(line)
  }

  flushParagraph()
  flushList()
  flushBlockquote()
  return blocks
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function renderBlock(block: Block, key: number): ReactNode {
  switch (block.type) {
    case 'h2':
      return (
        <h2 key={key} id={slugify(block.text)} className="text-2xl font-bold text-gray-900 mt-12 mb-4">
          {renderInline(block.text)}
        </h2>
      )
    case 'h3':
      return (
        <h3 key={key} id={slugify(block.text)} className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          {renderInline(block.text)}
        </h3>
      )
    case 'paragraph':
      return (
        <p key={key} className="text-gray-700 leading-relaxed mb-4">
          {renderInline(block.text)}
        </p>
      )
    case 'ul':
      return (
        <ul key={key} className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed">{renderInline(item)}</li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol key={key} className="list-decimal pl-6 space-y-2 mb-4 text-gray-700">
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed">{renderInline(item)}</li>
          ))}
        </ol>
      )
    case 'blockquote':
      return (
        <blockquote key={key} className="border-l-4 border-indigo-300 bg-indigo-50 text-gray-700 italic pl-4 pr-4 py-3 my-6 rounded-r-lg">
          {block.lines.map((line, i) => (
            <p key={i} className={i > 0 ? 'mt-2' : undefined}>
              {renderInline(line)}
            </p>
          ))}
        </blockquote>
      )
    case 'hr':
      return <hr key={key} className="my-8 border-gray-200" />
  }
}

/** Renderiza inline marks: **bold**, *italic*, `code`, [link](url) */
function renderInline(text: string): ReactNode {
  const tokens = tokenizeInline(text)
  return tokens.map((t, i) => <Fragment key={i}>{renderToken(t)}</Fragment>)
}

type InlineToken =
  | { kind: 'text'; value: string }
  | { kind: 'bold'; value: string }
  | { kind: 'italic'; value: string }
  | { kind: 'code'; value: string }
  | { kind: 'link'; text: string; href: string }

function tokenizeInline(input: string): InlineToken[] {
  const tokens: InlineToken[] = []
  let i = 0
  const n = input.length

  while (i < n) {
    // Link [text](url)
    if (input[i] === '[') {
      const close = input.indexOf('](', i)
      if (close > -1) {
        const endParen = input.indexOf(')', close + 2)
        if (endParen > -1) {
          tokens.push({
            kind: 'link',
            text: input.slice(i + 1, close),
            href: input.slice(close + 2, endParen),
          })
          i = endParen + 1
          continue
        }
      }
    }

    // Bold **text**
    if (input.startsWith('**', i)) {
      const end = input.indexOf('**', i + 2)
      if (end > -1) {
        tokens.push({ kind: 'bold', value: input.slice(i + 2, end) })
        i = end + 2
        continue
      }
    }

    // Italic *text* (sem conflitar com ** já tratado acima) ou _text_
    if ((input[i] === '*' || input[i] === '_') && input[i + 1] !== input[i]) {
      const marker = input[i]
      const end = input.indexOf(marker, i + 1)
      if (end > -1 && end > i + 1) {
        tokens.push({ kind: 'italic', value: input.slice(i + 1, end) })
        i = end + 1
        continue
      }
    }

    // Code inline `text`
    if (input[i] === '`') {
      const end = input.indexOf('`', i + 1)
      if (end > -1) {
        tokens.push({ kind: 'code', value: input.slice(i + 1, end) })
        i = end + 1
        continue
      }
    }

    // Texto — acumula até o próximo marker
    let j = i
    while (j < n) {
      const ch = input[j]
      if (ch === '[' || ch === '*' || ch === '_' || ch === '`') break
      j++
    }
    if (j === i) j = i + 1 // garante avanço
    tokens.push({ kind: 'text', value: input.slice(i, j) })
    i = j
  }

  // Consolida tokens de texto consecutivos
  const merged: InlineToken[] = []
  for (const t of tokens) {
    const last = merged[merged.length - 1]
    if (t.kind === 'text' && last?.kind === 'text') {
      last.value += t.value
    } else {
      merged.push(t)
    }
  }
  return merged
}

function renderToken(t: InlineToken): ReactNode {
  switch (t.kind) {
    case 'text':
      return t.value
    case 'bold':
      return <strong className="font-semibold text-gray-900">{t.value}</strong>
    case 'italic':
      return <em>{t.value}</em>
    case 'code':
      return <code className="bg-gray-100 text-indigo-700 px-1.5 py-0.5 rounded text-sm">{t.value}</code>
    case 'link':
      return isInternalLink(t.href) ? (
        <Link href={t.href} className="text-indigo-600 underline hover:text-indigo-800">
          {t.text}
        </Link>
      ) : (
        <a href={t.href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800">
          {t.text}
        </a>
      )
  }
}

function isInternalLink(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//')
}

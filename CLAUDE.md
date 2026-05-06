# GeraCode — CLAUDE.md

## Identidade
- **Site:** geracodigo.com.br — ferramentas grátis de código de barras, QR Code e QR Code Pix
- **Público:** lojistas brasileiros, MEI, restaurantes, e-commerce
- **Idioma:** pt-BR em todo conteúdo
- **Autor padrão:** Amanda Budri

## Stack
| Camada | Tech |
|---|---|
| Framework | Next.js 16.2.1 (Turbopack) — **não é o Next.js padrão**, leia `node_modules/next/dist/docs/` antes de escrever código |
| CMS | Keystatic — conteúdo em `content/**/*.yaml` |
| Deploy | Vercel (CLI `vercel deploy --prod`) |
| Linguagem | TypeScript |
| Testes | Vitest |

## Estrutura de conteúdo

```
content/
  ferramentas/      → páginas de ferramenta (tool pages)
  posts/            → artigos de blog (/blog/[slug])
  faqs/             → snippets de FAQ reutilizáveis (faqsSlugs nos posts)
  comparacoes/      → páginas comparativas (/comparar/[slug])
  landings-verticais/ → landing pages por vertical (/solucoes/[slug])
  publicos-alvo/    → páginas por persona
  site-config.yaml, global-seo.yaml, navegacao.yaml, redirects.yaml
```

**Campos obrigatórios em posts:**
`slug, title, metaDescription, h1, subtitle, resumo, categoria, persona, dataPublicacao, dataAtualizacao, autor, tempoLeitura, tags, ferramentaRelacionadaSlug, keywordPrimaria, keywordsSecundarias, ogTitle, ogDescription, ogAccent, twitterTitle, twitterDescription, bodyMarkdown, faqsSlugs`

**Valores válidos — categoria:** `pix | codigo-barras | ean | sku | leitor | qr-code | geral`
**Valores válidos — persona:** `mei | lojista-ecommerce | lojista-fisico | restaurante | dev | geral`

## Mapa de conteúdo e keywords (anti-canibalização)

| URL | keywordPrimaria |
|---|---|
| `/gerador-de-codigo-de-barras` | gerador codigo de barras |
| `/gerador-de-ean` | gerador ean-13 |
| `/gerador-de-qr-code` | gerador qr code |
| `/gerador-de-qr-code-pix` | gerador qr code pix |
| `/gerador-de-sku` | gerador sku |
| `/leitor-de-codigo-de-barras` | leitor código de barras online |
| `/blog/codigo-de-barras-para-produtos-guia-completo` | codigo de barras para produtos |
| `/blog/ean-13-ean-8-guia-completo` | ean 13 o que e |
| `/blog/code-128-itf-14-guia-logistica-estoque` | code 128 codigo de barras |
| `/blog/code-39-o-que-e-como-gerar-codigo-de-barras` | code 39 codigo de barras |
| `/blog/codigo-de-barras-sem-numero` | codigo de barras sem numero |
| `/blog/como-imprimir-etiquetas-codigo-de-barras` | etiqueta codigo de barras |
| `/blog/gerador-de-codigo-gratis-qual-usar` | gerador de código grátis |
| `/blog/gerador-pix-gratis-como-criar-qr-code-pix` | gerador de pix gratis |
| `/blog/como-gerar-qr-code-gratis-passo-a-passo` | como gerar qr code gratis |
| `/blog/qr-code-como-funciona-guia-completo` | qr code como funciona |
| `/blog/qr-code-para-restaurante` | qr code para restaurante |
| `/blog/qr-code-pix-para-mei-guia-completo` | qr code pix para mei |
| `/blog/qr-code-pix-sem-valor-fixo-api` | gerar qr code pix sem valor fixo via api |
| `/blog/qr-code-whatsapp-como-criar` | qr code whatsapp |
| `/blog/qr-code-wifi-como-criar` | qr code wifi |
| `/blog/como-escanear-qr-code-pelo-computador` | escanear qr code pelo computador |
| `/blog/o-que-e-sku-como-criar` | o que e sku |

**Antes de criar qualquer artigo novo:** verificar se a keyword-alvo já está ocupada por tool page ou post existente.

## Regras de SEO/conteúdo

- Keyword primária de post nunca deve ser igual nem muito próxima à keyword de tool page
- Tool pages = intent transacional; posts = intent informacional/navegacional
- `bodyMarkdown` de posts: mínimo 1.500 palavras para posts de cluster, 2.000+ para pilares
- Keyword primária deve aparecer no H1, nos primeiros 100 words e em ≥2 H2s
- Sempre verificar mapa acima antes de propor novo conteúdo
- `faqsSlugs` referencia slugs de `content/faqs/` — não duplicar FAQ no bodyMarkdown

## Prioridades de conteúdo (próximos artigos)

| # | Keyword-alvo | Vol/mês | Tipo | Nota |
|---|---|---|---|---|
| 1 | leitor de qr code online | 18k–25k | Nova ferramenta | Maior oportunidade |
| 2 | qr code instagram / link na bio | 12k–18k | Post informacional | Ângulo: lojista |
| 3 | codigo de barras mercado livre | 9k–14k | Post informacional | Não canibaliza /gerador-de-ean |
| 4 | qr code dinâmico | 8k–12k | Post informacional | Diferença estático vs dinâmico |
| 5 | como receber pix sem maquininha | 7k–10k | Atualizar post existente | Adicionar seção QR Pix |
| 6 | qr code personalizado com logo | 5k–8k | Post/ferramenta | Funcionalidade já existe |
| 7 | gerador de etiquetas | 5k–7k | Nova ferramenta | Pós-geração de código |
| 8 | qr code para evento | 4k–6k | Post informacional | Vertical inexplorada |
| 9 | como cadastrar produto mercado livre | 3k–5k | Post informacional | Alta intenção comercial |
| 10 | ean-13 gratis | 3k–5k | Reforçar /gerador-de-ean | Atualizar tool page |

**Regra:** Verificar mapa de keywords acima antes de começar qualquer item.

## Workflow de conteúdo

```
/research [tópico]   → gera brief em research/ (não commitado)
/write [slug]        → gera draft em drafts/ + YAML em content/posts/ (drafts/ não commitado)
/scrub [arquivo]     → limpa watermarks e em-dashes do draft
```

Scrub manual: `python3 scripts/scrub.py drafts/[arquivo].md`
Template de post: `content/posts/_template.yaml` (copiar e renomear)

**Apenas `content/posts/*.yaml` e `content/ferramentas/*.yaml` vão para o git.**
`drafts/` e `research/` estão no `.gitignore`.

## Deploy

```bash
# SEMPRE a partir do diretório principal — nunca da worktree
cd /Users/amanda/Documents/GitHub/geracodigo
git pull origin master          # sincronizar antes de deployar
vercel deploy --prod
```

**Armadilha comum:** worktrees Claude ficam em `.claude/worktrees/[nome]/`. Commits feitos na worktree chegam ao origin via `git push origin HEAD:master`, mas o diretório principal precisa de `git pull` antes do deploy ou o arquivo novo não é incluído no upload.

## Git

- Commitar apenas arquivos do site: `src/`, `content/`, `public/`, configs de raiz
- `drafts/`, `research/`, `credentials/` → gitignored, nunca commitar
- Branch de trabalho Claude: `claude/[worktree-name]`, push direto para `master`

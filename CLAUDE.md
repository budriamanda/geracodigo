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

## Workflow de conteúdo

```
/research [tópico]   → gera brief em research/ (não commitado)
/write [slug]        → gera draft em drafts/ + YAML em content/posts/ (drafts/ não commitado)
/scrub [arquivo]     → limpa watermarks e em-dashes do draft
```

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

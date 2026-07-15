# PRD — Kanso CLI

**Nome do produto:** Kanso CLI
**Pronúncia:** KAN-so
**Significado:** `Kanso` é um princípio estético japonês associado à simplicidade, clareza e eliminação do excesso.
**Temática:** Zen, simplicidade, foco, leveza.
**Produto:** Gerador de sites estáticos via CLI para HTML, CSS e JavaScript.
**Tagline:** `Build static sites with quiet speed.`

---

## 1. Resumo Executivo

Kanso CLI é um gerador de sites estáticos moderno, simples e rápido, voltado para desenvolvedores que querem criar sites em HTML, CSS, JavaScript e Markdown sem depender de frameworks client-side pesados.

O produto combina a simplicidade de ferramentas como Eleventy, a velocidade de Hugo e uma experiência CLI clara, com comandos para iniciar projetos, desenvolver localmente, gerar builds de produção e publicar em hosts estáticos.

O objetivo é oferecer uma ferramenta leve, extensível e amigável para blogs, landing pages, portfólios, documentação técnica, sites institucionais e projetos JAMstack simples.

---

## 2. Problema

Desenvolvedores que querem criar sites estáticos simples frequentemente enfrentam dois extremos:

**Ferramentas minimalistas demais:**
- Pouca organização de projeto.
- Ausência de hot reload.
- Pouco suporte a Markdown, assets, SEO e deploy.

**Frameworks robustos demais:**
- Excesso de JavaScript no cliente.
- Build mais complexo.
- Curva de aprendizado maior.
- Dependência de ecossistemas React/Vue/GraphQL mesmo para sites simples.

Kanso CLI resolve esse espaço intermediário: sites estáticos modernos, rápidos e organizados, sem complexidade desnecessária.

---

## 3. Objetivos

**Objetivos do produto:**
- Criar sites estáticos com HTML, CSS, JavaScript e Markdown.
- Fornecer uma CLI simples com comandos essenciais.
- Gerar saída final em HTML/CSS/JS puro.
- Oferecer hot reload no desenvolvimento.
- Suportar templates, layouts, front matter e assets.
- Permitir deploy fácil para hosts estáticos.

**Objetivos técnicos:**
- Build rápido e previsível.
- Arquitetura extensível via plugins.
- Baixa dependência de runtime.
- Boa compatibilidade com GitHub Pages, Netlify, Vercel, S3 e Cloudflare Pages.

---

## 4. Público-Alvo

**Desenvolvedor Frontend**
- Quer criar sites rápidos sem configurar frameworks complexos.
- Valoriza HTML, CSS e JS simples.
- Precisa de bom DX, hot reload e deploy fácil.

**Criador Técnico / Blogger**
- Escreve em Markdown.
- Precisa de front matter, tags, categorias, RSS e SEO.
- Quer versionar tudo em Git.

**Professor, Pesquisador ou Autor**
- Precisa publicar documentação, materiais, páginas de disciplina ou portfólios.
- Quer algo simples, portável e sem banco de dados.

**Pequenas equipes**
- Precisam de sites institucionais leves.
- Querem baixo custo de hospedagem.
- Preferem deploy em hosts estáticos.

---

## 5. Proposta de Valor

Kanso CLI entrega:

- **Simplicidade:** estrutura clara e comandos previsíveis.
- **Velocidade:** build rápido e incremental.
- **Portabilidade:** saída HTML/CSS/JS puro.
- **Flexibilidade:** Markdown, templates e componentes simples.
- **Baixo custo:** funciona em qualquer host estático.
- **Extensibilidade:** plugins e temas.
- **DX moderna:** hot reload, rebuild automático e configuração simples.

---

## 6. Escopo do MVP

O MVP deve incluir:

- CLI com comandos `init`, `dev`, `build` e `deploy`.
- Estrutura padrão de projeto.
- Suporte a Markdown com front matter.
- Templates HTML com variáveis, condicionais e loops.
- Layouts reutilizáveis.
- Copiador automático de assets.
- Servidor local com hot reload.
- Build para pasta `dist/`.
- Configuração via `kanso.config.js`.
- Geração de sitemap.
- SEO básico.
- Deploy inicial para GitHub Pages e Netlify.

**Fora do MVP:**
- CMS visual.
- Editor WYSIWYG.
- Painel administrativo.
- SSR.
- Banco de dados.
- Autenticação.
- E-commerce nativo.
- Sistema avançado de imagens com CDN.

---

## 7. Requisitos Funcionais

### RF-01 — Inicializar Projeto

Como desenvolvedor, quero executar um comando para criar um novo site, para começar rapidamente com uma estrutura pronta.

**Comando:**

```bash
kanso init my-site
```

**Critérios de aceite:**
- Cria uma pasta com o nome informado.
- Gera estrutura padrão do projeto.
- Inclui páginas de exemplo.
- Inclui arquivo de configuração.
- Inclui scripts básicos no `package.json`.

**Estrutura sugerida:**

```txt
my-site/
  content/
    index.md
    posts/
  layouts/
    base.html
    post.html
  components/
  assets/
    css/
    js/
    images/
  public/
  kanso.config.js
  package.json
```

---

### RF-02 — Servidor de Desenvolvimento

Como desenvolvedor, quero rodar um servidor local com hot reload, para visualizar mudanças em tempo real.

**Comando:**

```bash
kanso dev
```

**Critérios de aceite:**
- Inicia servidor local.
- Observa mudanças em `content/`, `layouts/`, `components/` e `assets/`.
- Reconstrói apenas arquivos afetados quando possível.
- Atualiza navegador automaticamente.
- Exibe erros de build de forma clara no terminal.

---

### RF-03 — Build de Produção

Como desenvolvedor, quero gerar arquivos estáticos otimizados, para publicar o site em qualquer host.

**Comando:**

```bash
kanso build
```

**Critérios de aceite:**
- Gera saída em `dist/`.
- Converte Markdown para HTML.
- Aplica layouts.
- Copia assets.
- Gera HTML, CSS e JS puros.
- Não inclui framework JavaScript no cliente por padrão.
- Exibe resumo do build: páginas geradas, tempo total e tamanho final.

---

### RF-04 — Templates

Como desenvolvedor, quero usar templates com variáveis, condicionais e loops, para criar páginas dinâmicas durante o build.

**Exemplo:**

```html
<h1>{{ title }}</h1>

{{ if posts }}
  {{ for post in posts }}
    <a href="{{ post.url }}">{{ post.title }}</a>
  {{ end }}
{{ end }}
```

**Critérios de aceite:**
- Suporta interpolação de variáveis.
- Suporta condicionais.
- Suporta loops.
- Suporta layouts base (extends).
- Suporta partials/components (include).

---

### RF-05 — Markdown com Front Matter

Como autor, quero escrever páginas em Markdown com metadados, para criar conteúdo estruturado.

**Exemplo:**

```markdown
---
title: Meu Primeiro Post
date: 2026-05-30
layout: post
tags: [web, static-site]
---

Conteúdo do post.
```

**Critérios de aceite:**
- Lê front matter YAML.
- Usa metadados no template.
- Suporta Markdown padrão (CommonMark).
- Suporta syntax highlighting.
- Suporta callouts/admonitions básicas.

---

### RF-06 — Assets

Como desenvolvedor, quero que imagens, fontes, CSS e JS sejam copiados automaticamente, para organizar o projeto sem configuração extra.

**Critérios de aceite:**
- Copia arquivos de `assets/` e `public/`.
- Preserva estrutura de diretórios.
- Permite referenciar assets em templates.
- Suporta CSS e JS simples.
- Suporte a SASS/SCSS fica como requisito pós-MVP.

---

### RF-07 — SEO Básico

Como autor, quero gerar metadados SEO automaticamente, para melhorar indexação.

**Critérios de aceite:**
- Gera `<title>`.
- Gera `meta description`.
- Suporta Open Graph básico.
- Gera `robots.txt`.
- Gera `sitemap.xml`.
- Permite customização via front matter e config.

---

### RF-08 — Feeds RSS/Atom

Como criador de conteúdo, quero gerar feeds automaticamente, para distribuir posts.

**Critérios de aceite:**
- Gera `rss.xml` (e/ou `feed.xml`).
- Usa posts de uma coleção configurada.
- Inclui título, resumo, data, URL e autor.
- Pode ser ativado/desativado no config.

---

### RF-09 — Paginação

Como autor, quero paginar listas de posts, para melhorar navegação.

**Critérios de aceite:**
- Permite configurar número de itens por página.
- Gera páginas `/page/2/`, `/page/3/`, etc.
- Expõe dados de paginação ao template.

---

### RF-10 — Deploy

Como desenvolvedor, quero publicar meu site com um comando, para reduzir atrito operacional.

**Comando:**

```bash
kanso deploy
```

**Critérios de aceite (MVP):**
- Suporta GitHub Pages.
- Suporta Netlify.
- Permite dry-run.
- Exibe instruções quando credenciais/configuração estiverem ausentes.

---

## 8. Requisitos Não Funcionais

**Performance:**
- Build alvo: menor que 200 ms por página em projetos pequenos/médios.
- Rebuild incremental para arquivos alterados.
- Tempo de inicialização do `dev`: menor que 1 segundo em projetos pequenos.
- Saída final sem JavaScript client-side obrigatório.

**Usabilidade:**
- CLI com mensagens claras e help integrado.
- Erros com arquivo, linha e causa provável.
- Documentação inicial com quickstart.
- Templates iniciais funcionais.

**Portabilidade:**
- Funciona em Linux, macOS e Windows.
- Saída compatível com qualquer host estático.
- Projetos versionáveis em Git.

**Segurança:**
- Não executa código remoto por padrão.
- Plugins devem ser explicitamente instalados.
- Deploy não deve expor tokens no log.
- Arquivos `.env` não devem ser copiados para `dist/`.

**Confiabilidade:**
- Build deve falhar claramente em caso de erro.
- `dist/` deve ser limpo ou atualizado de forma previsível.
- Watch mode deve recuperar após erros corrigidos.

---

## 9. Arquitetura de Alto Nível

**Tecnologia recomendada:**
- Node.js + TypeScript.
- CLI empacotada via npm (`kanso` e `create-kanso`).
- Parser Markdown: `markdown-it` ou `remark`.
- Front matter: `gray-matter`.
- Watch mode: `chokidar`.
- Servidor local: Node HTTP nativo ou `sirv`.
- Templates: engine própria simples ou Nunjucks/Liquid/Eta.

**Fluxo de build:**

```txt
content/*.md
     ↓
Front matter parser (gray-matter)
     ↓
Markdown renderer (markdown-it / remark)
     ↓
Template engine (Nunjucks / Eta / própria)
     ↓
HTML output
     ↓
dist/
```

**Componentes internos:**

| Componente | Responsabilidade |
|---|---|
| CLI Controller | Parsing de argumentos, routing de comandos |
| Project Scaffolder | Criação de novos projetos |
| Config Loader | Leitura de `kanso.config.js` |
| Content Loader | Leitura de arquivos Markdown e front matter |
| Template Renderer | Engine de templates HTML |
| Asset Pipeline | Cópia de CSS, JS, imagens, fontes |
| Build Engine | Orquestração do pipeline de build |
| Dev Server | Servidor local + watch mode + hot reload |
| Plugin Runner | Execução de hooks de extensão |
| Deploy Adapter | Publicação em GitHub Pages, Netlify, etc. |

---

## 10. Configuração

**Arquivo `kanso.config.js`:**

```js
export default {
  site: {
    title: "My Kanso Site",
    url: "https://example.com",
    language: "pt-BR"
  },
  content: {
    dir: "content"
  },
  output: {
    dir: "dist"
  },
  markdown: {
    syntaxHighlight: true,
    callouts: true
  },
  seo: {
    sitemap: true,
    robots: true
  },
  feed: {
    enabled: true,
    type: "rss"     // "rss" | "atom" | "json"
  },
  pagination: {
    perPage: 10
  },
  deploy: {
    provider: "github-pages"  // "github-pages" | "netlify" | "vercel"
  }
}
```

---

## 11. Plugin System (Pós-MVP)

Objetivo: permitir extensões sem aumentar o core.

**Exemplos de plugins futuros:**

- `@kanso/plugin-sass` — compilação SASS/SCSS
- `@kanso/plugin-image` — otimização e redimensionamento
- `@kanso/plugin-minify` — minificação de HTML/CSS/JS
- `@kanso/plugin-i18n` — internacionalização
- `@kanso/plugin-search` — índice de busca client-side
- `@kanso/plugin-cloudflare` — deploy para Cloudflare Pages
- `@kanso/theme-blog` — tema de blog
- `@kanso/theme-docs` — tema de documentação

**Formato conceitual:**

```js
export default function plugin(api) {
  api.on("build:start", () => { /* ... */ })
  api.on("page:render", (page) => page)
  api.on("build:end", () => { /* ... */ })
}
```

---

## 12. Temas (Pós-MVP)

O produto deve suportar temas no futuro, mas no MVP pode incluir apenas templates iniciais.

**Temas planejados:**
- Blog pessoal
- Documentação técnica
- Landing page
- Portfólio
- Site acadêmico

**Critérios futuros:**
- Instalação via CLI (`kanso theme add @kanso/theme-blog`).
- Sobrescrita local de layouts.
- Configuração de tema em `kanso.config.js`.

---

## 13. User Stories Prioritárias

**P0 — Must have:**
- Como dev, quero criar um projeto com `kanso init`, para começar rapidamente.
- Como dev, quero rodar `kanso dev`, para desenvolver com hot reload.
- Como dev, quero rodar `kanso build`, para gerar HTML/CSS/JS estático.
- Como autor, quero escrever páginas em Markdown com front matter.
- Como dev, quero usar layouts HTML reutilizáveis.

**P1 — Should have:**
- Como autor, quero gerar sitemap e SEO básico.
- Como autor, quero RSS automático.
- Como dev, quero deploy para GitHub Pages.
- Como dev, quero mensagens de erro claras no build.

**P2 — Could have:**
- Como dev, quero plugins para estender funcionalidades.
- Como autor, quero paginação em listas de posts.
- Como equipe, quero temas prontos para diferentes tipos de site.
- Como site multilíngue, quero suporte a i18n.

---

## 14. Métricas de Sucesso

**Métricas do MVP:**
- Criar novo projeto em menos de 5 segundos.
- Build de 100 páginas em menos de 2 segundos em máquina comum.
- Zero JavaScript client-side obrigatório no output padrão.
- Primeiro deploy funcional em menos de 2 minutos (GitHub Pages).
- Documentação quickstart concluída em até 5 minutos de leitura.

**Métricas de adoção:**
- 100 estrelas no GitHub em 90 dias.
- 500 downloads npm em 90 dias.
- 5 temas ou exemplos oficiais em 120 dias.
- 3 plugins oficiais até a versão 0.3.

---

## 15. Roadmap

| Versão | Prazo | Entregas |
|---|---|---|
| 0.1 (MVP) | 4-6 semanas | `init`, `dev`, `build`, Markdown, front matter, layouts, assets, sitemap, SEO básico, GitHub Pages deploy |
| 0.2 | +4 semanas | RSS/Atom, paginação, watch mode melhorado, minificação opcional, Netlify deploy, documentação completa |
| 0.3 | +6 semanas | Plugin API inicial, temas oficiais (blog, docs), SASS/SCSS, image optimization básica, i18n experimental |
| 1.0 | +8 semanas | API estável, plugin ecosystem, temas versionados, deploy adapters maduros (Vercel, Cloudflare, S3), testes robustos |

---

## 16. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Criar uma template engine própria pode aumentar complexidade | Alto | Avaliar Nunjucks, Liquid ou Eta antes de implementar engine customizada |
| Meta de performance estilo Hugo pode ser difícil em Node.js | Médio | Usar cache, incremental build e evitar abstrações pesadas; benchmark desde o início |
| Plugin system cedo demais pode travar arquitetura | Alto | MVP sem plugin público; criar hooks internos primeiro e expor após estabilização |
| Escopo pode crescer para virar framework completo | Alto | Manter foco em HTML/CSS/JS estático; dizer "não" a features de SPA/SSR |
| Dependência de template engine externa pode limitar sintaxe | Baixo | Escolher engine madura com boa comunidade; documentar como trocar |

---

## 17. Naming — Escolha do Nome

**Nome recomendado: Kanso CLI**

Motivos:
- Comunica simplicidade imediatamente (princípio zen).
- Combina com a proposta de remover complexidade.
- É curto (2 sílabas), pronunciável e memorável.
- Tem significado japonês verificável.
- Funciona bem como marca técnica: `kanso`, `kanso-cli`, `create-kanso`.

**Alternativas consideradas:**

| Nome | Significado | Ideal para |
|---|---|---|
| **Kanso** | Simplicidade, clareza, eliminação do excesso | Sites estáticos, tools minimalistas |
| Kaze | Vento | Velocidade, leveza |
| Hayai | Rápido | Performance, build tools |
| Shizen | Natural, orgânico | Ferramentas low-code |
| Kiri | Névoa, neblina | Privacidade, minimalismo |
| Torii | Portal sagrado | Gateways, entry points |

---

## 18. Critérios de Lançamento do MVP

O MVP pode ser considerado pronto quando:

- [ ] `kanso init demo-site` cria projeto funcional com estrutura completa.
- [ ] `kanso dev` serve o site localmente com hot reload funcional.
- [ ] `kanso build` gera `dist/` publicável sem erros.
- [ ] Markdown com front matter renderiza corretamente.
- [ ] Layout base + extends funcionam.
- [ ] Assets são copiados corretamente para `dist/`.
- [ ] Sitemap e SEO básico são gerados automaticamente.
- [ ] `kanso deploy` publica no GitHub Pages.
- [ ] Há documentação de instalação e quickstart.
- [ ] Há pelo menos um projeto exemplo funcional (blog simples).
- [ ] Build roda em Linux, macOS e Windows.
- [ ] Testes básicos cobrem os principais fluxos.

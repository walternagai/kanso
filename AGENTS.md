# AGENTS.md — Kanso

Guia para agentes de IA trabalhando neste repositório.

## Visão Geral

Kanso (簡素 — "simplicidade") é um static site generator moderno, simples e rápido para HTML, CSS, JavaScript e Markdown. Sem frameworks client-side pesados — apenas saída limpa e portável.

**Versão:** 1.1.0

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Linguagem | TypeScript (Node.js) |
| CLI | Commander |
| Engine | Templates Nunjucks + Markdown-it |
| Build | TypeScript Compiler (`tsc`) |
| Testes | Node --test (co-localizados como `*.test.ts` em src/) |
| Lint | tsc --noEmit + ESLint |

## Comandos

```bash
npm install             # Instalar dependências
npm run build           # Compilar TypeScript (tsc)
npm run dev             # Watch mode (tsc --watch)
npm test                # Compilar + rodar testes (tsc && node --test dist)
npm run lint            # tsc --noEmit && eslint src/
npm run lint:tsc        # Apenas tsc --noEmit
npm run lint:eslint     # Apenas eslint src/
npm run coverage        # c8 sobre npm test

# Uso da CLI compilada (após npm run build)
node dist/cli.js init <name>
node dist/cli.js build
node dist/cli.js serve
node dist/cli.js deploy
```

## Estrutura

```
kanso/
├── src/                # TypeScript fonte
│   ├── cli.ts          # Entry point (Commander)
│   ├── config.ts       # KansoConfig + defaultConfig
│   ├── commands/       # Comandos CLI + testes co-locados
│   │   ├── init.ts     # Scaffold (TEMPLATES inline)
│   │   ├── post.ts     # kanso post
│   │   ├── page.ts     # kanso page
│   │   ├── list.ts     # kanso list
│   │   └── ...
│   ├── engine/         # Motor de build (build, content, template,
│   │                   # server, static-handler, deploy, pagination,
│   │                   # collections, feed, seo, minify, ...)
│   ├── plugins/        # Sistema de plugins (runner.ts)
│   ├── themes/         # Temas (blog, docs, academic, research-group)
│   └── utils/          # logger, port, slug, fs
├── dist/               # JS compilado (npm run build)
├── docs/               # PRD/PRPS (spec histórica)
├── .kata/              # Tasks do ciclo kata (YAML de fases)
└── eslint.config.js    # Config ESLint
```

Templates Nunjucks são **inline em TypeScript** (TEMPLATES em
`commands/init.ts`, constantes em `themes/*.ts`) — não há diretório
`src/templates/`.

## Workflow de Qualidade (.kata/)

Tarefas de melhoria seguem o ciclo kata (FIT → THINK → SIMPLIFY → INTENT →
SURGICAL → VERIFY → REPORT). Cada tarefa é um YAML em `.kata/` com critério
de sucesso (`done`), fases preenchidas e verificação. Seguir o ciclo ao
introduzir features ou correções relevantes.

## Regras

- TypeScript strict mode
- Commits em inglês (Conventional Commits: feat, fix, docs, refactor, chore, test)
- Testes com Node --test, co-localizados com o código (`src/**/x.test.ts`)
- lint: `npm run lint` (tsc --noEmit + eslint src/) antes de commit
- Commits individuais por task; cada task kata em `.kata/` versionada junto
# AGENTS.md — Kanso

Guia para agentes de IA trabalhando neste repositório.

## Visão Geral

Kanso (簡素 — "simplicidade") é um static site generator moderno, simples e rápido para HTML, CSS, JavaScript e Markdown. Sem frameworks client-side pesados — apenas saída limpa e portável.

**Versão:** 1.0.0

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Linguagem | TypeScript (Node.js) |
| CLI | Commander |
| Engine | Templates Nunjucks + Markdown-it |
| Build | TypeScript Compiler (`tsc`) |
| Testes | Node --test |

## Comandos

```bash
npm install             # Instalar dependências
npm run build           # Compilar TypeScript
npm run dev             # Watch mode
npm test                # Rodar testes
npm run lint            # tsc --noEmit

# Uso
npx kanso init <name>   # Inicializar projeto
npx kanso build         # Construir site
npx kanso serve         # Servidor dev
npx kanso deploy        # Deploy
```

## Estrutura

```
kanso/
├── src/                # TypeScript fonte
│   ├── cli.ts          # Entry point (Commander)
│   ├── commands/       # Comandos (build, serve, init, etc.)
│   ├── engine/         # Motor de build
│   ├── plugins/        # Sistema de plugins
│   ├── templates/      # Templates Nunjucks
│   ├── themes/         # Temas
│   └── utils/          # Utilitários
├── dist/               # JS compilado
└── docs/               # Documentação
```

## Regras

- TypeScript strict mode
- Commits em inglês (Conventional Commits)
- Testes com Node --test
- lint: `tsc --noEmit` antes de commit

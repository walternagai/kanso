# Contributing to Kanso CLI

Thank you for your interest in contributing!

## Development Setup

```bash
# Clone the repository
git clone https://github.com/walternagai/kanso.git
cd kanso

# Install dependencies
npm install

# Build
npm run build

# Run tests (compiles then runs node --test)
npm test

# Lint (tsc --noEmit + eslint)
npm run lint

# Link for local testing
npm link
```

## Project Structure

```
src/
  cli.ts              # CLI entry point (Commander)
  config.ts           # KansoConfig + defaultConfig
  commands/           # CLI commands + co-located tests (*.test.ts)
  engine/             # Core engine (build, template, server, deploy, ...)
  plugins/            # Plugin system
  themes/             # Built-in themes (inline Nunjucks constants)
  utils/              # logger, port, slug, fs
.kata/                # Kata cycle task YAMLs (FIT -> ... -> REPORT)
eslint.config.js      # ESLint configuration
```

Templates are inline in TypeScript — there is no `src/templates/` directory.

## Adding a Feature

1. Create a branch: `git checkout -b feature/my-feature`
2. Implement the feature
3. Add tests co-located with the code (`src/**/x.test.ts`)
4. Run `npm run lint` and `npm test`
5. Commit with a descriptive message
6. Push and create a PR

## Commit Messages

Use conventional commits:
- `feat(scope): description` for new features
- `fix(scope): description` for bug fixes
- `docs: description` for documentation
- `refactor: description` for internal changes
- `chore: description` for tooling and maintenance
- `test: description` for tests

## Code Style

- TypeScript strict mode
- No comments unless necessary
- Use async/await over callbacks
- Handle errors explicitly (typed errors in engine, exit codes in commands)
- Engine functions must not call `process.exit` — throw and let commands catch
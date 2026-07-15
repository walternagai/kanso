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

# Run tests
node --test dist/**/*.test.js

# Link for local testing
npm link
```

## Project Structure

```
src/
  cli.ts              # CLI entry point
  commands/           # CLI commands (init, build, dev, etc.)
  engine/             # Core engine (template, content, build, etc.)
  plugins/            # Plugin system
  themes/             # Built-in themes
  utils/              # Utilities (logger)
```

## Adding a Feature

1. Create a branch: `git checkout -b feature/my-feature`
2. Implement the feature
3. Add tests
4. Run `node --test dist/**/*.test.js`
5. Commit with a descriptive message
6. Push and create a PR

## Commit Messages

Use conventional commits:
- `feat(feature): description` for new features
- `fix(feature): description` for bug fixes
- `docs: description` for documentation
- `test: description` for tests

## Code Style

- TypeScript strict mode
- No comments unless necessary
- Use async/await over callbacks
- Handle errors explicitly

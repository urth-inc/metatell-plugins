# metatell plugins

This repository contains templates and runnable examples for developing plugins
for metatell, plus an LLM-agent plugin that assists with that development.

## Repository layout

Plugins come in two kinds that share no build pipeline, no deployment target,
and no registration API. They are kept apart at the repository root.

- [`frontend-plugins`](./frontend-plugins) — plugins that run in the browser as
  Module Federation remotes, written in TypeScript and React. Contains
  [`templates`](./frontend-plugins/templates) and
  [`examples`](./frontend-plugins/examples).
- [`backend-plugins`](./backend-plugins) — plugins that run as Cloudflare
  Workers in a Workers for Platforms dispatch namespace. Support for these is
  still under development and the directory is a placeholder for now.
- [`agent-plugins`](./agent-plugins) — plugins for LLM agents. These are
  development tools and are distinct from the metatell plugins above.

Each project is self-contained and has its own package manager configuration and
README. This repository intentionally does not define a root package-manager
workspace.

## Install the LLM-agent plugin

The `metatell-plugin-dev` plugin helps Claude Code, Codex CLI, and GitHub
Copilot CLI build and validate metatell plugins.

### Claude Code

```text
/plugin marketplace add urth-inc/metatell-plugins
/plugin install metatell-plugin-dev@urth
```

### Codex CLI 0.147.0 or later

```bash
codex plugin marketplace add urth-inc/metatell-plugins
codex plugin add metatell-plugin-dev@urth
```

### GitHub Copilot CLI

```bash
copilot plugin install urth-inc/metatell-plugins:agent-plugins/metatell-plugin-dev
```

See [`agent-plugins/metatell-plugin-dev`](./agent-plugins/metatell-plugin-dev)
for its contents and usage.

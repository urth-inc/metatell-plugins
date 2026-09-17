# metatell-plugin-dev

`metatell-plugin-dev` helps coding agents build, validate, package, and publish
metatell client plugins. It supports Claude Code and Agent Plugins 1.0.0 while
sharing the same skill directory.

## Installation

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

After installation, ask your coding agent to build or validate a metatell
plugin. The agent can then select the `metatell-plugin-dev` skill.

## Contents

- `plugin.json`: Agent Plugins 1.0.0 manifest
- `.claude-plugin/plugin.json`: Claude Code plugin manifest
- `skills/metatell-plugin-dev/`: skill instructions, references, and validation
  scripts

The skill uses this repository's public
[templates](https://github.com/urth-inc/metatell-plugins/tree/develop/frontend-plugins/templates) as
starters and
[examples](https://github.com/urth-inc/metatell-plugins/tree/develop/frontend-plugins/examples) as
reference implementations.

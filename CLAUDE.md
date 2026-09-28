<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

# Git

- NUNCA execute operações de git que alterem o repositório por conta própria. Faça-as somente quando o usuário solicitar explicitamente.
- Isso inclui: `add`, `commit`, `push`, `pull`, `fetch`, `merge`, `rebase`, `reset`, `revert`, `stash`, `tag`, `checkout`/`switch`, criar/renomear/apagar branches, alterar remotes e operações no GitHub (criar repositório, PR, issue).
- Comandos somente leitura (`status`, `log`, `diff`, `show`, `branch --list`) podem ser usados livremente.
- Uma solicitação autoriza apenas a operação pedida naquele momento: pedir um commit não autoriza o push, e um pedido anterior não vale para as próximas alterações.
- Ao terminar uma tarefa com alterações, apenas informe o que mudou e pergunte se o usuário deseja commitar.

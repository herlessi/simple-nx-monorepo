# simple-nx-monorepo

Um monorepo [Nx](https://nx.dev) simples com um front-end e um back-end em TypeScript que
compartilham tipos por uma biblioteca interna. Serve como base reutilizável para outros
exemplos e tecnologias.

O domínio de exemplo é um mini e-commerce (catálogo → carrinho → checkout), só para ter
um fluxo real entre os apps.

## Stack

| Projeto | Tecnologia | Porta |
|---|---|---|
| `apps/web` | Next.js 16 (App Router) | 4200 |
| `apps/api` | NestJS 11 + Prisma 6 | 3000 (`/api`) |
| `libs/shared/types` | Tipos compartilhados (`@ci-cd/shared-types`) | — |
| Postgres 16 | `docker-compose.yml` | 5433 |

Gerenciador de pacotes: **pnpm workspaces**. Orquestração de tarefas: **Nx 23**.

## Estrutura

```
.
├─ apps/
│  ├─ web/            # front-end Next.js
│  └─ api/            # back-end NestJS + Prisma (schema, migrations e seed em prisma/)
├─ libs/
│  └─ shared/types/   # contratos (DTOs) usados pelos dois apps
├─ docker-compose.yml # Postgres local
├─ nx.json            # plugins e defaults do Nx
├─ pnpm-workspace.yaml
└─ tsconfig.base.json # config TypeScript compartilhada
```

- **`apps/`** contém o que é executável.
- **`libs/`** contém código reutilizável, importado pelos apps. A lib `shared/types` tem só
  tipos (`import type`), então não precisa de build: se um contrato mudar, o TypeScript
  aponta o erro no front e no back ao mesmo tempo.
- Os apps dependem da lib via `"@ci-cd/shared-types": "workspace:*"` no `package.json`.

## Como rodar

Pré-requisitos: Node 20+, pnpm 10+ e Docker.

```sh
pnpm install
cp .env.example .env
pnpm db:setup   # sobe o Postgres, aplica as migrations e popula os produtos
pnpm dev        # API em http://localhost:3000/api e web em http://localhost:4200
```

## Comandos do monorepo

Todas as tarefas passam pelo Nx, que entende as dependências entre projetos e faz cache
dos resultados.

```sh
pnpm build        # nx run-many -t build
pnpm test         # nx run-many -t test
pnpm lint         # nx run-many -t lint
pnpm typecheck    # nx run-many -t typecheck

pnpm nx run api:serve          # uma tarefa de um projeto
pnpm nx affected -t test       # só os projetos afetados pelas mudanças
pnpm nx graph                  # grafo de dependências no browser
pnpm nx show project api       # targets disponíveis de um projeto
```

Banco: `pnpm db:up`, `pnpm db:down`, `pnpm db:migrate`, `pnpm db:seed`.
Para mudar o schema, edite `apps/api/prisma/schema.prisma` e rode
`pnpm nx run api:db-migrate-dev`.

## Adicionando novos projetos

Use os geradores do Nx para manter o padrão do workspace:

```sh
pnpm nx g @nx/next:app apps/<nome>           # novo app Next.js
pnpm nx g @nx/nest:app apps/<nome>           # novo app NestJS
pnpm nx g @nx/js:lib libs/<escopo>/<nome>    # nova biblioteca
pnpm nx list                                 # plugins instalados e disponíveis
```

Depois, rode `pnpm nx sync` para atualizar as referências de TypeScript entre projetos.

## Os apps de exemplo

**API** (`/api`):

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Status da API e do banco |
| GET | `/products`, `/products/:id` | Catálogo |
| POST | `/cart` | Cria carrinho |
| GET | `/cart/:id` | Consulta carrinho |
| POST | `/cart/:id/items` | Adiciona item `{ productId, quantity }` |
| PATCH / DELETE | `/cart/:id/items/:itemId` | Altera quantidade / remove |
| POST | `/checkout` | Finaliza a compra `{ cartId }` |
| GET | `/orders/:id` | Consulta pedido |
| GET / PUT / POST | `/chaos`, `/chaos/reset` | Simulação de latência e falhas |

O checkout cria o pedido, reserva estoque, cobra o pagamento (simulado) e envia a
notificação (simulada). Se estoque ou pagamento falharem, o pedido fica `FAILED` e o
estoque é devolvido.

**Web**: catálogo e detalhe de produto (Server Components), carrinho e checkout, e a
página `/chaos`, que injeta latência e erros nos serviços da API para simular falhas.

## Observações técnicas

- `apps/api/webpack.config.js` marca as dependências do `package.json` da API como
  externas. Sem isso, com pnpm, o `@prisma/client` vai para o bundle e o query engine
  não é encontrado.
- Os `jest.config` estão em `.cjs` porque o Jest 30 compila configs `.cts` com
  `moduleResolution=node10`, que o TypeScript 6 rejeita.
- O Prisma Client é gerado no `postinstall` (`nx run api:prisma-generate`).

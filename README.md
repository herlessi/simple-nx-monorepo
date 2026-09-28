# Mini Shop — monorepo Nx para demo de telemetria

Mini e-commerce (catálogo → carrinho → checkout) criado como base para uma
demonstração de telemetria (OpenTelemetry). Os apps são simples de propósito: o
objetivo é gerar traces multi-serviço, erros reproduzíveis e métricas de negócio.

| Projeto | Stack | Porta |
|---|---|---|
| `apps/web` | Next.js 16 (App Router) | 4200 |
| `apps/api` | NestJS 11 + Prisma 6 | 3000 (`/api`) |
| `libs/shared/types` | Tipos/DTOs compartilhados (`@ci-cd/shared-types`) | — |
| Postgres 16 | `docker-compose.yml` | 5433 |

## Pré-requisitos

- Node 20+ e pnpm 10+
- Docker (para o Postgres)

## Como rodar

```sh
pnpm install
cp .env.example .env
pnpm db:setup   # sobe o Postgres, aplica as migrations e popula 12 produtos
pnpm dev        # API em http://localhost:3000/api e web em http://localhost:4200
```

Outros scripts: `pnpm build`, `pnpm lint`, `pnpm test`, `pnpm typecheck`,
`pnpm db:seed` (reseta os dados), `pnpm db:down`.
Para mudar o schema: edite `apps/api/prisma/schema.prisma` e rode `pnpm nx run api:db-migrate-dev`.

## Fluxo principal (o trace da demo)

`POST /api/checkout` orquestra, em sequência:

```
checkout
 ├─ cart.get                (Postgres)
 ├─ order.create  PENDING   (Postgres)
 ├─ inventory.reserve       (transação Postgres)
 ├─ payment.charge          (gateway simulado, 100–300 ms)
 ├─ order.update  PAID      (Postgres)
 ├─ cart.clear              (Postgres)
 └─ notification.send       (e-mail simulado; falha aqui não desfaz o pedido)
```

Se o estoque ou o pagamento falharem, o pedido fica `FAILED` com o motivo, o
estoque é devolvido e a API responde com o status original (409/402/503) mais o
`orderId`.

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/health` | Liveness + ping no banco |
| GET | `/api/products`, `/api/products/:id` | Catálogo |
| POST | `/api/cart` | Cria carrinho |
| GET | `/api/cart/:id` | Consulta carrinho |
| POST | `/api/cart/:id/items` | Adiciona item `{ productId, quantity }` |
| PATCH / DELETE | `/api/cart/:id/items/:itemId` | Altera quantidade / remove |
| POST | `/api/checkout` | Finaliza `{ cartId }` |
| GET | `/api/orders/:id` | Consulta pedido |
| GET / PUT | `/api/chaos` | Lê / altera a configuração de chaos |
| POST | `/api/chaos/reset` | Zera o chaos |

## Chaos

A página `/chaos` (ou `PUT /api/chaos`) injeta latência e taxa de erro em
`products`, `inventory`, `payment` e `notification`. A configuração fica em memória.

```sh
# 100% de recusa no pagamento
curl -X PUT localhost:3000/api/chaos -H 'content-type: application/json' \
  -d '{"payment":{"latencyMs":0,"errorRate":1}}'
```

Cenários sugeridos para a demo:
- **Pagamento 100% erro**: 402, pedido `FAILED`, estoque devolvido.
- **Estoque +3000 ms**: um span lento e fácil de achar no trace.
- **Notificação 100% erro**: pedido `PAID`, mas com erro registrado (falha "silenciosa").
- **Catálogo 50% erro**: a home do Next falha com 503 vindo do servidor.

## Onde a telemetria vai entrar

- `apps/api/src/instrumentation.ts`: importado na 1ª linha do `main.ts` (SDK OTel Node).
- `apps/web/src/instrumentation.ts`: hook `register()` nativo do Next.js.
- `apps/api/src/common/all-exceptions.filter.ts`: registrar exceções no span ativo.
- `apps/api/src/common/request-logging.middleware.ts`: logs de requisição (correlacionar com trace id).
- O CORS da API já aceita os cabeçalhos `traceparent`, `tracestate` e `baggage`.

## Observações técnicas

- `apps/api/webpack.config.js` marca as dependências do `package.json` da API como
  externas. Sem isso, com pnpm, o `@prisma/client` vai para o bundle e o query engine
  não é encontrado.
- Os `jest.config` estão em `.cjs` porque o Jest 30 compila configs `.cts` com
  `moduleResolution=node10`, que o TypeScript 6 rejeita.

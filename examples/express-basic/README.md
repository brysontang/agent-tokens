# Express Basic Example

This demo shows a simple “intent drift” guardrail:

- user goal: **weather**
- allowed scope: only `GET /weather`
- any attempt to call `POST /bank/transfer` is denied (strict mode)

## Run

From repo root:

```bash
pnpm install
pnpm -r build
pnpm --filter @agent-tokens/example-express-basic dev
```

In another terminal, print a token:

```bash
pnpm --filter @agent-tokens/example-express-basic token
```

Copy the printed token into the curl commands below.

## Try allowed request

```bash
curl -H "agent-token: <PASTE_TOKEN>" http://localhost:3000/weather
```

## Try denied request (intent drift)

```bash
curl -X POST -H "agent-token: <PASTE_TOKEN>" http://localhost:3000/bank/transfer
```

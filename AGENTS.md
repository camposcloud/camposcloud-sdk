# camposcloud-sdk

SDK TypeScript/JavaScript da API da Campos Cloud, publicado no npm como `@camposcloud/sdk`.

## Estrutura
- `src/class/CamposCloudSDK.ts`: cliente principal (token de API, axios).
- `src/class/Application.ts`: operações de uma aplicação.
- `src/types`: tipos de requisição e resposta. Devem acompanhar a API real do camposcloud-control.
- `src/test/index.ts`: script manual de teste contra a API.

## Comandos
- `npm run build` — `tsc` para `dist/`.
- `npm run dev` / `npm test` — roda `src/test/index.ts` em modo watch (precisa de token válido no `.env`).
- `node_modules/.bin/tsc --noEmit -p .` — typecheck; ler a saída.

## Cuidados
- **Não publicar no npm** (`npm publish`) sem pedido explícito. Mudar a versão é decisão do Vitor.
- Mudou a API pública do SDK? Atualize o `README.md` e as páginas em `docs/sdk/javascript` (repositório docs), na mesma rodada e com PRs citando um ao outro.

## Fluxo de trabalho (obrigatório)
- Toda modificação numa worktree própria:
  `git fetch origin && git worktree add -b <tipo>/<assunto> .claude/worktrees/<assunto> origin/main`.
  Nunca editar o checkout principal nem commitar na `main`.
- Um assunto por branch.
- Antes de subir: typecheck e build, lendo a saída.
- Push da branch → PR para `main` (rascunho enquanto não estiver pronto) → revisão (`/code-review`) → correções. **Quem faz o merge na `main` é o Vitor**; agentes nunca fazem merge, push na `main` nem force-push.
- Nunca imprimir valores de tokens ou segredos.

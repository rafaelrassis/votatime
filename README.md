# VotaTime

Votação de escalação com Next.js + Prisma + PostgreSQL. A home lista as rodadas (aberta, encerrada, em breve); ao clicar numa rodada aberta, a torcida escala o time posição por posição. Contagem de votos persiste no banco; a trava de "já votei nesta posição" continua no `localStorage`.

Escudos dos adversários e a lista de jogos (home e `/jogos`) usam dados reais dos
principais campeonatos via [football-data.org](https://www.football-data.org).

```bash
cp .env.example .env   # ajuste DATABASE_URL e FOOTBALL_DATA_API_KEY
npm install
npx prisma db push     # cria as tabelas
npm run db:seed        # popula com data/players.json e data/rounds.json
npm run sync:jogos     # baixa escudos reais e jogos reais (precisa da API key)
npm run dev
```

Regras:
- 4-3-3 fixo, 11 slots, 1 voto por posição, sem troca.
- Jogador escalado numa posição fica travado nas outras.
- Percentual da posição aparece só depois do voto.
- Trava por `localStorage` (chave `escala:v1:<rodada>`), sem reCAPTCHA.
- Rodada encerrada mostra a escalação definida (somente leitura); rodada que ainda não abriu fica bloqueada.
- `data/*.json` são só a semente inicial do banco (`prisma/seed.js`); depois do seed, jogadores e rodadas vivem no Postgres.

## Escudos e jogos reais

- `npm run sync:jogos` chama a API do football-data.org e grava dois tipos de dado:
  - `Team`: escudo real de cada clube dos principais campeonatos, usado no `Brasao`
    (adversário da rodada e no confronto de previsão). Sem escudo sincronizado, o
    `Brasao` cai no círculo com iniciais coloridas de sempre.
  - `Match`: jogos reais dos próximos 15 dias, usados na tira "Jogos de hoje e da
    semana" na home e na página `/jogos`.
- Cadastre a conta grátis em https://www.football-data.org/client/register e coloque a
  chave em `FOOTBALL_DATA_API_KEY` no `.env` (nunca commitar essa chave — `.env` já está
  no `.gitignore`).
- Rode `npm run sync:jogos` periodicamente (cron, GitHub Action, etc.) — o app não
  sincroniza sozinho a cada acesso. O plano free tem limite de ~10 chamadas/min; o
  script já respeita isso.
- `Team.apiId` (id numérico do time na football-data.org) é gravado por esse script e
  usado por `/api/squad` pra buscar o elenco do adversário — rode `sync:jogos` de novo
  depois de atualizar o banco pra esse campo ser preenchido.

## Elenco do adversário na tela de previsão

- `/previsao/[id]` mostra os 5 jogadores mais votados do nosso time e, do lado do
  adversário, 5 jogadores do elenco real (sem votos — a torcida só vota na escalação
  do próprio time).
- O elenco do adversário é buscado sob demanda em `/api/squad?time=<id>` na primeira
  vez que alguém abre aquele confronto, e fica cacheado no Postgres (tabela `Player`,
  com `time` diferente de `"gremio"`) — não é uma sincronização em lote.
- Depois de atualizar `prisma/schema.prisma` (campos `Player.time` e `Team.apiId`),
  rode `npx prisma db push` de novo pra aplicar no banco.

## Schema em produção (Vercel)

- O script `build` roda `prisma db push` antes de `next build`, então todo deploy na
  Vercel já sincroniza o schema com o banco de produção — não precisa rodar
  `npx prisma db push` manualmente lá (só continua necessário em dev local).
- `npm run db:seed` **não** roda automaticamente no build de propósito: ele faz
  upsert com os valores de `data/*.json`, e rodar em produção resetaria
  `Player.votos`/`Round.votantes` acumulados de volta pro valor da semente.
- `scripts/fix-r12.js` roda no build e só preenche a escalação final da rodada 12
  (`escalacao`/`escalacaoAdversario`) se ainda estiver vazia — é um ajuste pontual,
  não um mecanismo genérico; uma mudança de dado futura deve virar seed manual ou
  outro script específico, não reaproveitar esse.

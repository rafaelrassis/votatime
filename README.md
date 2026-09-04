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

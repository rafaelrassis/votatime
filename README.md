# VotaTime

Votação de escalação com Next.js + Prisma + PostgreSQL. A home lista as rodadas (aberta, encerrada, em breve); ao clicar numa rodada aberta, a torcida escala o time posição por posição. Contagem de votos persiste no banco; a trava de "já votei nesta posição" continua no `localStorage`.

```bash
cp .env.example .env   # ajuste DATABASE_URL
npm install
npx prisma db push     # cria as tabelas
npm run db:seed        # popula com data/players.json e data/rounds.json
npm run dev
```

Regras:
- 4-3-3 fixo, 11 slots, 1 voto por posição, sem troca.
- Jogador escalado numa posição fica travado nas outras.
- Percentual da posição aparece só depois do voto.
- Trava por `localStorage` (chave `escala:v1:<rodada>`), sem reCAPTCHA.
- Rodada encerrada mostra a escalação definida (somente leitura); rodada que ainda não abriu fica bloqueada.
- `data/*.json` são só a semente inicial do banco (`prisma/seed.js`); depois do seed, jogadores e rodadas vivem no Postgres.

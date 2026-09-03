# VotaTime

Mock front-end da votação da escalação. Dados em `data/*.json`, voto em `localStorage`.

```bash
npm install
npm run dev
```

Regras do mock:
- 4-3-3 fixo, 11 slots, 1 voto por posição, sem troca.
- Jogador escalado numa posição fica travado nas outras.
- Percentual da posição aparece só depois do voto.
- Trava por `localStorage` (chave `escala:v1:<rodada>`), sem reCAPTCHA.
- `data/rounds.json` guarda a rodada atual (prazo) e o histórico.


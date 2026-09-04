// Normaliza nome de clube pra casar "Palmeiras" com "SE Palmeiras", etc.
export function normalizar(nome) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(fc|cf|sc|ec|se|ac|afc|cd|sad|clube|futebol|de|do|da)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// times: array de { id, nome, escudo } (vindo de /api/teams)
export function buscarEscudo(times, nome) {
  const alvo = normalizar(nome);
  const achado = times.find(
    (t) => t.id === alvo || t.id.includes(alvo) || alvo.includes(t.id)
  );
  return achado?.escudo || null;
}

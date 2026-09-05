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

// Apelidos populares que não batem por substring com o nome oficial da API
// (ex: "Athletico-PR" vs "CA Paranaense"). Chave e valor já normalizados.
const APELIDOS = {
  "athletico pr": "paranaense",
};

// times: array de { id, nome, escudo } (vindo de /api/teams)
function encontrarTime(times, nome) {
  const alvo = APELIDOS[normalizar(nome)] || normalizar(nome);
  return times.find((t) => t.id === alvo || t.id.includes(alvo) || alvo.includes(t.id));
}

export function buscarEscudo(times, nome) {
  return encontrarTime(times, nome)?.escudo || null;
}

// id do Team (mesmo id usado em Player.time e no endpoint /api/squad).
export function buscarTimeId(times, nome) {
  return encontrarTime(times, nome)?.id || null;
}

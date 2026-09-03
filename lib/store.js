import rounds from "@/data/rounds.json";

export const RODADA = rounds.atual;
export const HISTORICO = rounds.historico;

// 4-3-3. x/y em % dentro do campo (0,0 = fundo esquerdo do nosso lado).
export const SLOTS = [
  { id: "gol", rotulo: "Goleiro", posicao: "GOL", x: 50, y: 6 },
  { id: "lat_d", rotulo: "Lateral direito", posicao: "LAT", x: 85, y: 24 },
  { id: "zag_d", rotulo: "Zagueiro", posicao: "ZAG", x: 63, y: 20 },
  { id: "zag_e", rotulo: "Zagueiro", posicao: "ZAG", x: 37, y: 20 },
  { id: "lat_e", rotulo: "Lateral esquerdo", posicao: "LAT", x: 15, y: 24 },
  { id: "vol", rotulo: "Volante", posicao: "MEI", x: 50, y: 44 },
  { id: "mei_d", rotulo: "Meia", posicao: "MEI", x: 74, y: 55 },
  { id: "mei_e", rotulo: "Meia", posicao: "MEI", x: 26, y: 55 },
  { id: "pta_d", rotulo: "Ponta direita", posicao: "ATA", x: 80, y: 80 },
  { id: "cen", rotulo: "Centroavante", posicao: "ATA", x: 50, y: 88 },
  { id: "pta_e", rotulo: "Ponta esquerda", posicao: "ATA", x: 20, y: 80 },
];

const KEY = `escala:v1:${RODADA.id}`;

export function lerVotos() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

// Um voto por posição, e não desfaz: é a trava do mock.
export function gravarVoto(slotId, playerId) {
  const votos = lerVotos();
  if (votos[slotId]) return votos;
  const novo = { ...votos, [slotId]: playerId };
  localStorage.setItem(KEY, JSON.stringify(novo));
  return novo;
}

export function limparVotos() {
  localStorage.removeItem(KEY);
}

// Percentual dentro da posição, somando a semente + o voto local.
export function apuracao(jogadores, posicao, votos) {
  const doGrupo = jogadores.filter((j) => j.posicao === posicao);
  const meus = Object.values(votos);
  const com = doGrupo.map((j) => ({
    ...j,
    total: j.votos + meus.filter((id) => id === j.id).length,
  }));
  const soma = com.reduce((a, j) => a + j.total, 0) || 1;
  return com
    .map((j) => ({ ...j, pct: Math.round((j.total / soma) * 100) }))
    .sort((a, b) => b.total - a.total);
}

export function prazo(fecha, agora = Date.now()) {
  const ms = new Date(fecha).getTime() - agora;
  if (ms <= 0) return null;
  return {
    dias: Math.floor(ms / 86400000),
    horas: Math.floor((ms / 3600000) % 24),
    min: Math.floor((ms / 60000) % 60),
    seg: Math.floor((ms / 1000) % 60),
  };
}

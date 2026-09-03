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

export const ROTULO = {
  "em-breve": "Abre em breve",
  aberta: "Votação aberta",
  encerrada: "Encerrada",
};

export function status(r, agora = Date.now()) {
  if (agora < new Date(r.abre).getTime()) return "em-breve";
  if (agora < new Date(r.fecha).getTime()) return "aberta";
  return "encerrada";
}

function chave(rodadaId) {
  return `escala:v1:${rodadaId}`;
}

export function lerVotos(rodadaId) {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(chave(rodadaId)) || "{}");
  } catch {
    return {};
  }
}

// Um voto por posição, e não desfaz: é a trava do mock.
export function gravarVoto(rodadaId, slotId, playerId) {
  const votos = lerVotos(rodadaId);
  if (votos[slotId]) return votos;
  const novo = { ...votos, [slotId]: playerId };
  localStorage.setItem(chave(rodadaId), JSON.stringify(novo));
  return novo;
}

export function limparVotos(rodadaId) {
  localStorage.removeItem(chave(rodadaId));
}

export function progresso(rodadaId) {
  return Object.keys(lerVotos(rodadaId)).length;
}

// Percentual dentro da posição, a partir dos totais já persistidos no banco.
export function apuracao(jogadores, posicao) {
  const doGrupo = jogadores.filter((j) => j.posicao === posicao);
  const soma = doGrupo.reduce((a, j) => a + j.votos, 0) || 1;
  return doGrupo
    .map((j) => ({ ...j, total: j.votos, pct: Math.round((j.votos / soma) * 100) }))
    .sort((a, b) => b.total - a.total);
}

export function prazo(fecha, agora = Date.now()) {
  if (!fecha) return null;
  const ms = new Date(fecha).getTime() - agora;
  if (ms <= 0) return null;
  return {
    dias: Math.floor(ms / 86400000),
    horas: Math.floor((ms / 3600000) % 24),
    min: Math.floor((ms / 60000) % 60),
    seg: Math.floor((ms / 1000) % 60),
  };
}

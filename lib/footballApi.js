// Cliente para a football-data.org, usado pelo scripts/sync-jogos.js.
// Precisa de FOOTBALL_DATA_API_KEY no .env (nunca hardcode o token).
const BASE_URL = "https://api.football-data.org/v4";

/**
 * Faz uma requisição à football-data.org.
 * @param {string} caminho ex: "/competitions/BSA/matches"
 * @param {RequestInit} options
 */
async function footballApi(caminho, options = {}) {
  const token = process.env.FOOTBALL_DATA_API_KEY;
  if (!token) {
    throw new Error("FOOTBALL_DATA_API_KEY não configurado no .env");
  }

  const res = await fetch(`${BASE_URL}${caminho}`, {
    ...options,
    headers: {
      "X-Auth-Token": token,
      ...options.headers,
    },
  });

  avisarSeProximoDoLimite(res.headers);

  if (res.status === 429) {
    const espera = res.headers.get("X-RequestCounter-Reset") || "alguns segundos";
    throw new Error(`Rate limit atingido. Tente novamente em ${espera}.`);
  }

  if (!res.ok) {
    throw new Error(`football-data.org respondeu ${res.status} em ${caminho}: ${await res.text()}`);
  }

  return res.json();
}

// A API expõe headers de throttling; avisamos antes de estourar o limite.
function avisarSeProximoDoLimite(headers) {
  const restantes = headers.get("X-Requests-Available-Minute");
  if (restantes !== null && Number(restantes) <= 2) {
    console.warn(`[footballApi] só restam ${restantes} requisições neste minuto`);
  }
}

module.exports = { footballApi };

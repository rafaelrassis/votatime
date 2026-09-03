import jogadores from "@/data/players.json";
import { HISTORICO } from "@/lib/store";

const data = (iso) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });

export default function Rodadas() {
  return (
    <main>
      <div className="bloco">
        <h2>Times que a torcida já escalou</h2>
        <p className="ajuda">Cada rodada fecha no domingo às 21h e vira registro.</p>

        {HISTORICO.map((r) => (
          <div key={r.id} style={{ margin: "22px 0" }}>
            <strong className="condensada" style={{ fontSize: 22 }}>
              Rodada {r.numero}
            </strong>{" "}
            <span style={{ color: "var(--cinza)", fontSize: 14 }}>
              fechada em {data(r.fechada)} · {r.votantes.toLocaleString("pt-BR")} votantes
            </span>
            <div className="escalacao">
              {r.escalacao.map((id) => {
                const j = jogadores.find((p) => p.id === id);
                return (
                  <span key={id}>
                    {j.numero} {j.apelido}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const data = (iso) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });

export default async function Rodadas() {
  const historico = await prisma.round.findMany({
    where: { atual: false },
    orderBy: { numero: "desc" },
  });
  const jogadores = await prisma.player.findMany();

  return (
    <main>
      <div className="bloco">
        <h2>Times que a torcida já escalou</h2>
        <p className="ajuda">Cada rodada fecha no domingo às 21h e vira registro.</p>

        {historico.map((r) => (
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

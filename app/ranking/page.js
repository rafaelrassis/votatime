import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Ranking() {
  const jogadores = await prisma.player.findMany();
  const historico = await prisma.round.findMany({ where: { atual: false } });
  const escalacoes = historico.flatMap((r) => r.escalacao);

  const lista = jogadores
    .map((j) => ({ ...j, titular: escalacoes.filter((id) => id === j.id).length }))
    .sort((a, b) => b.votos - a.votos);

  return (
    <main>
      <div className="bloco">
        <h2>Mais votados no mês</h2>
        <p className="ajuda">Soma de todas as rodadas de setembro.</p>
        <table className="tabela">
          <thead>
            <tr>
              <th></th>
              <th>Jogador</th>
              <th>Posição</th>
              <th>Rodadas como titular</th>
              <th>Votos</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((j, i) => (
              <tr key={j.id}>
                <td className="condensada" style={{ color: "var(--cinza)" }}>
                  {i + 1}
                </td>
                <td>
                  {j.numero} {j.nome}
                </td>
                <td>{j.posicao}</td>
                <td>
                  {j.titular} de {historico.length}
                </td>
                <td>{j.votos.toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { CLUBE, lerPrevisao, gravarPrevisao } from "@/lib/store";
import { buscarEscudo } from "@/lib/escudos";
import Brasao from "@/components/Brasao";

export default function PrevisaoPage() {
  const { id } = useParams();
  const [rodada, setRodada] = useState(undefined);
  const [times, setTimes] = useState([]);
  const [jogadores, setJogadores] = useState([]);
  const [previsao, setPrevisao] = useState(null);

  useEffect(() => {
    fetch("/api/rounds")
      .then((r) => r.json())
      .then((lista) => setRodada(lista.find((r) => r.id === id) || null));
    fetch("/api/teams")
      .then((r) => r.json())
      .then(setTimes);
    fetch("/api/players")
      .then((r) => r.json())
      .then(setJogadores);
  }, [id]);

  useEffect(() => {
    if (rodada) setPrevisao(lerPrevisao(rodada.id));
  }, [rodada]);

  if (rodada === undefined) return null;
  if (rodada === null) return notFound();

  const jaVotou = Boolean(previsao);
  const total = (rodada.votosCasa || 0) + (rodada.votosFora || 0) || 1;
  const pctCasa = Math.round(((rodada.votosCasa || 0) / total) * 100);
  const pctFora = 100 - pctCasa;

  const escudoAdversario = buscarEscudo(times, rodada.adversario);
  const nomeCasa = rodada.mando === "casa" ? CLUBE : rodada.adversario;
  const nomeFora = rodada.mando === "casa" ? rodada.adversario : CLUBE;
  const escudoCasa = rodada.mando === "casa" ? null : escudoAdversario;
  const escudoFora = rodada.mando === "casa" ? escudoAdversario : null;

  const top5 = [...jogadores].sort((a, b) => b.votos - a.votos).slice(0, 5);

  const quemVence =
    pctCasa === pctFora
      ? "Empate no palpite da torcida."
      : `${pctCasa > pctFora ? nomeCasa : nomeFora} na frente no palpite da torcida.`;

  async function prever(lado) {
    setPrevisao(gravarPrevisao(rodada.id, lado));
    const res = await fetch("/api/prever", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId: rodada.id, lado }),
    });
    const atualizada = await res.json();
    setRodada(atualizada);
  }

  return (
    <main>
      <div className="linha-info">
        <span>
          <Link href="/">← Rodadas</Link> · Rodada {rodada.numero} contra {rodada.adversario}
        </span>
      </div>

      <h2>Quem vence?</h2>
      <p className="ajuda">
        {jaVotou ? "Seu palpite está registrado." : "Toque num escudo pra dar seu palpite."}
      </p>

      <div className="confronto-previsao">
        <div className={`lado${previsao === "casa" ? " escolhido" : ""}`}>
          <Brasao
            nome={nomeCasa}
            escudo={escudoCasa}
            tamanho={72}
            onClick={() => !jaVotou && prever("casa")}
          />
          <span>{nomeCasa}</span>
          {jaVotou && <b>{pctCasa}%</b>}
        </div>
        <span className="x">×</span>
        <div className={`lado${previsao === "fora" ? " escolhido" : ""}`}>
          <Brasao
            nome={nomeFora}
            escudo={escudoFora}
            tamanho={72}
            onClick={() => !jaVotou && prever("fora")}
          />
          <span>{nomeFora}</span>
          {jaVotou && <b>{pctFora}%</b>}
        </div>
      </div>

      {jaVotou && (
        <>
          <div className="barras-previsao">
            <div className="barra-vertical">
              <i style={{ height: `${pctCasa}%` }} />
            </div>
            <div className="barra-vertical">
              <i style={{ height: `${pctFora}%` }} />
            </div>
          </div>
          <p className="ajuda" style={{ textAlign: "center", marginTop: -12 }}>
            {quemVence}
          </p>
        </>
      )}

      <div className="bloco">
        <h2>Mais votados do time</h2>
        <table className="tabela">
          <thead>
            <tr>
              <th></th>
              <th>Jogador</th>
              <th>Posição</th>
              <th>Votos</th>
            </tr>
          </thead>
          <tbody>
            {top5.map((j, i) => (
              <tr key={j.id}>
                <td className="condensada" style={{ color: "var(--cinza)" }}>
                  {i + 1}
                </td>
                <td>
                  {j.numero} {j.nome}
                </td>
                <td>{j.posicao}</td>
                <td>{j.votos.toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

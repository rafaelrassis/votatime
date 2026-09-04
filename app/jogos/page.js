"use client";

import { useEffect, useState } from "react";

const ROTULO_STATUS = {
  SCHEDULED: "Agendado",
  TIMED: "Agendado",
  IN_PLAY: "Ao vivo",
  PAUSED: "Ao vivo",
  LIVE: "Ao vivo",
  FINISHED: "Encerrado",
  POSTPONED: "Adiado",
  SUSPENDED: "Adiado",
  CANCELLED: "Cancelado",
};

const AO_VIVO = ["IN_PLAY", "PAUSED", "LIVE"];

const dataHora = (iso) =>
  new Date(iso).toLocaleString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function Jogos() {
  const [partidas, setPartidas] = useState(null);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => r.json())
      .then(setPartidas);
  }, []);

  if (partidas === null) return null;

  const porCompeticao = partidas.reduce((acc, p) => {
    (acc[p.competition] ||= []).push(p);
    return acc;
  }, {});

  return (
    <main>
      <p className="ajuda" style={{ margin: "14px 0 18px" }}>
        Jogos reais dos principais campeonatos, com escudos oficiais.
      </p>

      {Object.keys(porCompeticao).length === 0 && (
        <p className="ajuda">
          Nenhum jogo no banco ainda. Rode <code>npm run sync:jogos</code> pra baixar
          escudos e jogos reais (precisa de <code>FOOTBALL_DATA_API_KEY</code> no{" "}
          <code>.env</code>).
        </p>
      )}

      {Object.entries(porCompeticao).map(([competicao, lista]) => (
        <div className="bloco" key={competicao}>
          <h2>{competicao}</h2>
          <div className="jogos-lista">
            {lista.map((p) => {
              const st = ROTULO_STATUS[p.status] || p.status;
              const encerrado = p.status === "FINISHED";
              return (
                <div className="jogo-card" key={p.id}>
                  <span className={`jogo-status${AO_VIVO.includes(p.status) ? " ao-vivo" : ""}`}>
                    {st}
                  </span>
                  <div className="jogo-confronto">
                    <span className="jogo-time">
                      <img src={p.homeCrest} alt="" className="escudo" />
                      {p.homeTeam}
                    </span>
                    <span className="jogo-placar">
                      {encerrado || AO_VIVO.includes(p.status)
                        ? `${p.homeScore ?? 0} - ${p.awayScore ?? 0}`
                        : "×"}
                    </span>
                    <span className="jogo-time jogo-time-fora">
                      {p.awayTeam}
                      <img src={p.awayCrest} alt="" className="escudo" />
                    </span>
                  </div>
                  <span className="ajuda">{dataHora(p.utcDate)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </main>
  );
}

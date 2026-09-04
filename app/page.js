"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  SLOTS,
  status,
  ROTULO,
  prazo,
  progresso,
  lerPrevisao,
  gravarPrevisao,
} from "@/lib/store";
import { buscarEscudo } from "@/lib/escudos";
import Brasao from "@/components/Brasao";
import Previsao from "@/components/Previsao";

const dia = (iso) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });

const horaJogo = (iso) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export default function Home() {
  const [rodadas, setRodadas] = useState([]);
  const [feitos, setFeitos] = useState({});
  const [previsoes, setPrevisoes] = useState({});
  const [aberta, setAberta] = useState(null);
  const [times, setTimes] = useState([]);
  const [proximosJogos, setProximosJogos] = useState([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    fetch("/api/rounds")
      .then((r) => r.json())
      .then((lista) => {
        setRodadas(lista);
        setPrevisoes(Object.fromEntries(lista.map((r) => [r.id, lerPrevisao(r.id)])));
      });
    fetch("/api/teams")
      .then((r) => r.json())
      .then(setTimes);
    fetch("/api/matches")
      .then((r) => r.json())
      .then((lista) => setProximosJogos(lista.slice(0, 8)));
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setFeitos(Object.fromEntries(rodadas.map((r) => [r.id, progresso(r.id)])));
  }, [rodadas]);

  async function prever(rodadaId, lado) {
    setPrevisoes((p) => ({ ...p, [rodadaId]: gravarPrevisao(rodadaId, lado) }));
    const res = await fetch("/api/prever", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId: rodadaId, lado }),
    });
    const atualizada = await res.json();
    setRodadas((rs) => rs.map((r) => (r.id === rodadaId ? atualizada : r)));
  }

  const rodadaAberta = rodadas.find((r) => r.id === aberta);

  return (
    <main>
      {proximosJogos.length > 0 && (
        <div className="bloco" style={{ marginTop: 0 }}>
          <h2>Jogos de hoje e da semana</h2>
          <div className="jogos-tira">
            {proximosJogos.map((p) => (
              <div className="jogo-mini" key={p.id}>
                <span className="jogo-mini-comp condensada">{p.competitionCode}</span>
                <div className="jogo-mini-confronto">
                  <img src={p.homeCrest} alt={p.homeTeam} title={p.homeTeam} />
                  <span className="jogo-mini-placar">
                    {p.status === "FINISHED"
                      ? `${p.homeScore} - ${p.awayScore}`
                      : horaJogo(p.utcDate)}
                  </span>
                  <img src={p.awayCrest} alt={p.awayTeam} title={p.awayTeam} />
                </div>
              </div>
            ))}
          </div>
          <Link href="/jogos" className="ajuda" style={{ display: "inline-block", marginTop: 8 }}>
            Ver todos os jogos →
          </Link>
        </div>
      )}

      <p className="ajuda" style={{ margin: "14px 0 18px" }}>
        Toque numa rodada para escalar o time. Toque no brasão pra prever o resultado.
      </p>

      <div className="grade">
        {rodadas.map((r) => {
          const st = status(r);
          const resta = prazo(r.fecha);
          const meus = feitos[r.id] || 0;
          const escudoAdversario = buscarEscudo(times, r.adversario);
          return (
            <Link key={r.id} href={`/rodada/${r.id}`} className={`cartao ${st}`}>
              <span className="etiqueta">
                {ROTULO[st]}
                {st === "aberta" && resta && (
                  <b>
                    {" "}
                    {resta.dias}d {String(resta.horas).padStart(2, "0")}:
                    {String(resta.min).padStart(2, "0")}:
                    {String(resta.seg).padStart(2, "0")}
                  </b>
                )}
              </span>

              <span
                className="confronto condensada"
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <Brasao
                  nome={r.adversario}
                  escudo={escudoAdversario}
                  tamanho={32}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAberta(r.id);
                  }}
                />
                {r.mando === "casa" ? "Em casa contra" : "Fora contra"} {r.adversario}
              </span>

              <span className="meta">
                Rodada {r.numero} · {r.campeonato} · fecha {dia(r.fecha)}
              </span>

              <span className="rodape">
                {st === "encerrada"
                  ? `${r.votantes.toLocaleString("pt-BR")} votos · escalação definida`
                  : st === "em-breve"
                    ? "A votação ainda não abriu"
                    : meus === SLOTS.length
                      ? "Você escalou os 11"
                      : `Você votou em ${meus} de ${SLOTS.length}`}
              </span>
            </Link>
          );
        })}
      </div>

      {rodadaAberta && (
        <Previsao
          rodada={rodadaAberta}
          previsao={previsoes[rodadaAberta.id]}
          escudoAdversario={buscarEscudo(times, rodadaAberta.adversario)}
          escudoClube={null}
          aoPrever={(lado) => prever(rodadaAberta.id, lado)}
          aoFechar={() => setAberta(null)}
        />
      )}
    </main>
  );
}

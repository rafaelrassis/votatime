"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SLOTS,
  status,
  NOSSO_TIME,
  prazo,
  progresso,
  lerPrevisao,
  gravarPrevisao,
} from "@/lib/store";
import { buscarEscudo } from "@/lib/escudos";
import Brasao from "@/components/Brasao";
import Previsao from "@/components/Previsao";

const ehHoje = (iso) => {
  const d = new Date(iso);
  const hoje = new Date();
  return (
    d.getDate() === hoje.getDate() &&
    d.getMonth() === hoje.getMonth() &&
    d.getFullYear() === hoje.getFullYear()
  );
};

const dataCurta = (iso) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

const horaJogo = (iso) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export default function Home() {
  const router = useRouter();
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
        Toque no jogo pra prever o resultado. Toque no escudo pra escalar o time.
      </p>

      <div className="lista-jogos">
        {rodadas.map((r) => {
          const st = status(r);
          const resta = prazo(r.fecha);
          const meus = feitos[r.id] || 0;
          const escudoAdversario = buscarEscudo(times, r.adversario);
          const escudoNosso = buscarEscudo(times, NOSSO_TIME.nome);

          // clicar no card abre o comparativo de previsão (quem vence)
          const abrirPrevisao = () => setAberta(r.id);

          // clicar no escudo de qualquer um dos times abre a escalação (campo)
          const abrirCampo = (e) => {
            e.stopPropagation();
            router.push(`/rodada/${r.id}`);
          };

          const casa =
            r.mando === "casa"
              ? { nome: NOSSO_TIME.nome, escudo: escudoNosso }
              : { nome: r.adversario, escudo: escudoAdversario };
          const fora =
            r.mando === "fora"
              ? { nome: NOSSO_TIME.nome, escudo: escudoNosso }
              : { nome: r.adversario, escudo: escudoAdversario };

          return (
            <div
              key={r.id}
              className={`cartao-jogo ${st}`}
              role="button"
              tabIndex={0}
              onClick={abrirPrevisao}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && abrirPrevisao()}
            >
              {st === "aberta" && (
                <span className="selo-aberta">
                  Votação aberta
                  {resta && (
                    <b>
                      {" "}
                      {resta.dias}d {String(resta.horas).padStart(2, "0")}:
                      {String(resta.min).padStart(2, "0")}
                    </b>
                  )}
                </span>
              )}

              <div className="linha-jogo">
                <div className="time-jogo">
                  <Brasao nome={casa.nome} escudo={casa.escudo} tamanho={46} onClick={abrirCampo} />
                </div>

                <div className="centro-jogo">
                  <span className="horario-jogo">{horaJogo(r.fecha)}</span>
                  <span className="data-jogo">
                    {st === "em-breve" ? "Em breve" : ehHoje(r.fecha) ? "Hoje" : dataCurta(r.fecha)}
                  </span>
                </div>

                <div className="time-jogo">
                  <Brasao nome={fora.nome} escudo={fora.escudo} tamanho={46} onClick={abrirCampo} />
                </div>
              </div>

              <span className="rodape-jogo">
                {st === "encerrada"
                  ? `${r.votantes.toLocaleString("pt-BR")} votos · escalação definida`
                  : st === "em-breve"
                    ? "A votação ainda não abriu"
                    : meus === SLOTS.length
                      ? "Você escalou os 11"
                      : `Você votou em ${meus} de ${SLOTS.length}`}
              </span>
            </div>
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

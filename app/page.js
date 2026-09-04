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
import Brasao from "@/components/Brasao";
import Previsao from "@/components/Previsao";

const dia = (iso) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });

export default function Home() {
  const [rodadas, setRodadas] = useState([]);
  const [feitos, setFeitos] = useState({});
  const [previsoes, setPrevisoes] = useState({});
  const [aberta, setAberta] = useState(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    fetch("/api/rounds")
      .then((r) => r.json())
      .then((lista) => {
        setRodadas(lista);
        setPrevisoes(Object.fromEntries(lista.map((r) => [r.id, lerPrevisao(r.id)])));
      });
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
      <p className="ajuda" style={{ margin: "14px 0 18px" }}>
        Toque numa rodada para escalar o time. Toque no brasão pra prever o resultado.
      </p>

      <div className="grade">
        {rodadas.map((r) => {
          const st = status(r);
          const resta = prazo(r.fecha);
          const meus = feitos[r.id] || 0;
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
          aoPrever={(lado) => prever(rodadaAberta.id, lado)}
          aoFechar={() => setAberta(null)}
        />
      )}
    </main>
  );
}

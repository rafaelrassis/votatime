"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { SLOTS, status, lerVotos, gravarVoto, limparVotos, prazo } from "@/lib/store";
import Campo from "@/components/Campo";
import Votacao from "@/components/Votacao";

export default function Rodada() {
  const { id } = useParams();
  const [rodada, setRodada] = useState(undefined);
  const [jogadores, setJogadores] = useState([]);
  const [votos, setVotos] = useState({});
  const [aberto, setAberto] = useState(null);
  const [resta, setResta] = useState(null);

  useEffect(() => {
    fetch("/api/rounds")
      .then((r) => r.json())
      .then((lista) => setRodada(lista.find((r) => r.id === id) || null));
    fetch("/api/players")
      .then((r) => r.json())
      .then(setJogadores);
  }, [id]);

  useEffect(() => {
    if (rodada) setVotos(lerVotos(rodada.id));
  }, [rodada]);

  useEffect(() => {
    if (!rodada) return;
    const t = setInterval(() => setResta(prazo(rodada.fecha)), 1000);
    setResta(prazo(rodada.fecha));
    return () => clearInterval(t);
  }, [rodada]);

  if (rodada === undefined) return null;
  if (rodada === null) return notFound();

  const st = status(rodada);
  const fechada = st === "encerrada";
  const naoAbriu = st === "em-breve";
  const feitos = Object.keys(votos).length;

  // rodada encerrada: mostra a escalação vencedora no lugar dos votos
  const noCampo = fechada
    ? Object.fromEntries(SLOTS.map((s, i) => [s.id, rodada.escalacao[i]]))
    : votos;

  async function votar(slotId, playerId) {
    setVotos(gravarVoto(rodada.id, slotId, playerId));
    setJogadores((atual) =>
      atual.map((j) => (j.id === playerId ? { ...j, votos: j.votos + 1 } : j))
    );
    await fetch("/api/votar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
  }

  return (
    <main>
      <div className="linha-info">
        <span>
          <Link href="/">← Rodadas</Link> · Rodada {rodada.numero} contra {rodada.adversario}
        </span>
        <span className="relogio">
          {naoAbriu
            ? "abre em breve"
            : resta
              ? `${resta.dias}d ${String(resta.horas).padStart(2, "0")}:${String(resta.min).padStart(2, "0")}:${String(resta.seg).padStart(2, "0")}`
              : "encerrada"}
        </span>
      </div>

      <Campo
        jogadores={jogadores}
        votos={noCampo}
        aoClicar={(slot) => !naoAbriu && setAberto(slot)}
      />

      <div className="progresso">
        {fechada ? (
          <span>
            Time escolhido por {rodada.votantes.toLocaleString("pt-BR")} pessoas.
          </span>
        ) : naoAbriu ? (
          <span>
            A votação abre em{" "}
            {new Date(rodada.abre).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
            })}
            .
          </span>
        ) : (
          <>
            <span className="condensada">
              {feitos} de {SLOTS.length}
            </span>
            <span className="barra">
              <i style={{ width: `${(feitos / SLOTS.length) * 100}%` }} />
            </span>
            <span>
              {feitos === SLOTS.length
                ? "Escalação completa."
                : "Toque numa posição vazia"}
            </span>
            {feitos > 0 && (
              <button
                className="limpar"
                onClick={() => {
                  limparVotos(rodada.id);
                  setVotos({});
                }}
              >
                recomeçar (mock)
              </button>
            )}
          </>
        )}
      </div>

      {aberto && (
        <Votacao
          slot={aberto}
          jogadores={jogadores}
          votos={noCampo}
          somenteLeitura={fechada}
          aoVotar={votar}
          aoFechar={() => setAberto(null)}
        />
      )}
    </main>
  );
}

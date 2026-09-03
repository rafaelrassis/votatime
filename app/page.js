"use client";

import { useEffect, useState } from "react";
import { SLOTS, lerVotos, gravarVoto, limparVotos, prazo } from "@/lib/store";
import Campo from "@/components/Campo";
import Votacao from "@/components/Votacao";

export default function Home() {
  const [rodada, setRodada] = useState(null);
  const [jogadores, setJogadores] = useState([]);
  const [votos, setVotos] = useState({});
  const [aberto, setAberto] = useState(null);
  const [resta, setResta] = useState(null);

  useEffect(() => {
    fetch("/api/rounds")
      .then((r) => r.json())
      .then((d) => setRodada(d.atual));
    fetch("/api/players")
      .then((r) => r.json())
      .then(setJogadores);
  }, []);

  useEffect(() => {
    if (rodada) setVotos(lerVotos(rodada.id));
  }, [rodada]);

  useEffect(() => {
    if (!rodada) return;
    const tick = () => setResta(prazo(rodada.fecha));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [rodada]);

  if (!rodada) return null;

  const feitos = Object.keys(votos).length;

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
          Rodada {rodada.numero} · {rodada.votantes.toLocaleString("pt-BR")} pessoas votando
        </span>
        <span className="relogio">
          {resta
            ? `${resta.dias}d ${String(resta.horas).padStart(2, "0")}:${String(resta.min).padStart(2, "0")}:${String(resta.seg).padStart(2, "0")}`
            : "votação encerrada"}
        </span>
      </div>

      <Campo jogadores={jogadores} votos={votos} aoClicar={setAberto} />

      <div className="progresso">
        <span className="condensada">
          {feitos} de {SLOTS.length}
        </span>
        <span className="barra">
          <i style={{ width: `${(feitos / SLOTS.length) * 100}%` }} />
        </span>
        {feitos === SLOTS.length ? (
          <span>Escalação completa. Volte quando a rodada fechar.</span>
        ) : (
          <span>Toque numa posição vazia</span>
        )}
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
      </div>

      {aberto && (
        <Votacao
          slot={aberto}
          jogadores={jogadores}
          votos={votos}
          aoVotar={votar}
          aoFechar={() => setAberto(null)}
        />
      )}
    </main>
  );
}

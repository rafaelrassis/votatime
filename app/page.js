"use client";

import { useEffect, useState } from "react";
import jogadores from "@/data/players.json";
import { RODADA, SLOTS, lerVotos, gravarVoto, limparVotos, prazo } from "@/lib/store";
import Campo from "@/components/Campo";
import Votacao from "@/components/Votacao";

export default function Home() {
  const [votos, setVotos] = useState({});
  const [aberto, setAberto] = useState(null);
  const [resta, setResta] = useState(null);

  useEffect(() => setVotos(lerVotos()), []);

  useEffect(() => {
    const tick = () => setResta(prazo(RODADA.fecha));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const feitos = Object.keys(votos).length;

  function votar(slotId, playerId) {
    setVotos(gravarVoto(slotId, playerId));
  }

  return (
    <main>
      <div className="linha-info">
        <span>
          Rodada {RODADA.numero} · {RODADA.votantes.toLocaleString("pt-BR")} pessoas votando
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
              limparVotos();
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

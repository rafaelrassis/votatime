"use client";

import { useEffect, useRef } from "react";
import { apuracao } from "@/lib/store";

export default function Votacao({ slot, jogadores, votos, aoVotar, aoFechar }) {
  const caixa = useRef(null);
  const jaVotou = Boolean(votos[slot.id]);
  const lista = apuracao(jogadores, slot.posicao, votos);

  // usados em outras posições do mesmo grupo (ex: os dois zagueiros)
  const ocupados = Object.entries(votos)
    .filter(([id]) => id !== slot.id)
    .map(([, pid]) => pid);

  useEffect(() => {
    caixa.current?.focus();
    const esc = (e) => e.key === "Escape" && aoFechar();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [aoFechar]);

  return (
    <div className="fundo" onClick={aoFechar}>
      <div
        className="painel"
        role="dialog"
        aria-modal="true"
        aria-label={slot.rotulo}
        tabIndex={-1}
        ref={caixa}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{slot.rotulo}</h2>
        <p className="ajuda">
          {jaVotou
            ? "Seu voto está registrado. Veja como a torcida está votando nesta posição."
            : "Escolha um nome. O voto vale só para esta posição e não dá pra trocar depois."}
        </p>

        {lista.map((j) => {
          const meu = votos[slot.id] === j.id;
          const emOutraPosicao = ocupados.includes(j.id);
          const travado = jaVotou || emOutraPosicao;
          return (
            <button
              key={j.id}
              type="button"
              className={`opcao${meu ? " escolhido" : ""}`}
              disabled={travado}
              onClick={() => aoVotar(slot.id, j.id)}
            >
              {jaVotou && <i className="fatia" style={{ width: `${j.pct}%` }} />}
              <span className="num">{j.numero}</span>
              <span className="quem">
                {j.nome}
                <small>
                  {emOutraPosicao && !meu
                    ? "já escalado em outra posição"
                    : `${j.total.toLocaleString("pt-BR")} votos`}
                </small>
              </span>
              {jaVotou && <span className="pct">{j.pct}%</span>}
            </button>
          );
        })}

        <button type="button" className="fechar" onClick={aoFechar}>
          Voltar ao campo
        </button>
      </div>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import Brasao from "@/components/Brasao";
import { CLUBE } from "@/lib/store";

export default function Previsao({ rodada, previsao, escudoClube, escudoAdversario, aoPrever, aoFechar }) {
  const [arrastoX, setArrastoX] = useState(0);
  const inicio = useRef(null);
  const jaVotou = Boolean(previsao);

  const total = (rodada.votosCasa || 0) + (rodada.votosFora || 0) || 1;
  const pctCasa = Math.round(((rodada.votosCasa || 0) / total) * 100);
  const pctFora = 100 - pctCasa;

  const nomeCasa = rodada.mando === "casa" ? CLUBE : rodada.adversario;
  const nomeFora = rodada.mando === "casa" ? rodada.adversario : CLUBE;
  const escudoCasa = rodada.mando === "casa" ? escudoClube : escudoAdversario;
  const escudoFora = rodada.mando === "casa" ? escudoAdversario : escudoClube;

  function onTouchStart(e) {
    inicio.current = e.touches[0].clientX;
  }
  function onTouchMove(e) {
    if (inicio.current == null) return;
    setArrastoX(e.touches[0].clientX - inicio.current);
  }
  function onTouchEnd() {
    if (!jaVotou) {
      if (arrastoX > 60) aoPrever("casa");
      else if (arrastoX < -60) aoPrever("fora");
    }
    setArrastoX(0);
    inicio.current = null;
  }

  return (
    <div className="fundo" onClick={aoFechar}>
      <div className="painel" onClick={(e) => e.stopPropagation()}>
        <h2>Quem vence?</h2>
        <p className="ajuda">
          {jaVotou ? "Seu palpite está registrado." : "Toque num brasão ou arraste pro lado."}
        </p>

        <div
          className="confronto-previsao"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ transform: `translateX(${jaVotou ? 0 : arrastoX * 0.2}px)` }}
        >
          <div className={`lado${previsao === "casa" ? " escolhido" : ""}`}>
            <Brasao
              nome={nomeCasa}
              escudo={escudoCasa}
              tamanho={72}
              onClick={() => !jaVotou && aoPrever("casa")}
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
              onClick={() => !jaVotou && aoPrever("fora")}
            />
            <span>{nomeFora}</span>
            {jaVotou && <b>{pctFora}%</b>}
          </div>
        </div>

        {jaVotou && (
          <div className="barra-previsao">
            <i style={{ width: `${pctCasa}%` }} />
          </div>
        )}

        <button type="button" className="fechar" onClick={aoFechar}>
          Voltar
        </button>
      </div>
    </div>
  );
}

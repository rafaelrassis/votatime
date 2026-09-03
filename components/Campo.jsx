"use client";

import { SLOTS } from "@/lib/store";

export default function Campo({ jogadores, votos, aoClicar }) {
  return (
    <div className="campo">
      {SLOTS.map((slot) => {
        const escolhido = jogadores.find((j) => j.id === votos[slot.id]);
        return (
          <button
            key={slot.id}
            type="button"
            className={`slot${escolhido ? " preenchido" : ""}`}
            style={{ left: `${slot.x}%`, bottom: `${slot.y}%` }}
            onClick={() => aoClicar(slot)}
            aria-label={
              escolhido
                ? `${slot.rotulo}: ${escolhido.apelido}. Ver apuração`
                : `${slot.rotulo}: votar`
            }
          >
            <span className="camisa" aria-hidden="true">
              {escolhido ? escolhido.numero : "+"}
            </span>
            <span className="nome-slot">
              {escolhido ? <b>{escolhido.apelido}</b> : slot.rotulo}
            </span>
          </button>
        );
      })}
    </div>
  );
}

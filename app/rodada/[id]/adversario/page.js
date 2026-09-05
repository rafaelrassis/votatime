"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { SLOTS, status, lerVotos, gravarVoto, limparVotos, prazo, mapPosicao } from "@/lib/store";
import { buscarTimeId } from "@/lib/escudos";
import Campo from "@/components/Campo";
import Votacao from "@/components/Votacao";

const NAMESPACE = "adversario";

export default function EscalacaoAdversario() {
  const { id } = useParams();
  const [rodada, setRodada] = useState(undefined);
  const [times, setTimes] = useState([]);
  const [squad, setSquad] = useState(null);
  const [votos, setVotos] = useState({});
  const [aberto, setAberto] = useState(null);
  const [resta, setResta] = useState(null);

  useEffect(() => {
    fetch("/api/rounds")
      .then((r) => r.json())
      .then((lista) => setRodada(lista.find((r) => r.id === id) || null));
    fetch("/api/teams")
      .then((r) => r.json())
      .then(setTimes);
  }, [id]);

  const timeId = rodada ? buscarTimeId(times, rodada.adversario) : null;

  useEffect(() => {
    if (!timeId) return;
    fetch(`/api/squad?time=${timeId}`)
      .then((r) => r.json())
      .then((lista) => setSquad(lista.map((j) => ({ ...j, posicao: mapPosicao(j.posicao) }))))
      .catch(() => setSquad([]));
  }, [timeId]);

  useEffect(() => {
    if (rodada) setVotos(lerVotos(rodada.id, NAMESPACE));
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
  const jogadores = squad || [];
  const feitos = Object.keys(votos).length;

  // rodada encerrada com escalação final cadastrada: mostra ela no campo
  // no lugar do palpite (mesmo esquema do nosso time, mas com nome/número
  // direto — não temos um "elenco oficial" real do adversário pra linkar).
  const revelado = fechada && rodada.escalacaoAdversario?.length === SLOTS.length;
  const jogadoresRevelados = revelado
    ? rodada.escalacaoAdversario.map((j, i) => ({
        id: `rev-${i}`,
        nome: j.nome,
        apelido: j.nome,
        numero: j.numero,
        posicao: SLOTS[i].posicao,
        votos: 0,
      }))
    : null;
  const votosRevelados = revelado
    ? Object.fromEntries(SLOTS.map((s, i) => [s.id, `rev-${i}`]))
    : null;

  async function votar(slotId, playerId) {
    setVotos(gravarVoto(rodada.id, slotId, playerId, NAMESPACE));
    await fetch("/api/votar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
    setSquad((atual) =>
      atual.map((j) => (j.id === playerId ? { ...j, votos: j.votos + 1 } : j))
    );
  }

  return (
    <main>
      <div className="linha-info">
        <span>
          <Link href={`/previsao/${rodada.id}`}>← Previsão</Link> · Escalação do{" "}
          {rodada.adversario} (palpite da torcida)
        </span>
        <span className="relogio">
          {naoAbriu
            ? "abre em breve"
            : resta
              ? `${resta.dias}d ${String(resta.horas).padStart(2, "0")}:${String(resta.min).padStart(2, "0")}:${String(resta.seg).padStart(2, "0")}`
              : "encerrada"}
        </span>
      </div>

      {revelado ? (
        <Campo jogadores={jogadoresRevelados} votos={votosRevelados} aoClicar={setAberto} />
      ) : squad === null ? (
        <p className="ajuda">Carregando elenco…</p>
      ) : jogadores.length === 0 ? (
        <p className="ajuda">Elenco indisponível pra esse time.</p>
      ) : (
        <Campo
          jogadores={jogadores}
          votos={votos}
          aoClicar={(slot) => !naoAbriu && setAberto(slot)}
        />
      )}

      {(revelado || jogadores.length > 0) && (
        <div className="progresso">
          {naoAbriu ? (
            <span>
              A votação abre em{" "}
              {new Date(rodada.abre).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
              })}
              .
            </span>
          ) : revelado ? (
            <span>
              Time escolhido por {rodada.votantes.toLocaleString("pt-BR")} pessoas.
            </span>
          ) : (
            <>
              <span className="condensada">{feitos} de 11</span>
              <span className="barra">
                <i style={{ width: `${(feitos / 11) * 100}%` }} />
              </span>
              <span>
                {feitos === 11
                  ? "Palpite completo."
                  : fechada
                    ? "Rodada encerrada — veja como a torcida palpitou."
                    : "Toque numa posição vazia"}
              </span>
              {feitos > 0 && !fechada && (
                <button
                  className="limpar"
                  onClick={() => {
                    limparVotos(rodada.id, NAMESPACE);
                    setVotos({});
                  }}
                >
                  recomeçar (mock)
                </button>
              )}
            </>
          )}
        </div>
      )}

      {aberto && (
        <Votacao
          slot={aberto}
          jogadores={revelado ? jogadoresRevelados : jogadores}
          votos={revelado ? votosRevelados : votos}
          somenteLeitura={fechada}
          aoVotar={votar}
          aoFechar={() => setAberto(null)}
        />
      )}
    </main>
  );
}

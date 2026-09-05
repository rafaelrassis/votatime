"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import { NOSSO_TIME, lerPrevisao, gravarPrevisao } from "@/lib/store";
import { buscarEscudo, buscarTimeId } from "@/lib/escudos";
import Brasao from "@/components/Brasao";

export default function PrevisaoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [rodada, setRodada] = useState(undefined);
  const [times, setTimes] = useState([]);
  const [squadCasa, setSquadCasa] = useState(null);
  const [squadFora, setSquadFora] = useState(null);
  const [previsao, setPrevisao] = useState(null);

  useEffect(() => {
    fetch("/api/rounds")
      .then((r) => r.json())
      .then((lista) => setRodada(lista.find((r) => r.id === id) || null));
    fetch("/api/teams")
      .then((r) => r.json())
      .then(setTimes);
  }, [id]);

  useEffect(() => {
    if (rodada) setPrevisao(lerPrevisao(rodada.id));
  }, [rodada]);

  const timeCasaId = rodada
    ? buscarTimeId(times, rodada.mando === "casa" ? NOSSO_TIME.nome : rodada.adversario)
    : null;
  const timeForaId = rodada
    ? buscarTimeId(times, rodada.mando === "casa" ? rodada.adversario : NOSSO_TIME.nome)
    : null;

  useEffect(() => {
    if (!timeCasaId) return;
    setSquadCasa(null);
    fetch(`/api/squad?time=${timeCasaId}`)
      .then((r) => r.json())
      .then(setSquadCasa)
      .catch(() => setSquadCasa([]));
  }, [timeCasaId]);

  useEffect(() => {
    if (!timeForaId) return;
    setSquadFora(null);
    fetch(`/api/squad?time=${timeForaId}`)
      .then((r) => r.json())
      .then(setSquadFora)
      .catch(() => setSquadFora([]));
  }, [timeForaId]);

  if (rodada === undefined) return null;
  if (rodada === null) return notFound();

  const jaVotou = Boolean(previsao);
  const total = (rodada.votosCasa || 0) + (rodada.votosFora || 0) || 1;
  const pctCasa = Math.round(((rodada.votosCasa || 0) / total) * 100);
  const pctFora = 100 - pctCasa;

  const nomeCasa = rodada.mando === "casa" ? NOSSO_TIME.nome : rodada.adversario;
  const nomeFora = rodada.mando === "casa" ? rodada.adversario : NOSSO_TIME.nome;
  const escudoCasa = buscarEscudo(times, nomeCasa);
  const escudoFora = buscarEscudo(times, nomeFora);

  const top5 = (squad) => [...(squad || [])].sort((a, b) => b.votos - a.votos).slice(0, 5);

  const quemVence =
    pctCasa === pctFora
      ? "Empate no palpite da torcida."
      : `${pctCasa > pctFora ? nomeCasa : nomeFora} na frente no palpite da torcida.`;

  async function prever(lado) {
    setPrevisao(gravarPrevisao(rodada.id, lado));
    const res = await fetch("/api/prever", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId: rodada.id, lado }),
    });
    const atualizada = await res.json();
    setRodada(atualizada);
  }

  // antes do palpite, clicar no escudo registra o "quem vence"; depois,
  // leva pra escalação (a nossa ou o palpite na do adversário).
  function aoClicarEscudo(lado) {
    if (!jaVotou) return prever(lado);
    router.push(lado === rodada.mando ? `/rodada/${rodada.id}` : `/rodada/${rodada.id}/adversario`);
  }

  return (
    <main>
      <div className="linha-info">
        <span>
          <Link href="/">← Rodadas</Link> · Rodada {rodada.numero} contra {rodada.adversario}
        </span>
      </div>

      <h2>Quem vence?</h2>
      <p className="ajuda">
        {jaVotou
          ? "Seu palpite está registrado. Toque num escudo pra ver a escalação."
          : "Toque num escudo pra dar seu palpite."}
      </p>

      <div className="confronto-previsao">
        <div className={`lado${previsao === "casa" ? " escolhido" : ""}`}>
          <Brasao
            nome={nomeCasa}
            escudo={escudoCasa}
            tamanho={72}
            onClick={() => aoClicarEscudo("casa")}
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
            onClick={() => aoClicarEscudo("fora")}
          />
          <span>{nomeFora}</span>
          {jaVotou && <b>{pctFora}%</b>}
        </div>
      </div>

      {jaVotou && (
        <>
          <div className="divisao-previsao">
            <span className="casa" style={{ width: `${pctCasa}%` }} />
            <span className="fora" style={{ width: `${pctFora}%` }} />
          </div>
          <p className="ajuda" style={{ textAlign: "center", marginTop: -12 }}>{quemVence}</p>
        </>
      )}

      <div className="elencos-previsao">
        <div>
          <h3>{nomeCasa}</h3>
          <Elenco squad={squadCasa} lista={top5(squadCasa)} />
        </div>
        <div>
          <h3>{nomeFora}</h3>
          <Elenco squad={squadFora} lista={top5(squadFora)} />
        </div>
      </div>
    </main>
  );
}

function Elenco({ squad, lista }) {
  if (squad === null) return <p className="ajuda">Carregando elenco…</p>;
  if (lista.length === 0) return <p className="ajuda">Elenco indisponível.</p>;
  return (
    <ol>
      {lista.map((j) => (
        <li key={j.id}>
          <span>
            {j.numero > 0 ? `${j.numero} ` : ""}
            {j.apelido || j.nome}
          </span>
          <b>{j.votos > 0 ? j.votos.toLocaleString("pt-BR") : j.posicao}</b>
        </li>
      ))}
    </ol>
  );
}

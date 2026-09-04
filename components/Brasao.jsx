function corDe(nome) {
  let h = 0;
  for (const c of nome) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `hsl(${h}, 45%, 32%)`;
}

function iniciais(nome) {
  return nome
    .split(" ")
    .filter((p) => p.length > 2 || p === p.toUpperCase())
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

// Mostra o escudo real (quando sincronizado via npm run sync:jogos);
// sem escudo, cai no círculo com iniciais coloridas de sempre.
export default function Brasao({ nome, escudo, tamanho = 48, onClick }) {
  if (escudo) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="brasao brasao-img"
        style={{ width: tamanho, height: tamanho }}
        aria-label={nome}
      >
        <img src={escudo} alt="" width={tamanho} height={tamanho} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="brasao"
      style={{
        width: tamanho,
        height: tamanho,
        background: corDe(nome),
        fontSize: tamanho * 0.36,
      }}
      aria-label={nome}
    >
      {iniciais(nome)}
    </button>
  );
}

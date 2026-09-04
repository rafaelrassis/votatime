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

export default function Brasao({ nome, tamanho = 48, onClick }) {
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

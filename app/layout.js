import "./globals.css";
import { Barlow_Condensed, Inter } from "next/font/google";

const titulo = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--fonte-titulo",
});

const texto = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--fonte-texto",
});

export const metadata = {
  title: "Escala — o time é da torcida",
  description: "A torcida vota posição por posição e escala o time da rodada.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${titulo.variable} ${texto.variable}`}>
      <body>
        <div className="casca">
          <header className="topo">
            <h1 className="marca">
              Es<span>cala</span>
            </h1>
            <nav className="menu">
              <a href="/">Rodadas</a>
              <a href="/jogos">Jogos</a>
              <a href="/ranking">Ranking</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

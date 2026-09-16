import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Laboratório de Decisão de Crédito", template: "%s · Decisão de Crédito" },
  description: "Plataforma do curso de modelagem de risco de crédito do Prof. Genaro Dueire Lins.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#00205B" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a href="#conteudo" className="skip-link">Ir para o conteúdo</a>
        {children}
      </body>
    </html>
  );
}

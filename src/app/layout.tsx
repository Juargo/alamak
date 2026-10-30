import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alamak · Diario de ranked",
  description:
    "Diario de ranked en español para League of Legends: anota cómo te sentiste después de cada partida y descubre tus patrones.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="mx-auto flex w-full max-w-[1200px] items-center gap-8 px-4 py-6 md:px-8">
          <Link href="/" className="font-display text-titulo-l font-bold text-marca-texto">
            alamak
          </Link>
          <nav className="ml-auto hidden gap-8 text-etiqueta-m font-semibold text-texto-secundario md:flex">
            <Link href="/#como-funciona">Cómo funciona</Link>
            <Link href="/#privacidad">Privacidad</Link>
          </nav>
        </header>
        {children}
        <footer className="border-t border-borde-defecto">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 pt-6 pb-8 text-nota font-medium text-texto-secundario md:flex-row md:items-start md:gap-6 md:px-8">
            {/* Riot's required legal notice, in full (the design shortens it). */}
            <p className="max-w-2xl">
              Alamak no está respaldado por Riot Games y no refleja las opiniones de Riot Games ni
              de nadie involucrado oficialmente en la producción o gestión de League of Legends.
              League of Legends y Riot Games son marcas comerciales o marcas registradas de Riot
              Games, Inc.
            </p>
            <Link href="/privacidad" className="shrink-0 md:ml-auto">
              Política de privacidad
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
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
        {children}
        <footer className="mx-auto w-full max-w-2xl px-4 py-6 text-sm opacity-70">
          Alamak no está respaldado por Riot Games y no refleja las opiniones de Riot Games ni de
          nadie involucrado oficialmente en la producción o gestión de League of Legends. League of
          Legends y Riot Games son marcas comerciales o marcas registradas de Riot Games, Inc.
        </footer>
      </body>
    </html>
  );
}

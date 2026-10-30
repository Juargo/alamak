import { Suspense } from "react";
import { WaitlistFormSkeleton, WaitlistFormWithRegion } from "./_components/waitlist-section";

const container = "mx-auto w-full max-w-[1200px] px-4 md:px-8";

const STEPS = [
  {
    title: "Juegas tu ranked como siempre",
    body: "Traemos tus partidas desde Riot. No instalas nada.",
  },
  { title: "Anotas en 30 segundos", body: "Tu ánimo y un par de tags. Escribir es opcional." },
  {
    title: "El lunes ves qué te cuesta LP",
    body: "Cada hallazgo trae su cifra y cuántas partidas lo respaldan.",
  },
];

const PRIVACY_PROMISES = [
  {
    icon: "/icons/lock.svg",
    title: "No vendemos ni compartimos tus datos",
    body: "Sin anuncios basados en lo que anotas.",
  },
  {
    icon: "/icons/eye.svg",
    title: "No entrenamos IA con tus notas",
    body: "Salvo que lo aceptes en Ajustes. Viene desactivado.",
  },
  {
    icon: "/icons/trash.svg",
    title: "Exportas o borras todo cuando quieras",
    body: "Desde Ajustes, en cualquier plan.",
  },
];

export default function Home() {
  return (
    <main id="inicio" className="flex flex-1 flex-col">
      <section
        className={`${container} flex flex-col gap-10 pt-6 pb-16 md:flex-row md:items-center md:gap-20 md:pt-18 md:pb-24`}
      >
        <div className="flex flex-1 flex-col items-start gap-6">
          <p className="rounded-full bg-fondo-marca-suave px-3 py-1.5 text-etiqueta-s font-medium text-marca-texto">
            Para ranked de LAS, LAN y EUW
          </p>
          <h1 className="font-display text-display-numero font-bold">¿Qué te está costando LP?</h1>
          <p className="text-cuerpo-l text-texto-secundario">
            Alamak es un diario de ranked: 30 segundos después de cada partida y, cada lunes, el
            hábito que más te cuesta. Con tus partidas oficiales y tus propias notas.
          </p>
          <a
            href="#lista-de-espera"
            className="flex h-11 w-full items-center justify-center rounded-md bg-marca-principal px-4.5 text-etiqueta-m font-semibold text-texto-sobre-marca md:w-auto"
          >
            Unirme a la lista de espera
          </a>
          <p className="text-cuerpo-s text-texto-secundario">
            Te avisamos cuando empiece la beta. Solo usamos datos oficiales de Riot.
          </p>
        </div>
        <FindingExample />
      </section>

      <section id="como-funciona" className="bg-fondo-superficie py-12 md:py-20">
        <div className={`${container} flex flex-col gap-6 md:gap-10`}>
          <h2 className="font-display text-titulo-l font-bold md:text-display-titulo">
            Cómo funciona
          </h2>
          <ol className="flex flex-col gap-5 md:flex-row md:gap-6">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="flex flex-1 gap-3 md:flex-col md:rounded-lg md:border md:border-borde-defecto md:bg-fondo-base md:p-7"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-fondo-marca-suave text-etiqueta-m font-semibold text-marca-texto">
                  {index + 1}
                </span>
                <div className="flex flex-col gap-1 md:gap-3">
                  <h3 className="text-titulo-s font-semibold">{step.title}</h3>
                  <p className="text-cuerpo-m text-texto-secundario">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="privacidad"
        className={`${container} flex flex-col gap-6 py-12 md:flex-row md:gap-20 md:py-20`}
      >
        <div className="flex flex-col gap-4 md:w-[420px]">
          <h2 className="font-display text-titulo-l font-bold md:text-display-titulo">
            Tus notas son tuyas
          </h2>
          <p className="text-cuerpo-l text-texto-secundario">
            Lo que escribes después de una derrota es personal. Por eso te explicamos cómo lo
            cuidamos antes de pedirte la primera nota.
          </p>
        </div>
        <ul className="flex flex-1 flex-col gap-4">
          {PRIVACY_PROMISES.map((promise) => (
            <li
              key={promise.title}
              className="flex items-center gap-4 rounded-lg border border-borde-defecto bg-fondo-superficie p-5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-fondo-marca-suave">
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative 24 px icon */}
                <img src={promise.icon} alt="" width={24} height={24} />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-titulo-s font-semibold">{promise.title}</h3>
                <p className="text-cuerpo-m text-texto-secundario">{promise.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="lista-de-espera" className={`${container} scroll-mt-6 pb-16 md:pb-24`}>
        <div className="flex flex-col gap-6 rounded-xl bg-fondo-marca-suave p-5 md:flex-row md:items-center md:gap-14 md:px-14 md:py-12">
          <div className="flex flex-1 flex-col gap-3">
            <h2 className="font-display text-titulo-l font-bold md:text-display-titulo">
              Únete a la lista de espera
            </h2>
            <p className="text-cuerpo-l text-texto-secundario">
              Te avisamos cuando empiece la beta. Es gratis y solo te escribimos para eso.
            </p>
          </div>
          <Suspense fallback={<WaitlistFormSkeleton />}>
            <WaitlistFormWithRegion />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

/** Illustrative finding with made-up numbers, labeled "Ejemplo". */
function FindingExample() {
  const rows = [
    { label: "Después de 2 derrotas", percent: 29, bar: "bg-estado-derrota" },
    { label: "En el resto", percent: 57, bar: "bg-marca-principal" },
  ];
  return (
    <figure className="flex w-full flex-col gap-4 rounded-lg border border-borde-defecto bg-fondo-superficie p-5 shadow-elevada md:w-[500px] md:p-7">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-fondo-marca-suave py-1 pr-2.5 pl-2 text-etiqueta-s font-medium text-marca-texto">
          <span aria-hidden="true" className="flex items-end gap-0.5">
            <span className="h-1.5 w-[3px] rounded-[1px] bg-marca-texto" />
            <span className="h-[9px] w-[3px] rounded-[1px] bg-marca-texto" />
            <span className="h-3 w-[3px] rounded-[1px] bg-marca-texto" />
          </span>
          Patrón
        </span>
        <span className="text-nota font-medium text-texto-secundario">Ejemplo</span>
      </div>
      <p className="font-display text-titulo-m font-medium">
        Después de 2 derrotas seguidas ganas menos
      </p>
      <p className="text-cuerpo-m text-texto-secundario">
        Ganaste 6 de 21 partidas después de 2 derrotas seguidas (29%). En el resto, 28 de 49 (57%).
      </p>
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <span className="w-[170px] shrink-0 text-cuerpo-s text-texto-secundario">
              {row.label}
            </span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-borde-defecto">
              <span
                className={`block h-full rounded-full ${row.bar}`}
                style={{ width: `${row.percent}%` }}
              />
            </span>
            <span className="text-etiqueta-m font-semibold">{row.percent}%</span>
          </div>
        ))}
      </div>
      <figcaption className="text-nota font-medium text-texto-secundario">
        Últimos 30 días · 70 partidas · 28 puntos de diferencia
      </figcaption>
    </figure>
  );
}

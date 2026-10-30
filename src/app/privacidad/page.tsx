import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Política de privacidad · Alamak",
  description: "Qué datos guarda Alamak, para qué y cómo puedes pedir que los borremos.",
};

// Bump the version and date on every change to the policy text.
const POLICY_VERSION = "0.1";
const POLICY_DATE = "30 de octubre de 2026";
const CONTACT_EMAIL = "jorgeretamal.jjr@gmail.com";

const PROCESSORS = [
  { name: "Vercel", role: "Aloja la web", location: "Estados Unidos" },
  { name: "Neon", role: "Base de datos con la lista de espera", location: "Estados Unidos" },
  { name: "Resend", role: "Envía el correo de confirmación", location: "Estados Unidos" },
  {
    name: "PostHog",
    role: "Cuenta visitas e inscripciones, sin cookies y sin tu correo",
    location: "Unión Europea",
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="mx-auto flex w-full max-w-[760px] flex-1 flex-col gap-10 px-4 pt-6 pb-16 md:px-8 md:pt-12 md:pb-24">
      <header className="flex flex-col gap-4">
        <p
          role="note"
          className="self-start rounded-full bg-fondo-marca-suave px-3 py-1.5 text-etiqueta-s font-medium text-marca-texto"
        >
          Borrador pendiente de revisión legal
        </p>
        <h1 className="font-display text-titulo-l font-bold md:text-display-titulo">
          Política de privacidad
        </h1>
        <p className="text-cuerpo-s text-texto-secundario">
          Versión {POLICY_VERSION} · {POLICY_DATE}
        </p>
        <p className="text-cuerpo-l text-texto-secundario">
          Alamak todavía no está abierto. Por ahora solo guardamos lo necesario para avisarte cuando
          empiece la beta. Aquí te contamos qué es, para qué lo usamos y cómo pedir que lo borremos.
        </p>
      </header>

      <Section title="Quién es responsable de tus datos">
        <p>
          Jorge Retamal, persona natural con domicilio en Chile, es el responsable del tratamiento.
          Para cualquier consulta sobre tus datos, escribe a <ContactLink />.
        </p>
      </Section>

      <Section title="Qué datos guardamos">
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            <strong className="font-semibold text-texto-primario">Lista de espera:</strong> tu
            correo y tu región de juego (LAS, LAN o EUW). Nada más.
          </li>
          <li>
            <strong className="font-semibold text-texto-primario">Test de tilt:</strong> si lo usas,
            tu Riot ID sirve para consultar tus partidas en la API oficial de Riot Games. No lo
            guardamos.
          </li>
          <li>
            <strong className="font-semibold text-texto-primario">Uso de la web:</strong> cuántas
            visitas recibe la página, desde qué enlace llegan y cuántas terminan en la lista. No
            usamos cookies para esto, descartamos la dirección IP y nunca incluimos tu correo.
          </li>
        </ul>
      </Section>

      <Section title="Para qué los usamos">
        <p>
          Usamos tu correo para confirmar tu inscripción y para avisarte cuando empiece la beta. La
          región nos ayuda a saber dónde lanzar primero. Las cifras de uso nos dicen si la idea le
          interesa a alguien. Tratamos estos datos porque nos das tu consentimiento al inscribirte,
          y puedes retirarlo cuando quieras.
        </p>
        <p>No mostramos anuncios, no vendemos tus datos y no los compartimos con anunciantes.</p>
      </Section>

      <Section title="Cuánto tiempo los guardamos">
        <p>
          Si en 6 meses no te registras en Alamak, borramos tu correo y tu región de la lista de
          espera. Si antes nos pides que los borremos, lo hacemos en ese momento.
        </p>
      </Section>

      <Section title="Quién nos ayuda a tratarlos">
        <p>Estos proveedores procesan datos por encargo nuestro y solo para darnos su servicio:</p>
        <ul className="flex flex-col gap-3">
          {PROCESSORS.map((processor) => (
            <li
              key={processor.name}
              className="flex flex-col gap-0.5 rounded-lg border border-borde-defecto bg-fondo-superficie p-4"
            >
              <span className="text-titulo-s font-semibold text-texto-primario">
                {processor.name}
              </span>
              <span>
                {processor.role} · {processor.location}
              </span>
            </li>
          ))}
        </ul>
        <p>
          Cuando un proveedor guarda datos fuera de tu país, la transferencia se ampara en cláusulas
          contractuales tipo de protección de datos.
        </p>
      </Section>

      <Section title="Tus derechos y cómo ejercerlos">
        <p>
          Puedes pedir acceso a tus datos, corregirlos, borrarlos, oponerte a su uso o recibirlos en
          un formato portable. Escribe a <ContactLink /> desde el correo inscrito y te respondemos
          en un plazo máximo de 30 días.
        </p>
        <p>
          Si crees que no atendimos bien tu solicitud, puedes reclamar ante la Agencia de Protección
          de Datos Personales de Chile o, si vives en España, ante la Agencia Española de Protección
          de Datos.
        </p>
      </Section>

      <Section title="Edad mínima">
        <p>
          Alamak es para personas desde los 14 años. Si tienes menos, pide a tu madre, padre o tutor
          que nos escriba antes de inscribirte.
        </p>
      </Section>

      <Section title="Cambios a esta política">
        <p>
          Si cambiamos algo, actualizamos la versión y la fecha de arriba. Si el cambio afecta lo
          que hacemos con tu correo, te avisamos por correo antes de aplicarlo.
        </p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 text-cuerpo-m text-texto-secundario">
      <h2 className="font-display text-titulo-m font-bold text-texto-primario">{title}</h2>
      {children}
    </section>
  );
}

function ContactLink() {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className="break-all text-marca-texto underline">
      {CONTACT_EMAIL}
    </a>
  );
}

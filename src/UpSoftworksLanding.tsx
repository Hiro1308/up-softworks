import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import Lenis from "lenis";

/**
 * UP Softworks — landing one-page (cielo nocturno, naranja dominante)
 *
 * Uso en Vite + React + TypeScript:
 *   import UpSoftworksLanding from "./UpSoftworksLanding";
 *   <UpSoftworksLanding />
 *
 * Todo lo editable rápido está en CONFIG.
 * El logo sale de /public/upsoftworks.png (monograma "UP" sobre disco naranja).
 */

interface Config {
  email: string;
  whatsapp: string;
  ubicacion: string;
  formEndpoint: string;
}

interface Estrella {
  x: string;
  y: string;
  r: number;
  o: string;
}

const CONFIG: Config = {
  email: "upsoftworksuy@gmail.com",
  whatsapp: "+598 00 000 000", // TODO: número real
  ubicacion: "Uruguay",
  // Endpoint del form de contacto. Formsubmit no necesita backend ni cuenta:
  // el primer envío dispara un mail de activación a esta casilla (hay que
  // confirmarlo una vez). Se puede cambiar por un endpoint propio sin tocar
  // el componente.
  formEndpoint: "https://formsubmit.co/ajax/upsoftworksuy@gmail.com",
};

/* Links a las tiendas de la app de Liga VH */
const TIENDAS_LVH = {
  ios: "https://apps.apple.com/us/app/liga-vh/id6792832834",
  android:
    "https://play.google.com/store/apps/details?id=com.upsoftworks.lvhapp&hl=es_UY",
};

/* ---------- i18n ---------- */
type Lang = "es" | "en";

/* Las secciones del nav: el href es fijo, el texto sale del diccionario por key. */
const SECCIONES: {
  href: string;
  key: "servicios" | "proyectos" | "enfoque";
}[] = [
  { href: "#servicios", key: "servicios" },
  { href: "#proyectos", key: "proyectos" },
  { href: "#enfoque", key: "enfoque" },
];

const TRAD_ES = {
  nav: {
    servicios: "Qué hacemos",
    proyectos: "Proyectos",
    enfoque: "Cómo trabajamos",
    contacto: "Contacto",
    cta: "Hablemos",
    sitio: "Sitio",
  },
  hero: {
    h1a: "Digitalizamos cómo funciona",
    h1b: "tu organización",
    sub: "Diseñamos plataformas a medida que centralizan la gestión, automatizan procesos y conectan todo lo que necesitás para operar y crecer.",
    cta: "Ver proyecto",
  },
  servicios: {
    h2a: "Mucho más que un",
    h2b: "sistema de gestión",
    bajada:
      "Unificamos gestión interna, automatizaciones, datos, sitios web, apps e integraciones en una misma plataforma. Menos tareas manuales, menos herramientas desconectadas y más control para vos y tu equipo.",
    cards: [
      {
        h3: "Gestión centralizada",
        p: "Personas, pagos, documentos, solicitudes, estados y permisos en un solo lugar. Diseñamos el sistema alrededor de tu operación para que tu equipo trabaje con menos planillas, menos duplicación y más control.",
      },
      {
        h3: "Procesos automáticos",
        p: "Avisos, vencimientos, aprobaciones, documentos, notificaciones y tareas repetitivas pueden ejecutarse automáticamente. Tu equipo dedica menos tiempo a administrar y más tiempo a avanzar.",
      },
      {
        h3: "Información para decidir",
        p: "Convertimos tus datos en tableros, reportes, históricos y estadísticas actualizadas. Encontrá la información que necesitás en segundos y tomá decisiones sin tener que reconstruirla a mano cada vez.",
      },
      {
        h3: "Web y apps conectadas",
        p: "Tu sistema interno puede alimentar directamente tu sitio web y tus apps para iOS y Android. Publicás una vez y la información se actualiza donde tus usuarios la necesitan, sin mantener cada canal por separado.",
      },
      {
        h3: "Conectamos lo que ya usás",
        p: "Integramos la plataforma con correo, calendarios, pagos, facturación, almacenamiento, APIs y otros servicios para que la información fluya entre sistemas. Menos copiar y pegar, menos errores y menos trabajo manual.",
      },
    ],
    vGestion: [
      ["Alta de socio", "Aprobado"],
      ["Solicitud a revisar", "Pendiente"],
      ["Documento cargado", "Publicado"],
    ],
    vFlujo: ["Se dispara", "Se procesa", "Se notifica"],
    vWeb: [
      ["Agenda", "Publicada"],
      ["Novedades", "Actualizado"],
    ],
  },
  proyectos: {
    h2: "Plataformas reales, funcionando todos los días",
    bajada:
      "Dos organizaciones con operaciones muy distintas, resueltas con software pensado alrededor de cómo trabajan y de lo que necesitan gestionar.",
    lvhCliente: "LVH Eventos",
    lvhDesc:
      "Un ecosistema digital completo para gestionar una liga de fútbol amateur de punta a punta. La organización administra torneos, equipos, jugadores, partidos, sanciones, documentación y finanzas desde un mismo panel; jugadores, delegados e hinchas acceden a resultados, fixture, posiciones y estadísticas desde la web y las apps para iOS y Android.",
    fdvCliente: "Programa de rehabilitación",
    fdvP1:
      "Una plataforma que centraliza la operación del programa: participantes, asistencias, pagos, documentación y seguimiento desde un mismo panel. La información queda ordenada y disponible para el equipo sin depender de planillas y tareas administrativas dispersas.",
    fdvP2a:
      "La misma solución conecta la gestión interna con el sitio público y la venta online del ebook ",
    fdvP2b:
      ", automatizando el pago y la entrega del material para profesionales de la salud, entrenadores e instituciones.",
  },
  enfoque: {
    h2: "Software preparado para crecer con vos",
    bajada:
      "Construimos plataformas para el trabajo real de todos los días: fáciles de mantener, listas para evolucionar y pensadas para acompañar a tu organización a medida que cambian sus necesidades.",
    pilares: [
      {
        t: "Tu plataforma. Tus datos.",
        d: "El código, la base de datos y las cuentas principales quedan bajo tu control. Sin cajas negras ni dependencia de una solución que no podés adaptar.",
      },
      {
        t: "Hecho para tu forma de trabajar",
        d: "No obligamos a tu organización a adaptarse a un sistema genérico. Diseñamos la plataforma alrededor de tus procesos, tus reglas y tu equipo.",
      },
      {
        t: "Preparado para crecer",
        d: "Empezá con lo que necesitás hoy y sumá nuevas funciones, usuarios y procesos a medida que tu organización crece, sin rehacer todo desde cero.",
      },
    ],
  },
  contacto: {
    eyebrow: "Contacto",
    h2: "Contanos qué querés resolver",
    p: "No necesitás llegar con una solución técnica definida. Contanos cómo trabajás, qué te está haciendo perder tiempo y qué querés mejorar. Te respondemos con una propuesta de alcance, plazos y precio.",
    fNombre: "Nombre",
    fEmail: "Email",
    fMensaje: "Contanos tu proyecto",
    fEnviar: "Enviar mensaje",
    fEnviando: "Enviando…",
    fOkTitulo: "Mensaje enviado.",
    fOkTexto:
      "Te respondemos a la brevedad con una propuesta de alcance, plazos y precio.",
    fError: "No se pudo enviar. Escribinos directo a ",
  },
  footer: {
    desc: "Software a medida para centralizar la gestión, automatizar procesos y hacer crecer organizaciones.",
    marcas:
      "Liga VH y Flechas de Vida son marcas de sus respectivas organizaciones.",
  },
  zoom: {
    tocaParaVer: "Tocá para ver en detalle",
    visitar: "Visitar sitio",
    cerrar: "Cerrar",
  },
};

type Textos = typeof TRAD_ES;

const TRAD_EN: Textos = {
  nav: {
    servicios: "What we do",
    proyectos: "Projects",
    enfoque: "How we work",
    contacto: "Contact",
    cta: "Let's talk",
    sitio: "Site",
  },
  hero: {
    h1a: "We digitize how your",
    h1b: "organization runs",
    sub: "We design custom platforms that centralize management, automate processes and connect everything you need to operate and grow.",
    cta: "See a project",
  },
  servicios: {
    h2a: "Much more than a",
    h2b: "management system",
    bajada:
      "We bring internal management, automations, data, websites, apps and integrations together into a single platform. Fewer manual tasks, fewer disconnected tools and more control for you and your team.",
    cards: [
      {
        h3: "Centralized management",
        p: "People, payments, documents, requests, statuses and permissions in one place. We design the system around your operation so your team works with fewer spreadsheets, less duplication and more control.",
      },
      {
        h3: "Automated processes",
        p: "Reminders, due dates, approvals, documents, notifications and repetitive tasks can run automatically. Your team spends less time on admin and more time moving forward.",
      },
      {
        h3: "Information to decide with",
        p: "We turn your data into live dashboards, reports, history and up-to-date stats. Find what you need in seconds and make decisions without rebuilding it by hand every time.",
      },
      {
        h3: "Connected web and apps",
        p: "Your internal system can feed your website and your iOS and Android apps directly. Publish once and the information updates wherever your users need it, without maintaining each channel separately.",
      },
      {
        h3: "We connect what you already use",
        p: "We integrate the platform with email, calendars, payments, billing, storage, APIs and other services so information flows between systems. Less copy-paste, fewer errors and less manual work.",
      },
    ],
    vGestion: [
      ["New member", "Approved"],
      ["Request to review", "Pending"],
      ["Document uploaded", "Published"],
    ],
    vFlujo: ["Triggered", "Processed", "Notified"],
    vWeb: [
      ["Schedule", "Published"],
      ["News", "Updated"],
    ],
  },
  proyectos: {
    h2: "Real platforms, running every day",
    bajada:
      "Two organizations with very different operations, solved with software built around how they work and what they need to manage.",
    lvhCliente: "LVH Eventos",
    lvhDesc:
      "A complete digital ecosystem to run an amateur football league end to end. The organization manages tournaments, teams, players, matches, sanctions, paperwork and finances from a single panel; players, team managers and fans get results, fixtures, standings and stats from the website and the iOS and Android apps.",
    fdvCliente: "Rehabilitation program",
    fdvP1:
      "A platform that centralizes the program's operation: participants, attendance, payments, paperwork and follow-up from a single panel. Information stays organized and available to the team without relying on scattered spreadsheets and admin tasks.",
    fdvP2a:
      "The same solution connects internal management with the public site and the online sale of the ebook ",
    fdvP2b:
      ", automating payment and delivery of the material for health professionals, coaches and institutions.",
  },
  enfoque: {
    h2: "Software ready to grow with you",
    bajada:
      "We build platforms for real everyday work: easy to maintain, ready to evolve and designed to keep up with your organization as its needs change.",
    pilares: [
      {
        t: "Your platform. Your data.",
        d: "The code, the database and the main accounts stay under your control. No black boxes and no lock-in to a solution you can't adapt.",
      },
      {
        t: "Built for the way you work",
        d: "We don't force your organization to adapt to a generic system. We design the platform around your processes, your rules and your team.",
      },
      {
        t: "Ready to scale",
        d: "Start with what you need today and add new features, users and processes as your organization grows, without rebuilding everything from scratch.",
      },
    ],
  },
  contacto: {
    eyebrow: "Contact",
    h2: "Tell us what you want to solve",
    p: "You don't need to arrive with a defined technical solution. Tell us how you work, what's costing you time and what you want to improve. We'll get back to you with a proposal covering scope, timeline and price.",
    fNombre: "Name",
    fEmail: "Email",
    fMensaje: "Tell us about your project",
    fEnviar: "Send message",
    fEnviando: "Sending…",
    fOkTitulo: "Message sent.",
    fOkTexto:
      "We'll get back to you shortly with a proposal covering scope, timeline and price.",
    fError: "Couldn't send. Email us directly at ",
  },
  footer: {
    desc: "Custom software to centralize management, automate processes and grow organizations.",
    marcas:
      "Liga VH and Flechas de Vida are trademarks of their respective organizations.",
  },
  zoom: {
    tocaParaVer: "Tap to see it in detail",
    visitar: "Visit site",
    cerrar: "Close",
  },
};

const TRAD: Record<Lang, Textos> = { es: TRAD_ES, en: TRAD_EN };

function getLangInicial(): Lang {
  try {
    const g = localStorage.getItem("up-lang");
    if (g === "es" || g === "en") return g;
  } catch {
    /* localStorage no disponible */
  }
  if (
    typeof navigator !== "undefined" &&
    navigator.language.toLowerCase().startsWith("en")
  ) {
    return "en";
  }
  return "es";
}

/* estrellas deterministas: no saltan entre renders */
const ESTRELLAS: Estrella[] = Array.from({ length: 46 }, (_, i): Estrella => {
  const a = Math.sin((i + 1) * 12.9898) * 43758.5453;
  const b = Math.sin((i + 1) * 78.233) * 12345.6789;
  const fa = a - Math.floor(a);
  const fb = b - Math.floor(b);
  return {
    x: (fa * 100).toFixed(2),
    y: (fb * 52).toFixed(2),
    r: i % 7 === 0 ? 0.16 : 0.09,
    o: (0.25 + fa * 0.5).toFixed(2),
  };
});

// const telefonoPlano = (n: string): string => n.replace(/\D/g, "");

interface LogoProps {
  size?: number;
}

function Logo({ size = 32 }: LogoProps) {
  return (
    <img
      src="/upsoftworks.png"
      alt="UP Softworks"
      width={size}
      height={size}
      style={{ display: "block", borderRadius: "50%" }}
    />
  );
}

/* Nubes: antes eran feTurbulence en vivo (SVG filter + pattern + blend,
   recalculado sin parar) -> carísimo de pintar, sobre todo en Firefox
   ("lageaba todo"). Ahora son 2 texturas WebP horneadas UNA sola vez (mismo
   ruido/color de siempre -stitchTiles para que tile-en, y el fundido
   arriba/abajo ya horneado en el canal alfa) y se animan con
   background-repeat + transform: es prácticamente gratis para cualquier
   navegador, ya no hay filtro ni máscara corriendo por frame.
   /public/nubes-lejos.webp y nubes-cerca.webp se generaron rasterizando en
   canvas un <svg><feTurbulence stitchTiles="stitch">+<feColorMatrix></svg> de
   1200x500 (baseFrequency "0.0029 0.010" numOctaves=5 seed=23 para lejos;
   "0.0062 0.019" numOctaves=6 seed=9 para cerca; misma matriz de color que
   tenían antes) y multiplicando el alfa resultante por el fundido vertical
   (0 -> .35 en 30% -> 1 en 62% -> 0). Si hay que retocarlas, regenerar con
   esos mismos parámetros. */
function CapaNube({ clase, src }: { clase: string; src: string }) {
  return (
    <div className={`up-nube-mascara ${clase}`}>
      <div
        className="up-nube-capa"
        style={{ backgroundImage: `url(${src})` }}
      />
    </div>
  );
}

function Cielo() {
  return (
    <div className="up-cielo" aria-hidden="true">
      {/* wrapper con el parallax (scroll + mouse). Lleva TODO adentro para que
         el mix-blend-mode de las nubes siga mezclando con el degradé. */}
      <div className="up-cielo-par">
        <div className="up-cielo-degrade" />
        <div className="up-resplandor" />
        <svg
          className="up-estrellas"
          viewBox="0 0 100 52"
          preserveAspectRatio="none"
        >
          <g className="up-estrellas-g">
            {ESTRELLAS.map((e, i) => (
              <circle
                key={i}
                className="up-estrella"
                cx={e.x}
                cy={e.y}
                r={e.r}
                fill="#ffe4d0"
                opacity={e.o}
                style={{ animationDelay: `${(i % 9) * 0.7}s` }}
              />
            ))}
          </g>
        </svg>
        <CapaNube clase="up-nubes-lejos" src="/nubes-lejos.webp" />
        <CapaNube clase="up-nubes-cerca" src="/nubes-cerca.webp" />
      </div>
    </div>
  );
}

interface ZoomData {
  src: string;
  alt: string;
  href: string;
}
type OnZoom = ((z: ZoomData) => void) | undefined;

interface NavegadorProps {
  url: string;
  src: string;
  alt: string;
  className?: string;
  lazy?: boolean;
  href?: string;
  onZoom?: OnZoom;
}

function Navegador({
  url,
  src,
  alt,
  className,
  lazy = true,
  href,
  onZoom,
}: NavegadorProps) {
  const clase = className ? `up-mockup ${className}` : "up-mockup";
  const contenido = (
    <>
      <div className="up-barra">
        <span className="up-luz" style={{ background: "#ff5f57" }} />
        <span className="up-luz" style={{ background: "#febc2e" }} />
        <span className="up-luz" style={{ background: "#28c840" }} />
        <div className="up-url">{url}</div>
      </div>
      <img
        className="up-shot"
        src={src}
        alt={alt}
        loading={lazy ? "lazy" : "eager"}
      />
    </>
  );
  // En mobile: tap para acercar (lightbox). En desktop: link al sitio real.
  if (onZoom) {
    return (
      <button
        type="button"
        className={`${clase} up-mockup-link up-mockup-zoom`}
        onClick={() => onZoom({ src, alt, href: href ?? "" })}
      >
        {contenido}
      </button>
    );
  }
  if (href) {
    return (
      <a
        className={`${clase} up-mockup-link`}
        href={href}
        target="_blank"
        rel="noopener"
      >
        {contenido}
      </a>
    );
  }
  return <div className={clase}>{contenido}</div>;
}

function TiendasLVH() {
  return (
    <div className="up-tiendas">
      <a
        className="up-tienda"
        href={TIENDAS_LVH.ios}
        target="_blank"
        rel="noopener"
      >
        <img src="/appstore.webp" alt="Conseguila en el App Store" />
      </a>
      <a
        className="up-tienda"
        href={TIENDAS_LVH.android}
        target="_blank"
        rel="noopener"
      >
        <img src="/googleplay.webp" alt="Disponible en Google Play" />
      </a>
    </div>
  );
}

const URL_LVH = "https://lvheventos.uy";
const URL_FDV = "https://www.flechasdevida.com.uy";
const TEL_LVH_SHOT = "/app-ligavh-goleadores.webp";

function ShowcaseLigaVH({ onZoom }: { onZoom?: OnZoom }) {
  const telAlt = "App de Liga VH para iOS y Android: goleadores del torneo";
  return (
    <div className="up-showcase up-anim">
      <Navegador
        href={URL_LVH}
        onZoom={onZoom}
        url="lvheventos.uy"
        src="/proyecto-ligavh-web.webp"
        alt="Sitio público de Liga VH: resultados, tablas, fixture y estadísticas"
      />
      <Navegador
        className="up-showcase-mini"
        href={URL_LVH}
        onZoom={onZoom}
        url="lvheventos.uy/admin"
        src="/proyecto-ligavh-admin.webp"
        alt="Panel de gestión de Liga VH: control operativo, deportivo y financiero"
      />
      {onZoom ? (
        <button
          type="button"
          className="up-telefono"
          onClick={() =>
            onZoom({ src: TEL_LVH_SHOT, alt: telAlt, href: URL_LVH })
          }
        >
          <img src={TEL_LVH_SHOT} alt={telAlt} loading="lazy" />
        </button>
      ) : (
        <a
          className="up-telefono"
          href={URL_LVH}
          target="_blank"
          rel="noopener"
        >
          <img src={TEL_LVH_SHOT} alt={telAlt} loading="lazy" />
        </a>
      )}
    </div>
  );
}

function ShowcaseFlechas({ onZoom }: { onZoom?: OnZoom }) {
  return (
    <div className="up-showcase up-showcase-duo up-anim">
      <Navegador
        href={URL_FDV}
        onZoom={onZoom}
        url="flechasdevida.com.uy"
        src="/flechas-web.webp"
        alt="Sitio público de Flechas de Vida"
      />
      <Navegador
        className="up-showcase-mini"
        href={URL_FDV}
        onZoom={onZoom}
        url="flechasdevida.com.uy/panel"
        src="/proyecto-flechas.webp"
        alt="Panel interno de Flechas de Vida: ficha de una participante"
      />
    </div>
  );
}

function Lightbox({
  data,
  onClose,
  t,
}: {
  data: ZoomData;
  onClose: () => void;
  t: Textos;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="up-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={data.alt}
      onClick={onClose}
    >
      <button
        type="button"
        className="up-lightbox-x"
        onClick={onClose}
        aria-label={t.zoom.cerrar}
      >
        ×
      </button>
      <div className="up-lightbox-cont" onClick={(e) => e.stopPropagation()}>
        <img src={data.src} alt={data.alt} />
      </div>
      {data.href && (
        <a
          className="up-btn up-btn-lleno up-lightbox-ir"
          href={data.href}
          target="_blank"
          rel="noopener"
        >
          {t.zoom.visitar} ↗
        </a>
      )}
    </div>
  );
}

type EstadoForm = "idle" | "enviando" | "ok" | "error";

function FormContacto({ t }: { t: Textos }) {
  const [estado, setEstado] = useState<EstadoForm>("idle");
  const f = t.contacto;

  async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const form = e.currentTarget;
    setEstado("enviando");
    try {
      const r = await fetch(CONFIG.formEndpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const data: { success?: string | boolean } = await r
        .json()
        .catch(() => ({}));
      if (
        !r.ok ||
        (data.success !== undefined &&
          data.success !== "true" &&
          data.success !== true)
      ) {
        throw new Error("envio fallido");
      }
      setEstado("ok");
      form.reset();
    } catch {
      setEstado("error");
    }
  }

  if (estado === "ok") {
    return (
      <div className="up-form up-form-ok" role="status">
        <strong>{f.fOkTitulo}</strong>
        <p>{f.fOkTexto}</p>
      </div>
    );
  }

  return (
    <form className="up-form" onSubmit={onSubmit}>
      <input
        type="hidden"
        name="_subject"
        value="Nuevo mensaje desde upsoftworks"
      />
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="_template" value="table" />
      <input
        type="text"
        name="_honey"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
      />
      <label className="up-campo">
        <span>{f.fNombre}</span>
        <input name="nombre" type="text" required autoComplete="name" />
      </label>
      <label className="up-campo">
        <span>{f.fEmail}</span>
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label className="up-campo">
        <span>{f.fMensaje}</span>
        <textarea name="mensaje" rows={4} required />
      </label>
      <button
        className="up-btn up-btn-lleno"
        type="submit"
        disabled={estado === "enviando"}
      >
        {estado === "enviando" ? f.fEnviando : f.fEnviar}
      </button>
      {estado === "error" && (
        <p className="up-form-error" role="alert">
          {f.fError}
          {CONFIG.email}.
        </p>
      )}
    </form>
  );
}

const MQ_MOBILE = "(max-width: 760px)";
const NAV_OFFSET = 78; // alto del nav sticky

/* Scrollea a una sección SIN tocar la URL (nada de /#servicios en la barra). */
function irASeccion(
  hash: string,
  lenis: Lenis | null,
  immediate = false,
): void {
  let el: Element | null;
  try {
    el = document.querySelector(hash);
  } catch {
    return;
  }
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el as HTMLElement, { offset: -NAV_OFFSET, immediate });
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top =
    (el as HTMLElement).getBoundingClientRect().top +
    window.scrollY -
    NAV_OFFSET;
  window.scrollTo({ top, behavior: immediate || reduce ? "auto" : "smooth" });
}

export default function UpSoftworksLanding() {
  const [scrolleado, setScrolleado] = useState<boolean>(false);
  const [lang, setLang] = useState<Lang>(getLangInicial);
  const [mobile, setMobile] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia(MQ_MOBILE).matches,
  );
  const [zoom, setZoom] = useState<ZoomData | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const t = TRAD[lang];
  const onZoom: OnZoom = mobile ? setZoom : undefined;

  // ¿estamos en ancho mobile? (define el comportamiento tap-para-acercar)
  useEffect(() => {
    const mq = window.matchMedia(MQ_MOBILE);
    const on = (): void => setMobile(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Con el lightbox abierto, frenar el scroll de la página (Lenis incluido).
  useEffect(() => {
    if (!zoom) return;
    lenisRef.current?.stop();
    return () => lenisRef.current?.start();
  }, [zoom]);

  // Marca que hay JS: recién ahí se activa el estado "oculto" de las animaciones
  // (sin JS, o si algo falla, el contenido se ve igual).
  useLayoutEffect(() => {
    rootRef.current?.classList.add("up-js");
  }, []);

  // Reveal on scroll: cada .up-anim / .up-stagger aparece al entrar en viewport.
  // Se re-observa al cambiar de idioma por si algún nodo se remontó.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nodos = root.querySelectorAll<HTMLElement>(".up-anim, .up-stagger");
    const mostrarTodo = (): void =>
      nodos.forEach((el) => el.classList.add("visible"));

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      mostrarTodo();
      return;
    }
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );
    nodos.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [lang]);

  // Persiste el idioma y lo refleja en <html lang>.
  useEffect(() => {
    try {
      localStorage.setItem("up-lang", lang);
    } catch {
      /* localStorage no disponible */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  // Scroll suave con inercia (Lenis). Respeta prefers-reduced-motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number): number => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      autoRaf: true,
      // los anchors los manejamos a mano para no ensuciar la URL
    });
    lenisRef.current = lenis;
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Links internos (#seccion): scroll suave SIN cambiar la URL.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // si se entró con /#seccion, ir ahí y limpiar la barra
    const inicial = window.location.hash;
    if (inicial && inicial.length > 1) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
      requestAnimationFrame(() =>
        irASeccion(inicial, lenisRef.current, true),
      );
    }

    const onClick = (e: MouseEvent): void => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      const hash = a?.getAttribute("href");
      if (!hash || hash.length < 2) return;
      e.preventDefault();
      irASeccion(hash, lenisRef.current);
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, []);

  // El cielo del hero se desvanece + hace parallax al scrollear. Los vars van
  // directo en .up-cielo (no en toda la sección) y a lo sumo 1 vez por frame,
  // para no forzar un recálculo de estilos grande en cada scroll (Firefox es
  // bastante más estricto que Chrome con esto).
  useEffect(() => {
    const cielo =
      heroRef.current?.querySelector<HTMLElement>(".up-cielo") ?? null;
    let raf = 0;
    let pendiente = false;
    const aplicar = (): void => {
      pendiente = false;
      const y = window.scrollY;
      setScrolleado(y > 40);
      const distancia = window.innerHeight * 0.8 || 640;
      const op = Math.max(0, Math.min(1, 1 - y / distancia));
      if (cielo) {
        cielo.style.setProperty("--cielo-op", op.toFixed(3));
        const par = Math.min(y * 0.12, 130);
        cielo.style.setProperty("--cielo-par", `${par.toFixed(1)}px`);
      }
    };
    const onScroll = (): void => {
      if (pendiente) return;
      pendiente = true;
      raf = requestAnimationFrame(aplicar);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    aplicar();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Parallax de mouse: el cielo sigue apenas al puntero (sólo desktop / con
  // mouse). Los vars van directo en cada .up-cielo-par, no en toda la página,
  // por lo mismo: acotar qué tiene que recalcular el navegador por frame.
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)")
        .matches
    ) {
      return;
    }
    const capas =
      rootRef.current?.querySelectorAll<HTMLElement>(".up-cielo-par") ?? null;
    if (!capas || !capas.length) return;
    let raf = 0;
    const onMove = (e: PointerEvent): void => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const mx = (e.clientX / window.innerWidth - 0.5).toFixed(3);
        const my = (e.clientY / window.innerHeight - 0.5).toFixed(3);
        capas.forEach((el) => {
          el.style.setProperty("--pmx", mx);
          el.style.setProperty("--pmy", my);
        });
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Pausar nubes/estrellas/resplandor cuando su cielo no está en pantalla:
  // son animaciones infinitas (deriva + blend + blur) y en una página larga
  // como esta pasan la mayor parte del tiempo fuera de vista.
  useEffect(() => {
    const cielos =
      rootRef.current?.querySelectorAll<HTMLElement>(".up-cielo") ?? null;
    if (!cielos || !cielos.length || !("IntersectionObserver" in window)) {
      return;
    }
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          e.target.classList.toggle("up-fuera-de-vista", !e.isIntersecting);
        }
      },
      { rootMargin: "200px 0px" },
    );
    cielos.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="up" ref={rootRef}>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,500;0,600;0,700;0,800;1,800&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

/* scroll suave: anchors nativos + base para Lenis (inercia con rueda) */
html { scroll-behavior: smooth; }
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
.lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
.lenis.lenis-stopped { overflow: clip; }
.lenis.lenis-smooth iframe { pointer-events: none; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }

.up {
  --naranja: #fd5700;
  --naranja-claro: #ff9354;
  --base: #120b07;
  --superficie: #1b110b;
  --linea: #352115;
  --hueso: #fbf3ec;
  --tenue: #b09a8c;

  background: var(--base);
  color: var(--hueso);
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-size: 16px; line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  overflow-x: clip; /* clip y no 'hidden': no crea scroll container y no rompe position: sticky */
}
.up *, .up *::before, .up *::after { box-sizing: border-box; }
.up h1, .up h2, .up h3, .up h4, .up h5 { font-family: 'Archivo', system-ui, sans-serif; margin: 0; }
.up :where(p) { margin: 0; }
.up :where(a) { color: inherit; text-decoration: none; }
.up :focus-visible { outline: 2px solid var(--naranja-claro); outline-offset: 3px; border-radius: 3px; }

.up-marco { max-width: 1160px; margin: 0 auto; padding: 0 32px; }
.up-centro { text-align: center; }
.up-seccion[id], #contacto { scroll-margin-top: 84px; }

/* ---------- animaciones ---------- */
@media (prefers-reduced-motion: no-preference) {
  /* reveal al hacer scroll: sólo se oculta si hay JS (.up-js) */
  .up-js .up-anim {
    opacity: 0;
    transform: translateY(32px);
    transition:
      opacity .75s cubic-bezier(.16,1,.3,1) var(--d, 0s),
      transform .75s cubic-bezier(.16,1,.3,1) var(--d, 0s);
  }
  .up-js .up-anim.visible { opacity: 1; transform: none; }

  /* stagger: los hijos directos de un .up-stagger entran en cascada */
  .up-js .up-stagger > * { opacity: 0; }
  .up-js .up-stagger.visible > * {
    animation: up-rise-in .6s cubic-bezier(.16,1,.3,1) both;
  }
  .up-js .up-stagger.visible > *:nth-child(1) { animation-delay: .02s; }
  .up-js .up-stagger.visible > *:nth-child(2) { animation-delay: .1s; }
  .up-js .up-stagger.visible > *:nth-child(3) { animation-delay: .18s; }
  .up-js .up-stagger.visible > *:nth-child(4) { animation-delay: .26s; }
  .up-js .up-stagger.visible > *:nth-child(5) { animation-delay: .34s; }
  .up-js .up-stagger.visible > *:nth-child(6) { animation-delay: .42s; }

  /* nav: baja al cargar */
  .up-nav { animation: up-navdrop .55s cubic-bezier(.16,1,.3,1) both; }
  /* cielo con brisa: las nubes derivan lateralmente, solas, en loop continuo.
     background-repeat tira las baldosas -> no hace falta ningún truco de
     empalme, alcanza con desplazar el fondo un ancho de baldosa y reiniciar.
     Las lejanas van más lento -> profundidad. */
  .up-nubes-lejos .up-nube-capa { animation: up-brisa-bg 62s linear infinite; }
  .up-nubes-cerca .up-nube-capa { animation: up-brisa-bg 38s linear infinite; }
  .up-estrellas-g { animation: up-estrellas-deriva 240s ease-in-out infinite alternate; }
  /* resplandor naranja: respiración suave */
  .up-resplandor { animation: up-glow 9s ease-in-out infinite alternate; }
  /* estrellas: titileo tenue */
  .up-estrella { animation: up-twinkle 4.5s ease-in-out infinite alternate; }
  /* barras del gráfico: crecen cuando la tarjeta entra en viewport */
  .up-js .up-anim .up-barras i { transform: scaleY(0); }
  .up-js .up-anim.visible .up-barras i {
    animation: up-bar .8s cubic-bezier(.16,1,.3,1) forwards;
  }
  .up-js .up-anim.visible .up-barras i:nth-child(1) { animation-delay: .3s; }
  .up-js .up-anim.visible .up-barras i:nth-child(2) { animation-delay: .38s; }
  .up-js .up-anim.visible .up-barras i:nth-child(3) { animation-delay: .46s; }
  .up-js .up-anim.visible .up-barras i:nth-child(4) { animation-delay: .54s; }
  .up-js .up-anim.visible .up-barras i:nth-child(5) { animation-delay: .62s; }
  .up-js .up-anim.visible .up-barras i:nth-child(6) { animation-delay: .7s; }
}
@keyframes up-rise { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: none; } }
@keyframes up-rise-in { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
@keyframes up-bar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes up-brisa-bg {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(calc(var(--nube-ancho, 1500px) * -1), 0, 0); }
}
@keyframes up-estrellas-deriva {
  from { transform: translate(-1.5%, 0); }
  to   { transform: translate(1.5%, 0.6%); }
}
@keyframes up-glow { from { opacity: .78; transform: translate(-50%, -50%) scale(.96); } to { opacity: 1; transform: translate(-50%, -50%) scale(1.05); } }
@keyframes up-twinkle { from { opacity: .28; } to { opacity: .72; } }
@keyframes up-navdrop { from { transform: translateY(-100%); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes up-lightbox-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes up-lightbox-pop { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: none; } }

/* ---------- nav ---------- */
.up-nav { position: sticky; top: 0; z-index: 40; border-bottom: 1px solid transparent; transition: background .3s ease, border-color .3s ease; }
.up-nav.solido { background: rgba(10,6,4,.84); backdrop-filter: blur(14px); border-bottom-color: var(--linea); }
.up-nav-inner { display: flex; align-items: center; height: 78px; gap: 24px; }
.up-marca { display: flex; align-items: center; gap: 11px; font-family: 'Archivo'; font-weight: 800; font-size: 17px; letter-spacing: -.3px; white-space: nowrap; flex-shrink: 0; }
.up-nav-links { display: flex; gap: 6px; margin: 0 auto; }
.up-nav-links a { font-size: 14.5px; color: #e8d8cc; padding: 9px 15px; border-radius: 9px; transition: background .2s ease, color .2s ease; }
.up-nav-links a:hover { background: rgba(253,87,0,.16); color: #fff; }
.up-nav-cta { background: var(--naranja); color: #fff; font-weight: 600; font-size: 14.5px; padding: 11px 22px; border-radius: 10px; transition: background .2s ease, transform .2s ease, box-shadow .2s ease; }
.up-nav-cta:hover { background: #ff6f1f; transform: translateY(-1px); box-shadow: 0 8px 22px rgba(253,87,0,.4); }
.up-nav-fin { display: flex; align-items: center; gap: 14px; margin-left: auto; }
.up-lang { display: inline-flex; align-items: center; gap: 2px; padding: 3px; border: 1px solid var(--linea); border-radius: 999px; background: rgba(255,255,255,.05); }
.up-lang button {
  font: inherit; font-size: 12px; font-weight: 700; letter-spacing: .4px;
  color: #b7a596; background: none; border: 0; cursor: pointer;
  padding: 5px 9px; border-radius: 999px; line-height: 1;
  transition: background .2s ease, color .2s ease;
}
.up-lang button.activo { background: var(--naranja); color: #fff; }
.up-lang button:not(.activo):hover { color: #fff; }

/* ---------- cielo ---------- */
.up-hero { position: relative; margin-top: -78px; padding-top: 78px; min-height: 100vh; }
.up-cielo { position: absolute; inset: 0; overflow: hidden; z-index: 0; contain: paint; }
/* fuera de vista (scrolleado lejos): se pausan nubes/estrellas/resplandor.
   Son animaciones infinitas (deriva + blend + blur) y no hace falta que
   sigan corriendo cuando no se ven -> menos trabajo de fondo en toda la
   página, sobre todo en navegadores que componen esto peor (Firefox). */
.up-cielo.up-fuera-de-vista * { animation-play-state: paused !important; }
/* El cielo del hero queda "pinneado" al viewport mientras se scrollea el hero:
   el contenido pasa por encima y da la sensación de fondo real, no de imagen.
   Los negative margins lo sacan del flujo para que no empuje al contenido.
   --cielo-op lo baja el listener de scroll: se funde con el fondo oscuro. */
.up-hero > .up-cielo {
  position: sticky; inset: auto; top: 0;
  margin-top: -78px; height: 100vh; margin-bottom: calc(78px - 100vh);
  pointer-events: none;
  opacity: var(--cielo-op, 1);
  will-change: opacity;
}
/* velo oscuro sobre el cielo (debajo del contenido) para que las nubes no
   compitan con el texto del hero */
.up-hero > .up-cielo::after {
  content: ""; position: absolute; inset: 0; z-index: 3;
  background: linear-gradient(180deg,
    rgba(18,11,7,0) 0%,
    rgba(18,11,7,.12) 40%,
    rgba(18,11,7,.42) 72%,
    rgba(18,11,7,.72) 100%);
}
/* wrapper de TODO el cielo: acá va el parallax (scroll --cielo-par + mouse
   --pmx/--pmy). Está sobredimensionado y .up-cielo lo recorta. */
.up-cielo-par {
  position: absolute; inset: -11% -5%;
  transform: translate3d(
    calc(var(--pmx, 0) * 16px),
    calc(var(--cielo-par, 0px) * -0.45 + var(--pmy, 0) * 13px),
    0
  );
  transition: transform .5s cubic-bezier(.22,.61,.36,1);
  will-change: transform;
}
.up-cielo-degrade {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, #070403 0%, #0d0705 22%, #1d0c05 44%, #43160a 62%, #2a1207 82%, #120b07 100%);
}
.up-resplandor {
  position: absolute; left: 50%; top: 60%; transform: translate(-50%, -50%);
  width: 126%; height: 56%;
  background: radial-gradient(ellipse at center, rgba(253,87,0,.70) 0%, rgba(253,87,0,.26) 38%, rgba(253,87,0,0) 70%);
  filter: blur(20px);
}
.up-estrellas { position: absolute; left: -6%; top: -2%; width: 112%; height: 62%; }
.up-estrellas-g { transform-box: fill-box; transform-origin: 50% 50%; }
/* nubes horneadas (WebP, el fundido arriba/abajo ya viene en el alfa de la
   imagen): el wrapper fijo sólo recorta + mezcla con el degradé, adentro
   desliza la capa con la textura repetida. Igual look que antes, sin filtro
   ni máscara en vivo -> nada de feTurbulence/mask-image por frame. */
.up-nube-mascara {
  position: absolute; left: 0; width: 100%; bottom: -5%; height: 90%;
  overflow: hidden; mix-blend-mode: screen;
}
.up-nubes-lejos { opacity: .5; }
.up-nubes-cerca { opacity: .72; }
.up-nube-capa {
  position: absolute; inset: -12% -100%;
  background-repeat: repeat-x; background-position: left center;
  background-size: var(--nube-ancho, 1500px) auto;
  will-change: transform;
}

.up-hero-contenido {
  position: relative; z-index: 2;
  min-height: calc(100vh - 78px);
  display: flex; flex-direction: column; justify-content: center;
  padding: 96px 0;
}
.up-hero h1 {
  font-size: clamp(42px, 6.2vw, 80px); font-weight: 700; line-height: 1.03;
  letter-spacing: -3px; text-shadow: 0 4px 40px rgba(0,0,0,.55);
}
.up-hero-sub { margin: 26px auto 0; max-width: 58ch; font-size: 18.5px; color: #eadbd0; }
.up-acciones { margin-top: 40px; display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
.up-btn { padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15.5px; border: 1px solid transparent; display: inline-block; transition: background .2s ease, transform .2s ease, box-shadow .2s ease; }
.up-btn-lleno { background: var(--naranja); color: #fff; box-shadow: 0 10px 34px rgba(253,87,0,.42); }
.up-btn-lleno:hover { background: #ff6f1f; transform: translateY(-2px); box-shadow: 0 16px 42px rgba(253,87,0,.5); }
.up-btn:active { transform: translateY(0); }

/* ---------- mockup de navegador ---------- */
.up-mockup {
  position: relative;
  background: #16100c; border: 1px solid rgba(255,255,255,.15); border-radius: 14px;
  box-shadow: 0 30px 70px rgba(0,0,0,.5); overflow: hidden; text-align: left;
}
.up-barra { display: flex; align-items: center; gap: 8px; padding: 11px 14px; background: #1e1611; border-bottom: 1px solid var(--linea); }
.up-luz { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.up-url { margin: 0 auto; max-width: 62%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; background: #120c09; border: 1px solid var(--linea); border-radius: 7px; padding: 4px 40px; font-size: 12px; color: var(--tenue); }
.up-shot { display: block; width: 100%; height: auto; }
/* mockups clickeables -> al sitio real (desktop) / lightbox (mobile) */
.up-mockup-link { display: block; cursor: pointer; width: 100%; }
.up-mockup-zoom { font: inherit; color: inherit; text-align: left; padding: 0; margin: 0; -webkit-appearance: none; appearance: none; }
.up-showcase .up-mockup-link { transition: transform .35s ease, box-shadow .35s ease; }
.up-showcase > .up-mockup-link:hover { transform: translateY(-5px); box-shadow: 0 48px 100px rgba(0,0,0,.66); }
.up-mockup-zoom .up-shot { transition: transform .35s ease; }
.up-mockup-zoom:active .up-shot { transform: scale(.985); }

/* showcase: web pública de fondo + panel/ficha chico + (Liga VH) teléfono */
.up-showcase { position: relative; margin-top: 52px; padding-bottom: 92px; }
.up-showcase > .up-mockup { box-shadow: 0 40px 90px rgba(0,0,0,.6); }
.up-showcase-mini { position: absolute; left: 0; bottom: 0; width: 45%; z-index: 2; }
.up-showcase-duo { padding-bottom: 64px; }
.up-showcase-duo .up-showcase-mini {
  width: 52%; cursor: pointer;
  transition: width .4s cubic-bezier(.22,.61,.36,1), box-shadow .4s ease;
}
.up-showcase-duo .up-showcase-mini:hover { width: 100%; z-index: 6; box-shadow: 0 45px 100px rgba(0,0,0,.72); }
.up-proyecto-media .up-showcase { margin-top: 0; }
.up-telefono {
  position: absolute; right: 0; bottom: 0; width: 186px; z-index: 3;
  border: 6px solid #241812; border-radius: 30px; overflow: hidden;
  box-shadow: 0 26px 55px rgba(0,0,0,.6); background: #241812;
  cursor: pointer; transition: transform .35s ease, box-shadow .35s ease;
}
.up-telefono:hover { transform: translateY(-5px); box-shadow: 0 34px 66px rgba(0,0,0,.66); }
.up-telefono img { display: block; width: 100%; height: auto; }

/* badges de tienda (imágenes oficiales en /public) */
.up-tiendas { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
.up-tienda { display: inline-flex; border-radius: 12px; transition: opacity .2s ease; }
.up-tienda img { display: block; height: 46px; width: auto; }
.up-tienda:hover { opacity: .82; }

/* ---------- lightbox (tap para acercar, mobile) ---------- */
.up-lightbox {
  position: fixed; inset: 0; z-index: 200;
  display: flex; align-items: center; justify-content: center;
  padding: 56px 14px 84px;
  background: rgba(8,4,2,.93); backdrop-filter: blur(3px);
  animation: up-lightbox-in .2s ease;
}
.up-lightbox-cont {
  max-width: 96vw; max-height: 100%; overflow: auto;
  border-radius: 12px; -webkit-overflow-scrolling: touch;
  box-shadow: 0 40px 120px rgba(0,0,0,.7);
  animation: up-lightbox-pop .28s cubic-bezier(.16,1,.3,1);
}
.up-lightbox-cont img { display: block; width: 100%; height: auto; }
.up-lightbox-x {
  position: absolute; top: 12px; right: 14px;
  width: 40px; height: 40px; border-radius: 999px;
  font-size: 26px; line-height: 1; color: #fff;
  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.up-lightbox-x:hover { background: rgba(255,255,255,.2); }
.up-lightbox-ir {
  position: absolute; bottom: 22px; left: 50%; transform: translateX(-50%);
  white-space: nowrap;
}
.up-lightbox-ir:hover { transform: translateX(-50%) translateY(-2px); }

/* chip de logo de proyecto */
.up-logo-chip { display: block; width: 56px; height: 56px; border-radius: 15px; object-fit: cover; border: 1px solid var(--linea); margin-bottom: 16px; }

/* ---------- pilares (cómo trabajamos) ---------- */
.up-pilares { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 56px; text-align: left; }
.up-pilar { background: linear-gradient(180deg, #1d130d 0%, #160f0a 100%); border: 1px solid var(--linea); border-radius: 18px; padding: 26px 24px; transition: border-color .3s ease, box-shadow .3s ease, background .3s ease; }
.up-pilar:hover { border-color: rgba(253,87,0,.4); box-shadow: 0 18px 44px rgba(0,0,0,.4); background: linear-gradient(180deg, #22160e 0%, #181009 100%); }
.up-pilar h4 { font-size: 17px; font-weight: 700; letter-spacing: -.3px; }
.up-pilar p { color: var(--tenue); font-size: 14.5px; margin-top: 10px; }

.up-seccion { padding: 104px 0; }
.up-titulo { font-size: clamp(30px, 4.2vw, 50px); font-weight: 700; letter-spacing: -1.8px; line-height: 1.06; }
.up-bajada { color: var(--tenue); margin: 20px auto 0; max-width: 58ch; font-size: 17px; }

/* ---------- tarjetas ---------- */
.up-grilla { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 60px; }
.up-grilla-2 { grid-template-columns: repeat(2, 1fr); margin: 20px auto 0; max-width: 780px; }
.up-card {
  background: linear-gradient(180deg, #1d130d 0%, #160f0a 100%);
  border: 1px solid var(--linea); border-radius: 18px; padding: 32px 28px 0;
  text-align: center; overflow: hidden; display: flex; flex-direction: column;
  transition: border-color .3s ease, box-shadow .3s ease, background .3s ease;
}
.up-card:hover { border-color: rgba(253,87,0,.4); box-shadow: 0 22px 50px rgba(0,0,0,.42); background: linear-gradient(180deg, #22160e 0%, #181009 100%); }
.up-card h3 { font-size: 21px; font-weight: 700; letter-spacing: -.6px; }
.up-card > p { color: var(--tenue); font-size: 15px; margin-top: 12px; }
.up-card-visual { margin-top: 28px; flex: 1; display: flex; align-items: flex-end; justify-content: center; }

.up-mini { width: 100%; background: #110b08; border: 1px solid var(--linea); border-bottom: 0; border-radius: 12px 12px 0 0; padding: 6px 16px; text-align: left; }
.up-mini-fila { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--linea); font-size: 12.5px; color: var(--tenue); }
.up-mini-fila:last-child { border-bottom: 0; }
.up-mini-estado { font-size: 11px; padding: 3px 9px; border-radius: 999px; background: rgba(253,87,0,.16); color: var(--naranja-claro); white-space: nowrap; }
.up-flujo-mini { display: flex; align-items: center; gap: 8px; justify-content: center; flex-wrap: wrap; padding-bottom: 30px; }
.up-flujo-mini span { font-size: 12.5px; padding: 8px 14px; border: 1px solid var(--linea); border-radius: 9px; background: #110b08; }
.up-flecha { color: var(--naranja); font-size: 15px; }
.up-barras { display: flex; align-items: flex-end; gap: 10px; height: 112px; }
.up-barras i { display: block; width: 26px; background: linear-gradient(180deg, var(--naranja) 0%, rgba(253,87,0,.12) 100%); border-radius: 5px 5px 0 0; transform-origin: bottom; }
.up-marcas { display: flex; gap: 12px; padding-bottom: 36px; }
.up-marcas i { width: 36px; height: 36px; border-radius: 11px; display: block; }

/* ---------- proyectos ---------- */
.up-proyecto { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; text-align: left; }
.up-proyecto.invertido .up-proyecto-media { order: -1; }
.up-cliente { font-size: 13.5px; color: var(--naranja-claro); font-weight: 500; }
.up-proyecto h3 { font-size: clamp(30px, 3.8vw, 44px); font-weight: 800; letter-spacing: -1.6px; margin-top: 12px; line-height: 1.03; }
.up-proyecto p { color: var(--tenue); margin-top: 18px; font-size: 16px; max-width: 52ch; }
/* ---------- divisores entre secciones ---------- */
.up-hr { padding: 20px 0; }
.up-divisor { position: relative; max-width: 1160px; margin: 0 auto; height: 1px; background: linear-gradient(90deg, transparent, var(--linea) 15%, var(--linea) 85%, transparent); }
.up-divisor::after {
  content: ""; position: absolute; left: 50%; top: 50%;
  width: 7px; height: 7px; transform: translate(-50%, -50%) rotate(45deg);
  background: var(--naranja); box-shadow: 0 0 0 5px var(--base), 0 0 18px rgba(253,87,0,.55);
}
@media (max-width: 980px) { .up-divisor { margin: 0 22px; } }

/* proyecto Liga VH: bloque a lo ancho con los tres productos */
.up-feature { text-align: left; }
.up-feature-id { max-width: 640px; }
.up-feature-id .up-cliente { margin-top: 0; }
.up-proj-title { display: flex; align-items: center; gap: 16px; margin-top: 8px; }
.up-proj-title .up-logo-chip { margin-bottom: 0; }
.up-proj-title h3 { margin-top: 0; }
.up-feature h3 { font-size: clamp(30px, 3.8vw, 44px); font-weight: 800; letter-spacing: -1.6px; line-height: 1.03; }
.up-feature-desc { color: var(--tenue); margin-top: 16px; font-size: 16px; max-width: 62ch; }

/* ---------- contacto: "hueco" recortado en la página ---------- */
/* Full-bleed, con borde sólo arriba y abajo: la superficie se hunde y el
   labio superior tiene una muesca cóncava (como un hueco tallado en la web). */
.up-hueco {
  position: relative;
  background: var(--base);
  border-bottom: 1px solid var(--linea);
  box-shadow: inset 0 22px 44px -22px rgba(0,0,0,.85), inset 0 -22px 44px -26px rgba(0,0,0,.7);
  padding: 104px 0 120px;
  margin-top: 40px;
  overflow: hidden; /* recorta el cielo naranja al hueco */
}
/* mismo cielo naranja del hero, de fondo */
.up-hueco > .up-cielo { z-index: 0; }
/* velo oscuro sobre el cielo para que el texto y el form respiren */
.up-hueco::after {
  content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background: linear-gradient(180deg,
    rgba(18,11,7,.74) 0%, rgba(18,11,7,.34) 32%,
    rgba(18,11,7,.30) 58%, rgba(18,11,7,.70) 100%);
}
/* "tapa": rellena con el color de la página todo lo que queda por ENCIMA de la
   muesca, para que el cielo se vea sólo dentro del hueco (no arriba de la curva) */
.up-hueco-tapa { position: absolute; top: 0; left: 0; width: 100%; height: 74px; display: block; z-index: 2; }
.up-hueco-tapa path { fill: var(--base); }
.up-hueco-labio { position: absolute; top: 0; left: 0; width: 100%; height: 74px; display: block; overflow: visible; z-index: 3; }
.up-hueco-labio path { stroke: rgba(255,214,186,.38); stroke-width: 1; }
.up-hueco-inner { position: relative; z-index: 3; }
.up-hueco-cara { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: start; }
.up-hueco-txt h2 { font-size: clamp(32px, 4.4vw, 52px); font-weight: 700; letter-spacing: -1.8px; margin-top: 12px; text-shadow: 0 4px 34px rgba(0,0,0,.5); }
.up-hueco-txt > p { color: #eadbd0; margin-top: 18px; max-width: 42ch; text-shadow: 0 2px 18px rgba(0,0,0,.45); }
.up-hueco-datos { display: flex; flex-wrap: wrap; gap: 10px 22px; margin-top: 26px; font-size: 14.5px; }
.up-hueco-datos a { color: var(--naranja-claro); }
.up-hueco-datos a:hover { color: #fff; }

/* form de contacto */
.up-form {
  display: flex; flex-direction: column; gap: 16px;
  background: linear-gradient(180deg, #1d130d 0%, #160f0a 100%);
  border: 1px solid var(--linea); border-radius: 18px; padding: 28px;
}
.up-campo { display: flex; flex-direction: column; gap: 7px; text-align: left; }
.up-campo span { font-size: 13px; color: var(--tenue); }
.up-form input, .up-form textarea {
  font: inherit; color: var(--hueso);
  background: #110b08; border: 1px solid var(--linea); border-radius: 10px;
  padding: 12px 14px; width: 100%; resize: vertical;
  transition: border-color .2s ease, box-shadow .2s ease;
}
.up-form input:focus, .up-form textarea:focus { outline: none; border-color: var(--naranja); box-shadow: 0 0 0 3px rgba(253,87,0,.15); }
.up-form .up-btn { width: 100%; text-align: center; cursor: pointer; }
.up-form .up-btn:disabled { opacity: .6; cursor: progress; }
.up-form-error { color: #ff9a7a; font-size: 13.5px; }
.up-form-ok { text-align: left; }
.up-form-ok strong { font-family: 'Archivo'; font-size: 19px; }
.up-form-ok p { color: var(--tenue); margin-top: 8px; }

.up-pie { padding: 40px 0; margin-top: 60px; }
.up-pie-grilla { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 40px; }
.up-pie-grilla h5 { font-size: 14px; font-weight: 700; margin: 0 0 16px; }
.up-pie-grilla a, .up-pie-dato { display: block; font-size: 14.5px; color: var(--tenue); margin-bottom: 11px; }
.up-pie-grilla .up-marca { display: flex; margin-bottom: 4px; }
.up-pie-grilla .up-marca:hover { color: inherit; }
.up-pie-grilla a:hover { color: var(--naranja-claro); }
.up-pie-desc { color: var(--tenue); font-size: 14.5px; margin-top: 16px; max-width: 34ch; }
.up-pie-final { margin-top: 56px; padding-top: 24px; border-top: 1px solid var(--linea); display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; font-size: 13.5px; color: var(--tenue); }

@media (max-width: 980px) {
  .up-marco { padding: 0 24px; }
  .up-seccion { padding: 76px 0; }
  .up-grilla, .up-grilla-2, .up-pilares { grid-template-columns: 1fr; }
  .up-proyecto { grid-template-columns: 1fr; gap: 36px; }
  .up-proyecto.invertido .up-proyecto-media { order: 0; }
  .up-nav-links { display: none; }
  .up-nav-inner { gap: 12px; }
  .up-nav-fin { gap: 10px; }
  .up-nav-cta { padding: 10px 16px; font-size: 13.5px; }
  .up-hero-contenido { padding: 72px 0; }
  /* la composición en capas del showcase se mantiene (como desktop), sólo escala */
  .up-showcase { margin-top: 40px; padding-bottom: 74px; }
  .up-showcase-duo { padding-bottom: 52px; }
  .up-telefono { width: 30%; max-width: 148px; border-width: 5px; border-radius: 22px; }
  .up-hueco { padding: 76px 0 88px; }
  .up-hueco-cara { grid-template-columns: 1fr; gap: 36px; }
  .up-hueco-tapa, .up-hueco-labio { height: 54px; }
  .up-pie-grilla { grid-template-columns: 1fr 1fr; }
  .up-nube-capa { --nube-ancho: 1100px; }
}
@media (max-width: 560px) {
  .up-nube-capa { --nube-ancho: 820px; }
  .up-nav .up-marca-nombre { display: none; }
  .up-marco { padding: 0 26px; }
  .up-seccion { padding: 64px 0; }
  .up-hero h1 { letter-spacing: -1.4px; }
  .up-hero-sub { font-size: 16px; margin-top: 20px; }
  .up-acciones { margin-top: 30px; }
  .up-acciones .up-btn { width: 100%; max-width: 340px; }
  .up-titulo { letter-spacing: -.8px; }
  .up-bajada { font-size: 15.5px; margin-top: 16px; }
  .up-grilla { margin-top: 40px; gap: 16px; }
  .up-card { padding: 26px 22px 0; }
  .up-card h3 { font-size: 19px; }
  .up-card > p { font-size: 14.5px; }
  .up-pilares { margin-top: 40px; gap: 16px; }
  .up-pilar { padding: 22px 20px; }
  .up-proyecto h3, .up-feature h3 { letter-spacing: -.8px; }
  .up-proj-title { gap: 12px; }
  .up-proj-title .up-logo-chip { width: 46px; height: 46px; }
  .up-hueco { padding: 64px 0 76px; }
  .up-hueco-txt h2 { letter-spacing: -.8px; }
  .up-form { padding: 20px; }
  .up-pie-grilla { grid-template-columns: 1fr; gap: 26px; }
  .up-pie-final { flex-direction: column; gap: 10px; margin-top: 36px; }
  /* showcase más chico y con la barra del navegador compacta */
  .up-showcase { padding-bottom: 56px; }
  .up-showcase-duo { padding-bottom: 40px; }
  .up-showcase-mini { width: 54%; }
  .up-showcase-duo .up-showcase-mini { width: 60%; }
  .up-telefono { width: 36%; border-width: 4px; border-radius: 18px; }
  .up-barra { padding: 8px 10px; gap: 6px; }
  .up-luz { width: 8px; height: 8px; }
  .up-url { padding: 3px 8px; max-width: 74%; font-size: 10.5px; }
}
@media (prefers-reduced-motion: reduce) {
  .up *, .up *::before, .up *::after { transition: none !important; animation: none !important; }
  .up-cielo-par { transform: none !important; }
}
      `}</style>

      <header className={scrolleado ? "up-nav solido" : "up-nav"}>
        <div className="up-marco up-nav-inner">
          <a href="#inicio" className="up-marca">
            <Logo size={32} />
            <span className="up-marca-nombre">UP Softworks</span>
          </a>
          <nav className="up-nav-links">
            {SECCIONES.map((s) => (
              <a href={s.href} key={s.href}>
                {t.nav[s.key]}
              </a>
            ))}
          </nav>
          <div className="up-nav-fin">
            <div
              className="up-lang"
              role="group"
              aria-label="Idioma / Language"
            >
              <button
                type="button"
                className={lang === "es" ? "activo" : ""}
                aria-pressed={lang === "es"}
                onClick={() => setLang("es")}
              >
                ES
              </button>
              <button
                type="button"
                className={lang === "en" ? "activo" : ""}
                aria-pressed={lang === "en"}
                onClick={() => setLang("en")}
              >
                EN
              </button>
            </div>
            <a className="up-nav-cta" href="#contacto">
              {t.nav.cta}
            </a>
          </div>
        </div>
      </header>

      <main id="inicio">
        <section className="up-hero" ref={heroRef}>
          <Cielo />
          <div className="up-marco up-hero-contenido up-centro">
            <h1 className="up-anim">
              {t.hero.h1a}
              <br />
              {t.hero.h1b}
            </h1>
            <p
              className="up-hero-sub up-anim"
              style={{ "--d": ".08s" } as CSSProperties}
            >
              {t.hero.sub}
            </p>
            <div
              className="up-acciones up-anim"
              style={{ "--d": ".16s" } as CSSProperties}
            >
              <a className="up-btn up-btn-lleno" href="#proyectos">
                {t.hero.cta}
              </a>
            </div>
          </div>
        </section>

        <div className="up-hr" aria-hidden="true">
          <div className="up-divisor" />
        </div>

        <section className="up-seccion" id="servicios">
          <div className="up-marco up-centro">
            <h2 className="up-titulo up-anim">
              {t.servicios.h2a}
              <br />
              {t.servicios.h2b}
            </h2>
            <p
              className="up-bajada up-anim"
              style={{ "--d": ".08s" } as CSSProperties}
            >
              {t.servicios.bajada}
            </p>

            <div className="up-grilla">
              <article
                className="up-card up-anim"
                style={{ "--d": "0s" } as CSSProperties}
              >
                <h3>{t.servicios.cards[0].h3}</h3>
                <p>{t.servicios.cards[0].p}</p>
                <div className="up-card-visual">
                  <div className="up-mini up-stagger">
                    {t.servicios.vGestion.map(([k, v], i) => (
                      <div className="up-mini-fila" key={i}>
                        <span>{k}</span>
                        <span className="up-mini-estado">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article
                className="up-card up-anim"
                style={{ "--d": ".12s" } as CSSProperties}
              >
                <h3>{t.servicios.cards[1].h3}</h3>
                <p>{t.servicios.cards[1].p}</p>
                <div className="up-card-visual">
                  <div className="up-flujo-mini up-stagger">
                    <span>{t.servicios.vFlujo[0]}</span>
                    <span className="up-flecha">›</span>
                    <span>{t.servicios.vFlujo[1]}</span>
                    <span className="up-flecha">›</span>
                    <span>{t.servicios.vFlujo[2]}</span>
                  </div>
                </div>
              </article>

              <article
                className="up-card up-anim"
                style={{ "--d": ".24s" } as CSSProperties}
              >
                <h3>{t.servicios.cards[2].h3}</h3>
                <p>{t.servicios.cards[2].p}</p>
                <div className="up-card-visual">
                  <div className="up-barras">
                    {[42, 68, 54, 92, 74, 112].map((h, i) => (
                      <i key={i} style={{ height: h }} />
                    ))}
                  </div>
                </div>
              </article>
            </div>

            <div className="up-grilla up-grilla-2">
              <article
                className="up-card up-anim"
                style={{ "--d": "0s" } as CSSProperties}
              >
                <h3>{t.servicios.cards[3].h3}</h3>
                <p>{t.servicios.cards[3].p}</p>
                <div className="up-card-visual">
                  <div className="up-mini up-stagger">
                    {t.servicios.vWeb.map(([k, v], i) => (
                      <div className="up-mini-fila" key={i}>
                        <span>{k}</span>
                        <span className="up-mini-estado">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article
                className="up-card up-anim"
                style={{ "--d": ".12s" } as CSSProperties}
              >
                <h3>{t.servicios.cards[4].h3}</h3>
                <p>{t.servicios.cards[4].p}</p>
                <div className="up-card-visual">
                  <div className="up-marcas up-stagger">
                    <i style={{ background: "#fd5700" }} />
                    <i style={{ background: "#2f7cf6" }} />
                    <i style={{ background: "#19a974" }} />
                    <i style={{ background: "#8b5cf6" }} />
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <div className="up-hr" aria-hidden="true">
          <div className="up-divisor" />
        </div>

        <section className="up-seccion" id="proyectos">
          <div className="up-marco">
            <div className="up-centro">
              <h2 className="up-titulo up-anim">{t.proyectos.h2}</h2>
              <p
                className="up-bajada up-anim"
                style={{ "--d": ".08s" } as CSSProperties}
              >
                {t.proyectos.bajada}
              </p>
            </div>

            <div style={{ marginTop: 76 }}>
              <article className="up-feature">
                <div className="up-feature-id up-stagger">
                  <div className="up-cliente">{t.proyectos.lvhCliente}</div>
                  <div className="up-proj-title">
                    <img
                      className="up-logo-chip"
                      src="/ligavhlogo.png"
                      alt=""
                      width={56}
                      height={56}
                    />
                    <h3>Liga VH</h3>
                  </div>
                  <p className="up-feature-desc">{t.proyectos.lvhDesc}</p>
                  <TiendasLVH />
                </div>

                <ShowcaseLigaVH onZoom={onZoom} />
              </article>

              <article
                className="up-proyecto invertido"
                style={{ marginTop: 110 }}
              >
                <div className="up-stagger">
                  <div className="up-cliente">{t.proyectos.fdvCliente}</div>
                  <div className="up-proj-title">
                    <img
                      className="up-logo-chip"
                      src="/flechasdevida.png"
                      alt=""
                      width={56}
                      height={56}
                    />
                    <h3>Flechas de Vida</h3>
                  </div>
                  <p>{t.proyectos.fdvP1}</p>
                  <p style={{ marginTop: 16 }}>
                    {t.proyectos.fdvP2a}
                    <em>Programa Flechas de Vida</em>
                    {t.proyectos.fdvP2b}
                  </p>
                </div>
                <div className="up-proyecto-media">
                  <ShowcaseFlechas onZoom={onZoom} />
                </div>
              </article>
            </div>
          </div>
        </section>

        <div className="up-hr" aria-hidden="true">
          <div className="up-divisor" />
        </div>

        <section className="up-seccion" id="enfoque">
          <div className="up-marco up-centro">
            <h2 className="up-titulo up-anim">{t.enfoque.h2}</h2>
            <p
              className="up-bajada up-anim"
              style={{ "--d": ".08s" } as CSSProperties}
            >
              {t.enfoque.bajada}
            </p>
            <div className="up-pilares">
              {t.enfoque.pilares.map((p, i) => (
                <article
                  className="up-pilar up-anim"
                  key={i}
                  style={{ "--d": `${i * 0.1}s` } as CSSProperties}
                >
                  <h4>{p.t}</h4>
                  <p>{p.d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contacto" className="up-hueco">
          <Cielo />
          <svg
            className="up-hueco-tapa"
            viewBox="0 0 1200 74"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 0 H1200 V1 H768 C724 1 724 52 680 52 H520 C476 52 476 1 432 1 H0 Z" />
          </svg>
          <svg
            className="up-hueco-labio"
            viewBox="0 0 1200 74"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 1 H432 C476 1 476 52 520 52 H680 C724 52 724 1 768 1 H1200"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="up-marco up-hueco-inner">
            <div className="up-hueco-cara">
              <div className="up-hueco-txt up-anim">
                <div className="up-cliente">{t.contacto.eyebrow}</div>
                <h2>{t.contacto.h2}</h2>
                <p>{t.contacto.p}</p>
              </div>
              <div
                className="up-anim"
                style={{ "--d": ".1s" } as CSSProperties}
              >
                <FormContacto t={t} />
              </div>
            </div>
          </div>
        </section>

        <footer className="up-marco up-pie">
          <div className="up-pie-grilla up-stagger">
            <div>
              <a href="#inicio" className="up-marca">
                <Logo size={30} />
                UP Softworks
              </a>
              <p className="up-pie-desc">{t.footer.desc}</p>
            </div>
            <div>
              <h5>{t.nav.sitio}</h5>
              {SECCIONES.map((s) => (
                <a href={s.href} key={s.href}>
                  {t.nav[s.key]}
                </a>
              ))}
              <a href="#contacto">{t.nav.contacto}</a>
            </div>
            <div>
              <h5>{t.nav.contacto}</h5>
              <a href={`mailto:${CONFIG.email}`}>{CONFIG.email}</a>
              <span className="up-pie-dato">{CONFIG.ubicacion}</span>
            </div>
          </div>
          <div className="up-pie-final">
            <span>© {new Date().getFullYear()} UP Softworks</span>
          </div>
        </footer>
      </main>

      {zoom && <Lightbox data={zoom} t={t} onClose={() => setZoom(null)} />}
    </div>
  );
}

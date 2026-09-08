import { useEffect, useRef, useState } from "react";

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
};

/* Links a las tiendas de la app de Liga VH */
const TIENDAS_LVH = {
  ios: "https://apps.apple.com/us/app/liga-vh/id6792832834",
  android: "https://play.google.com/store/apps/details?id=com.upsoftworks.lvhapp&hl=es_UY",
};

const STACK_CORTO: string[] = ["React", "Supabase", "PostgreSQL", "PayPal", "Resend", "Vercel"];
const STACK_LARGO: string[] = [
  "React",
  "Vite",
  "Tailwind",
  "Supabase",
  "PostgreSQL",
  "PayPal",
  "Resend",
  "Vercel",
];

const MODULOS_LIGA: string[] = [
  "Torneos y divisionales",
  "Fases y grupos",
  "Equipos y planteles",
  "Fixture y partidos",
  "Goles y tarjetas",
  "Sanciones",
  "Posiciones y goleadores",
  "Documentación",
  "Finanzas",
];

const MODULOS_FDV: string[] = [
  "Inscripciones",
  "Participantes",
  "Pagos",
  "Asistencias",
  "Horarios",
  "Archivos",
  "Venta del ebook",
];

const SECCIONES_NAV: { href: string; texto: string }[] = [
  { href: "#servicios", texto: "Qué hacemos" },
  { href: "#proyectos", texto: "Proyectos" },
  { href: "#tecnologia", texto: "Tecnología" },
];

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

const telefonoPlano = (n: string): string => n.replace(/\D/g, "");

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

interface CieloProps {
  id?: string;
}

function Cielo({ id = "a" }: CieloProps) {
  return (
    <div className="up-cielo" aria-hidden="true">
      <div className="up-cielo-degrade" />
      <div className="up-resplandor" />
      <svg className="up-estrellas" viewBox="0 0 100 52" preserveAspectRatio="none">
        {ESTRELLAS.map((e, i) => (
          <circle key={i} cx={e.x} cy={e.y} r={e.r} fill="#ffe4d0" opacity={e.o} />
        ))}
      </svg>
      <svg className="up-nubes" preserveAspectRatio="none" viewBox="0 0 1200 500">
        <defs>
          <filter id={`nube-cerca-${id}`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.011" numOctaves="6" seed="9" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1
                      0 0 0 0 0.50
                      0 0 0 0 0.16
                      1.5 0 0 0 -0.46"
            />
          </filter>
          <filter id={`nube-lejos-${id}`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0016 0.006" numOctaves="5" seed="23" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1
                      0 0 0 0 0.66
                      0 0 0 0 0.34
                      1.1 0 0 0 -0.50"
            />
          </filter>
          <linearGradient id={`degrade-mascara-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" />
            <stop offset="32%" stopColor="#4a4a4a" />
            <stop offset="64%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#000" />
          </linearGradient>
          <mask id={`mascara-${id}`}>
            <rect width="1200" height="500" fill={`url(#degrade-mascara-${id})`} />
          </mask>
        </defs>
        <g mask={`url(#mascara-${id})`}>
          <rect width="1200" height="500" filter={`url(#nube-lejos-${id})`} opacity="0.5" />
          <rect width="1200" height="500" filter={`url(#nube-cerca-${id})`} opacity="0.7" />
        </g>
      </svg>
    </div>
  );
}

interface NavegadorProps {
  url: string;
  src: string;
  alt: string;
  className?: string;
  lazy?: boolean;
}

function Navegador({ url, src, alt, className, lazy = true }: NavegadorProps) {
  return (
    <div className={className ? `up-mockup ${className}` : "up-mockup"}>
      <div className="up-barra">
        <span className="up-luz" style={{ background: "#ff5f57" }} />
        <span className="up-luz" style={{ background: "#febc2e" }} />
        <span className="up-luz" style={{ background: "#28c840" }} />
        <div className="up-url">{url}</div>
      </div>
      <img className="up-shot" src={src} alt={alt} loading={lazy ? "lazy" : "eager"} />
    </div>
  );
}

function TiendaApple() {
  return (
    <svg viewBox="0 0 16 16" width="17" height="17" fill="currentColor" aria-hidden="true">
      <path d="M11.18 8.44c.02 2.06 1.8 2.74 1.82 2.75-.02.05-.29 1-.94 1.98-.57.86-1.16 1.71-2.09 1.73-.91.02-1.21-.54-2.25-.54s-1.37.52-2.24.56c-.9.03-1.58-.93-2.16-1.78C1.9 11.4 1 8.2 2.21 6.05c.6-1.07 1.67-1.74 2.83-1.76.88-.02 1.71.6 2.25.6s1.55-.74 2.62-.63c.44.02 1.69.18 2.49 1.35-.06.04-1.49.87-1.47 2.6ZM9.44 3.02c.48-.58.8-1.39.71-2.19-.69.03-1.53.46-2.02 1.04-.44.51-.83 1.33-.72 2.11.77.06 1.55-.39 2.03-.96Z" />
    </svg>
  );
}

function TiendaGoogle() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path fill="#00d3ff" d="M1.9 1.3 9 8.4l1.9-1.9L3.3.7C2.7.35 2.1.6 1.9 1.3Z" />
      <path fill="#ffd400" d="M12.6 5.7 10.9 6.5 12.8 8.4l1.7-1c.7-.4.7-1.3 0-1.7l-1.9-1Z" />
      <path fill="#ff3d47" d="M1.9 14.7c.2.7.8.95 1.4.6l7.6-4.4L9 9 1.9 14.7Z" />
      <path fill="#00e676" d="M1.5 1.6C1.45 1.8 1.4 2 1.4 2.2v11.6c0 .2.05.4.1.6L9 8 1.5 1.6Z" />
    </svg>
  );
}

function BotonTienda({ tienda }: { tienda: "ios" | "android" }) {
  const ios = tienda === "ios";
  return (
    <a
      className="up-tienda"
      href={ios ? TIENDAS_LVH.ios : TIENDAS_LVH.android}
      target="_blank"
      rel="noopener"
    >
      {ios ? <TiendaApple /> : <TiendaGoogle />}
      <span>
        <small>{ios ? "Descargala en" : "Disponible en"}</small>
        {ios ? "App Store" : "Google Play"}
      </span>
    </a>
  );
}

function ShowcaseLigaVH() {
  return (
    <div className="up-showcase">
      <Navegador
        url="lvheventos.uy"
        src="/proyecto-ligavh-web.webp"
        alt="Sitio público de Liga VH: resultados, tablas, fixture y estadísticas"
      />
      <Navegador
        className="up-showcase-mini"
        url="admin.lvheventos.uy"
        src="/proyecto-ligavh-admin.webp"
        alt="Panel de gestión de Liga VH: control operativo, deportivo y financiero"
      />
      <div className="up-telefono">
        <img
          src="/app-ligavh-goleadores.webp"
          alt="App de Liga VH para iOS y Android: goleadores del torneo"
          loading="lazy"
        />
      </div>
    </div>
  );
}

function ShowcaseFlechas() {
  return (
    <div className="up-showcase up-showcase-duo">
      <Navegador
        url="flechasdevida.com.uy"
        src="/flechas-web.webp"
        alt="Sitio público de Flechas de Vida"
      />
      <Navegador
        className="up-showcase-mini"
        url="flechasdevida.com.uy/panel"
        src="/proyecto-flechas.webp"
        alt="Panel interno de Flechas de Vida: ficha de una participante"
      />
    </div>
  );
}

export default function UpSoftworksLanding() {
  const [scrolleado, setScrolleado] = useState<boolean>(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = (): void => {
      const y = window.scrollY;
      setScrolleado(y > 40);
      // El cielo del hero se desvanece hacia el fondo oscuro a medida que se scrollea.
      const distancia = window.innerHeight * 0.8 || 640;
      const op = Math.max(0, Math.min(1, 1 - y / distancia));
      heroRef.current?.style.setProperty("--cielo-op", op.toFixed(3));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="up">
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,500;0,600;0,700;0,800;1,800&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

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

/* ---------- nav ---------- */
.up-nav { position: sticky; top: 0; z-index: 40; border-bottom: 1px solid transparent; transition: background .3s ease, border-color .3s ease; }
.up-nav.solido { background: rgba(10,6,4,.84); backdrop-filter: blur(14px); border-bottom-color: var(--linea); }
.up-nav-inner { display: flex; align-items: center; height: 78px; gap: 24px; }
.up-marca { display: flex; align-items: center; gap: 11px; font-family: 'Archivo'; font-weight: 800; font-size: 17px; letter-spacing: -.3px; }
.up-nav-links { display: flex; gap: 6px; margin: 0 auto; }
.up-nav-links a { font-size: 14.5px; color: #e8d8cc; padding: 9px 15px; border-radius: 9px; }
.up-nav-links a:hover { background: rgba(253,87,0,.16); color: #fff; }
.up-nav-cta { background: var(--naranja); color: #fff; font-weight: 600; font-size: 14.5px; padding: 11px 22px; border-radius: 10px; }
.up-nav-cta:hover { background: #ff6f1f; }

/* ---------- cielo ---------- */
.up-hero { position: relative; margin-top: -78px; padding-top: 78px; min-height: 100vh; }
.up-cielo { position: absolute; inset: 0; overflow: hidden; z-index: 0; }
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
.up-cielo-degrade {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, #070403 0%, #0d0705 22%, #1d0c05 44%, #43160a 62%, #2a1207 82%, #120b07 100%);
}
.up-resplandor {
  position: absolute; left: 50%; top: 63%; transform: translate(-50%, -50%);
  width: 132%; height: 60%;
  background: radial-gradient(ellipse at center, rgba(253,87,0,.70) 0%, rgba(253,87,0,.26) 38%, rgba(253,87,0,0) 70%);
  filter: blur(20px);
}
.up-estrellas { position: absolute; top: 0; left: 0; width: 100%; height: 58%; }
.up-nubes { position: absolute; left: -5%; bottom: 0; width: 110%; height: 76%; mix-blend-mode: screen; opacity: .85; }

.up-hero-contenido { position: relative; z-index: 2; padding: 110px 0 120px; }
.up-pildora {
  display: inline-flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.18);
  backdrop-filter: blur(8px); border-radius: 999px;
  padding: 7px 7px 7px 18px; font-size: 13.5px; color: #f3e3d8;
}
.up-pildora b { background: var(--naranja); color: #fff; font-weight: 600; font-size: 12.5px; padding: 5px 13px; border-radius: 999px; }
.up-hero h1 {
  font-size: clamp(42px, 6.2vw, 80px); font-weight: 700; line-height: 1.03;
  letter-spacing: -3px; margin-top: 34px; text-shadow: 0 4px 40px rgba(0,0,0,.55);
}
.up-hero-sub { margin: 26px auto 0; max-width: 58ch; font-size: 18.5px; color: #eadbd0; }
.up-acciones { margin-top: 40px; display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
.up-btn { padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15.5px; border: 1px solid transparent; display: inline-block; }
.up-btn-lleno { background: var(--naranja); color: #fff; box-shadow: 0 10px 34px rgba(253,87,0,.42); }
.up-btn-lleno:hover { background: #ff6f1f; }
.up-btn-claro { background: rgba(255,255,255,.95); color: #1b110b; }
.up-btn-claro:hover { background: #fff; }
.up-btn-linea { border-color: rgba(255,255,255,.3); color: #fff; }
.up-btn-linea:hover { border-color: #fff; background: rgba(255,255,255,.09); }

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

/* showcase: web pública de fondo + panel/ficha chico + (Liga VH) teléfono */
.up-showcase { position: relative; margin-top: 52px; padding-bottom: 92px; }
.up-showcase > .up-mockup { box-shadow: 0 40px 90px rgba(0,0,0,.6); }
.up-showcase-mini { position: absolute; left: 0; bottom: 0; width: 45%; z-index: 2; }
.up-showcase-duo { padding-bottom: 64px; }
.up-showcase-duo .up-showcase-mini {
  width: 52%; cursor: zoom-in;
  transition: width .4s cubic-bezier(.22,.61,.36,1), box-shadow .4s ease;
}
.up-showcase-duo .up-showcase-mini:hover { width: 100%; z-index: 6; cursor: zoom-out; box-shadow: 0 45px 100px rgba(0,0,0,.72); }
.up-proyecto-media .up-showcase { margin-top: 0; }
.up-telefono {
  position: absolute; right: 0; bottom: 0; width: 186px; z-index: 3;
  border: 6px solid #241812; border-radius: 30px; overflow: hidden;
  box-shadow: 0 26px 55px rgba(0,0,0,.6); background: #241812;
}
.up-telefono img { display: block; width: 100%; height: auto; }

/* botones de tienda */
.up-tienda {
  display: inline-flex; align-items: center; gap: 10px; line-height: 1.15; white-space: nowrap;
  background: var(--superficie); border: 1px solid var(--linea); border-radius: 12px; padding: 10px 18px;
}
.up-tienda:hover { border-color: rgba(253,87,0,.5); }
.up-tienda span { display: flex; flex-direction: column; font-family: 'Archivo'; font-weight: 700; font-size: 14px; }
.up-tienda small { font-family: 'IBM Plex Sans'; font-weight: 400; font-size: 10.5px; color: var(--tenue); letter-spacing: .3px; }

/* chip de logo de proyecto */
.up-logo-chip { display: block; width: 56px; height: 56px; border-radius: 15px; object-fit: cover; border: 1px solid var(--linea); margin-bottom: 16px; }

/* ---------- tiras ---------- */
.up-tira { padding: 68px 0 0; text-align: center; }
.up-tira p { font-size: 14px; color: var(--tenue); }
.up-tira-logos { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px 44px; margin-top: 26px; font-family: 'Archivo'; font-weight: 600; font-size: 19px; color: #806a5b; letter-spacing: -.4px; }

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
}
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
.up-barras i { display: block; width: 26px; background: linear-gradient(180deg, var(--naranja) 0%, rgba(253,87,0,.12) 100%); border-radius: 5px 5px 0 0; }
.up-marcas { display: flex; gap: 12px; padding-bottom: 36px; }
.up-marcas i { width: 36px; height: 36px; border-radius: 11px; display: block; }

/* ---------- proyectos ---------- */
.up-proyecto { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; text-align: left; }
.up-proyecto.invertido .up-proyecto-media { order: -1; }
.up-proyecto + .up-proyecto { margin-top: 110px; }
.up-cliente { font-size: 13.5px; color: var(--naranja-claro); font-weight: 500; }
.up-proyecto h3 { font-size: clamp(30px, 3.8vw, 44px); font-weight: 800; letter-spacing: -1.6px; margin-top: 12px; line-height: 1.03; }
.up-proyecto p { color: var(--tenue); margin-top: 18px; font-size: 16px; max-width: 52ch; }
.up-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 28px; }
.up-chip { font-size: 12.5px; padding: 7px 13px; border: 1px solid var(--linea); border-radius: 999px; background: var(--superficie); color: #e6d5c8; }
.up-nota { margin-top: 28px; padding: 16px 20px; border-radius: 12px; background: rgba(253,87,0,.09); border: 1px solid rgba(253,87,0,.26); font-size: 14.5px; color: #e6d5c8; }
.up-nota b { color: #fff; font-weight: 600; }

/* proyecto Liga VH: bloque a lo ancho con los tres productos */
.up-feature { text-align: left; }
.up-feature-head { display: flex; gap: 36px; align-items: flex-start; }
.up-feature-id { max-width: 620px; }
.up-feature-id .up-cliente { margin-top: 0; }
.up-proj-title { display: flex; align-items: center; gap: 16px; margin-top: 8px; }
.up-proj-title .up-logo-chip { margin-bottom: 0; }
.up-proj-title h3 { margin-top: 0; }
.up-feature h3 { font-size: clamp(30px, 3.8vw, 44px); font-weight: 800; letter-spacing: -1.6px; line-height: 1.03; }
.up-feature-desc { color: var(--tenue); margin-top: 16px; font-size: 16px; max-width: 62ch; }
.up-feature-stores { display: flex; flex-direction: column; gap: 12px; flex-shrink: 0; }
.up-feature-foot { display: grid; grid-template-columns: 1.1fr 1fr; gap: 24px 48px; align-items: start; margin-top: 44px; }
.up-feature-foot .up-chips { margin-top: 0; }
.up-feature-foot .up-nota { margin-top: 0; }

/* ---------- cierre ---------- */
.up-cierre { position: relative; border-radius: 26px; overflow: hidden; margin: 0 32px; }
.up-cierre-inner { position: relative; z-index: 2; padding: 112px 32px 120px; text-align: center; }
.up-cierre h2 { font-size: clamp(32px, 4.4vw, 52px); font-weight: 700; letter-spacing: -1.8px; }
.up-cierre-inner p { color: #eadbd0; margin: 20px auto 0; max-width: 48ch; }

.up-pie { padding: 72px 0 40px; border-top: 1px solid var(--linea); margin-top: 100px; }
.up-pie-grilla { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 40px; }
.up-pie-grilla h5 { font-size: 14px; font-weight: 700; margin: 0 0 16px; }
.up-pie-grilla a, .up-pie-dato { display: block; font-size: 14.5px; color: var(--tenue); margin-bottom: 11px; }
.up-pie-grilla a:hover { color: var(--naranja-claro); }
.up-pie-desc { color: var(--tenue); font-size: 14.5px; margin-top: 16px; max-width: 34ch; }
.up-pie-final { margin-top: 56px; padding-top: 24px; border-top: 1px solid var(--linea); display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; font-size: 13.5px; color: var(--tenue); }

@media (max-width: 980px) {
  .up-marco { padding: 0 22px; }
  .up-seccion { padding: 76px 0; }
  .up-grilla, .up-grilla-2 { grid-template-columns: 1fr; }
  .up-proyecto { grid-template-columns: 1fr; gap: 36px; }
  .up-proyecto.invertido .up-proyecto-media { order: 0; }
  .up-proyecto + .up-proyecto { margin-top: 72px; }
  .up-nav-links { display: none; }
  .up-nav-cta { margin-left: auto; }
  .up-hero-contenido { padding: 60px 0 88px; min-height: 0; }
  .up-showcase, .up-showcase-duo { padding-bottom: 0; }
  .up-showcase-mini, .up-showcase-duo .up-showcase-mini { position: static; width: 100%; margin-top: 16px; }
  .up-telefono { position: static; right: auto; bottom: auto; width: 168px; margin: 16px auto 0; }
  .up-feature-head { grid-template-columns: 1fr; gap: 24px; }
  .up-feature-stores { flex-direction: row; flex-wrap: wrap; }
  .up-feature-foot { grid-template-columns: 1fr; }
  .up-cierre { margin: 0 22px; }
  .up-cierre-inner { padding: 80px 22px; }
  .up-pie-grilla { grid-template-columns: 1fr 1fr; }
}
@media (prefers-reduced-motion: reduce) { .up * { transition: none !important; } }
      `}</style>

      <header className={scrolleado ? "up-nav solido" : "up-nav"}>
        <div className="up-marco up-nav-inner">
          <a href="#inicio" className="up-marca">
            <Logo size={32} />
            UP Softworks
          </a>
          <nav className="up-nav-links">
            {SECCIONES_NAV.map((s) => (
              <a href={s.href} key={s.href}>
                {s.texto}
              </a>
            ))}
          </nav>
          <a className="up-nav-cta" href="#contacto">
            Hablemos
          </a>
        </div>
      </header>

      <main id="inicio">
        <section className="up-hero" ref={heroRef}>
          <Cielo id="hero" />
          <div className="up-marco up-hero-contenido up-centro">
            <a className="up-pildora" href="#proyectos">
              Dos plataformas funcionando todos los días
              <b>Ver proyectos</b>
            </a>
            <h1>
              Software a medida para
              <br />
              organizaciones que operan
            </h1>
            <p className="up-hero-sub">
              Diseñamos y desarrollamos las plataformas que sostienen la operación real: paneles de
              gestión, sitios públicos, cobros online y automatizaciones que trabajan solas.
            </p>
            <div className="up-acciones">
              <a className="up-btn up-btn-lleno" href="#contacto">
                Contanos tu proyecto
              </a>
              <a className="up-btn up-btn-claro" href="#proyectos">
                Ver lo que hicimos
              </a>
            </div>
          </div>
        </section>

        <div className="up-marco up-tira">
          <p>Construido con herramientas que aguantan años en producción</p>
          <div className="up-tira-logos">
            {STACK_CORTO.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>

        <section className="up-seccion" id="servicios">
          <div className="up-marco up-centro">
            <h2 className="up-titulo">
              Resolvemos la operación,
              <br />
              no solamente la web.
            </h2>
            <p className="up-bajada">
              Casi siempre el problema no es el sitio: es que el dato vive en cinco planillas, lo que
              ve el público no coincide con lo interno y alguien tiene que hacer a mano lo que
              debería pasar solo.
            </p>

            <div className="up-grilla">
              <article className="up-card">
                <h3>Paneles de gestión</h3>
                <p>
                  Altas, estados, permisos e historial. Todo lo que la organización maneja puertas
                  adentro, en un solo lugar.
                </p>
                <div className="up-card-visual">
                  <div className="up-mini">
                    <div className="up-mini-fila">
                      <span>Fecha 7 cargada</span>
                      <span className="up-mini-estado">Publicado</span>
                    </div>
                    <div className="up-mini-fila">
                      <span>Sanción a revisar</span>
                      <span className="up-mini-estado">Pendiente</span>
                    </div>
                    <div className="up-mini-fila">
                      <span>Alta de plantel</span>
                      <span className="up-mini-estado">Aprobado</span>
                    </div>
                  </div>
                </div>
              </article>

              <article className="up-card">
                <h3>Cobros y entregas automáticas</h3>
                <p>
                  El usuario paga, el sistema registra la operación y le entrega el producto. Nadie
                  interviene.
                </p>
                <div className="up-card-visual">
                  <div className="up-flujo-mini">
                    <span>PayPal</span>
                    <span className="up-flecha">›</span>
                    <span>Supabase</span>
                    <span className="up-flecha">›</span>
                    <span>Resend</span>
                  </div>
                </div>
              </article>

              <article className="up-card">
                <h3>Datos y estadísticas</h3>
                <p>
                  Tablas, rankings, historiales y métricas calculadas sobre la información que el
                  equipo ya carga.
                </p>
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
              <article className="up-card">
                <h3>Sitios y apps públicas</h3>
                <p>
                  La cara visible del proyecto, conectada al mismo dato que la administración carga
                  puertas adentro.
                </p>
                <div className="up-card-visual">
                  <div className="up-mini">
                    <div className="up-mini-fila">
                      <span>Próximo partido</span>
                      <span>Sábado 20:30</span>
                    </div>
                    <div className="up-mini-fila">
                      <span>Goleadores</span>
                      <span className="up-mini-estado">Actualizado</span>
                    </div>
                  </div>
                </div>
              </article>

              <article className="up-card">
                <h3>Producto multi-cliente</h3>
                <p>
                  Una misma base de código para varias organizaciones: cambian marca, configuración y
                  datos.
                </p>
                <div className="up-card-visual">
                  <div className="up-marcas">
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

        <section className="up-seccion" id="proyectos" style={{ paddingTop: 0 }}>
          <div className="up-marco">
            <div className="up-centro">
              <h2 className="up-titulo">Dos proyectos en producción</h2>
              <p className="up-bajada">
                Organizaciones distintas con el mismo problema de fondo: gestionar personas, dinero y
                calendario sin perder el control.
              </p>
            </div>

            <div style={{ marginTop: 76 }}>
              <article className="up-feature">
                <div className="up-feature-head">
                  <div className="up-feature-id">
                    <div className="up-cliente">LVH Eventos</div>
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
                    <p className="up-feature-desc">
                      Plataforma para gestionar y consultar una liga de fútbol amateur de punta a
                      punta. El panel administrativo le da a la organización el control operativo,
                      deportivo y financiero de la competencia; el sitio y la app le sirven a
                      jugadores, delegados e hinchas para seguir torneos, planteles, partidos,
                      posiciones y estadísticas.
                    </p>
                  </div>
                  <div className="up-feature-stores">
                    <BotonTienda tienda="ios" />
                    <BotonTienda tienda="android" />
                  </div>
                </div>

                <ShowcaseLigaVH />

                <div className="up-feature-foot">
                  <div className="up-chips">
                    {MODULOS_LIGA.map((m) => (
                      <span className="up-chip" key={m}>
                        {m}
                      </span>
                    ))}
                  </div>
                  <p className="up-nota">
                    <b>Próximo paso: multi-liga.</b> Otra organización va a poder operar su propia
                    liga sobre la misma base de código, con su marca, su configuración y sus datos, y
                    recibir las mismas actualizaciones.
                  </p>
                </div>
              </article>

              <article className="up-proyecto invertido" style={{ marginTop: 110 }}>
                <div>
                  <div className="up-cliente">Programa de rehabilitación</div>
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
                  <p>
                    Un programa que usa el tiro con arco adaptado como herramienta terapéutica,
                    orientado sobre todo a personas operadas de cáncer de mama con linfedema o riesgo
                    de desarrollarlo. Trabaja movilidad y fuerza del brazo, y también el
                    acompañamiento emocional y la comunidad.
                  </p>
                  <p style={{ marginTop: 16 }}>
                    La web sostiene toda la parte operativa y además vende el ebook{" "}
                    <em>Programa Flechas de Vida</em>, el material de capacitación para profesionales
                    de la salud, entrenadores e instituciones.
                  </p>
                  <div className="up-chips">
                    {MODULOS_FDV.map((m) => (
                      <span className="up-chip" key={m}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="up-proyecto-media">
                  <ShowcaseFlechas />
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="up-seccion" id="tecnologia" style={{ paddingTop: 0 }}>
          <div className="up-marco up-centro">
            <h2 className="up-titulo">Con qué está construido</h2>
            <p className="up-bajada">
              Elegimos herramientas que nos dejan entregar rápido y mantener el sistema por años sin
              depender de infraestructura pesada.
            </p>
            <div className="up-tira-logos" style={{ marginTop: 44 }}>
              {STACK_LARGO.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
        </section>

        <section id="contacto">
          <div className="up-cierre">
            <Cielo id="cierre" />
            <div className="up-cierre-inner">
              <h2>¿Arrancamos?</h2>
              <p>
                Escribinos con el problema, no con la solución. Te respondemos con una propuesta de
                alcance, plazos y precio.
              </p>
              <div className="up-acciones">
                <a className="up-btn up-btn-lleno" href={`mailto:${CONFIG.email}`}>
                  Escribir a {CONFIG.email}
                </a>
                <a
                  className="up-btn up-btn-linea"
                  href={`https://wa.me/${telefonoPlano(CONFIG.whatsapp)}`}
                >
                  Escribir por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="up-marco up-pie">
          <div className="up-pie-grilla">
            <div>
              <a href="#inicio" className="up-marca">
                <Logo size={30} />
                UP Softworks
              </a>
              <p className="up-pie-desc">
                Plataformas a medida para organizaciones que gestionan personas, dinero y calendario.
              </p>
            </div>
            <div>
              <h5>Sitio</h5>
              {SECCIONES_NAV.map((s) => (
                <a href={s.href} key={s.href}>
                  {s.texto}
                </a>
              ))}
              <a href="#contacto">Contacto</a>
            </div>
            <div>
              <h5>Contacto</h5>
              <a href={`mailto:${CONFIG.email}`}>{CONFIG.email}</a>
              <a href={`https://wa.me/${telefonoPlano(CONFIG.whatsapp)}`}>{CONFIG.whatsapp}</a>
              <span className="up-pie-dato">{CONFIG.ubicacion}</span>
            </div>
          </div>
          <div className="up-pie-final">
            <span>© {new Date().getFullYear()} UP Softworks</span>
            <span>Liga VH y Flechas de Vida son marcas de sus respectivas organizaciones.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

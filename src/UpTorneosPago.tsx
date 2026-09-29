import { useEffect, useMemo, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

const CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN as
  | string
  | undefined;
const PRICE_ID = import.meta.env.VITE_PADDLE_PRICE_ID as string | undefined;
const ENVIRONMENT = (import.meta.env.VITE_PADDLE_ENV ?? "sandbox") as
  | "sandbox"
  | "production";

export default function UpTorneosPago() {
  const [paddle, setPaddle] = useState<Paddle>();
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string>("");

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const idLiga = params.get("id_liga") ?? "sandbox-test";
  const email = params.get("email") ?? "";

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!CLIENT_TOKEN) {
        setError("Falta VITE_PADDLE_CLIENT_TOKEN en el .env.");
        setLoading(false);
        return;
      }

      try {
        const instance = await initializePaddle({
          token: CLIENT_TOKEN,
          environment: ENVIRONMENT,
          eventCallback: (event) => {
            if (event.name === "checkout.completed") {
              setCompleted(true);
              setOpening(false);
            }

            if (event.name === "checkout.closed") {
              setOpening(false);
            }

            if (event.name === "checkout.error") {
              setOpening(false);
              setError(
                "Paddle devolvió un error al abrir o procesar el checkout.",
              );
            }
          },
        });

        if (mounted) {
          setPaddle(instance);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (mounted) {
          setError("No se pudo inicializar Paddle.");
          setLoading(false);
        }
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, []);

  function openCheckout() {
    setError("");

    if (!paddle) {
      setError("Paddle todavía no está listo.");
      return;
    }

    if (!PRICE_ID) {
      setError("Falta VITE_PADDLE_PRICE_ID en el .env.");
      return;
    }

    setOpening(true);

    paddle.Checkout.open({
      items: [{ priceId: PRICE_ID, quantity: 1 }],
      customData: {
        id_liga: idLiga,
        producto: "up_torneos",
        modelo_cobro: "usd_1_por_partido",
      },
      ...(email
        ? {
            customer: {
              email,
            },
          }
        : {}),
      settings: {
        displayMode: "overlay",
        variant: "one-page",
        theme: "light",
        locale: "es",
        allowLogout: false,
      },
    });
  }

  return (
    <div className="utp-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

        :root {
          color-scheme: dark;
        }

        body {
          margin: 0;
          min-width: 320px;
          min-height: 100vh;
          background: #07110b;
        }

        .utp-page,
        .utp-page * {
          box-sizing: border-box;
        }

        .utp-page {
          --green: #20d66b;
          --green-2: #0faf52;
          --green-soft: #a8f6c8;
          --base: #07110b;
          --surface: #0c1b12;
          --surface-2: #102619;
          --line: rgba(124, 255, 175, .14);
          --text: #f2fff6;
          --muted: #9db3a5;

          min-height: 100vh;
          color: var(--text);
          font-family: 'IBM Plex Sans', system-ui, sans-serif;
          position: relative;
          overflow: hidden;
        }

        .utp-glow {
          position: fixed;
          width: 760px;
          height: 760px;
          border-radius: 50%;
          left: 50%;
          top: -330px;
          transform: translateX(-50%);
          background: radial-gradient(circle, rgba(32,214,107,.24) 0%, rgba(32,214,107,.08) 38%, transparent 70%);
          filter: blur(8px);
          pointer-events: none;
        }

        .utp-grid {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: .25;
          background-image:
            linear-gradient(rgba(124,255,175,.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,255,175,.055) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: linear-gradient(to bottom, #000, transparent 76%);
        }

        .utp-wrap {
          width: min(1080px, calc(100% - 40px));
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .utp-nav {
          height: 82px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--line);
        }

        .utp-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font: 800 17px/1 'Archivo', sans-serif;
          letter-spacing: -.4px;
        }

        .utp-mark {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: linear-gradient(145deg, #26ee79, #0b9b48);
          color: #041108;
          font: 800 16px/1 'Archivo', sans-serif;
          box-shadow: 0 0 0 1px rgba(255,255,255,.08), 0 8px 30px rgba(32,214,107,.24);
        }

        .utp-test {
          border: 1px solid rgba(124,255,175,.2);
          background: rgba(32,214,107,.08);
          color: var(--green-soft);
          border-radius: 999px;
          padding: 7px 11px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: .2px;
        }

        .utp-main {
          min-height: calc(100vh - 82px);
          display: grid;
          grid-template-columns: 1.08fr .92fr;
          gap: 76px;
          align-items: center;
          padding: 70px 0 90px;
        }

        .utp-kicker {
          color: var(--green-soft);
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.8px;
          margin-bottom: 18px;
        }

        .utp-title {
          font-family: 'Archivo', sans-serif;
          font-size: clamp(46px, 6vw, 76px);
          line-height: .98;
          letter-spacing: -3.4px;
          margin: 0;
          max-width: 760px;
        }

        .utp-title span {
          color: var(--green);
        }

        .utp-sub {
          margin: 24px 0 0;
          color: #c0d1c6;
          max-width: 620px;
          font-size: 18px;
          line-height: 1.65;
        }

        .utp-points {
          display: grid;
          gap: 12px;
          margin-top: 30px;
        }

        .utp-point {
          display: flex;
          gap: 12px;
          align-items: center;
          color: #d7e6dc;
          font-size: 14.5px;
        }

        .utp-dot {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          background: rgba(32,214,107,.12);
          border: 1px solid rgba(32,214,107,.28);
          color: var(--green);
          font-size: 12px;
          font-weight: 800;
        }

        .utp-card {
          background:
            linear-gradient(180deg, rgba(19,47,29,.96), rgba(9,25,15,.98));
          border: 1px solid rgba(124,255,175,.15);
          border-radius: 24px;
          padding: 28px;
          box-shadow:
            0 32px 90px rgba(0,0,0,.42),
            inset 0 1px 0 rgba(255,255,255,.04);
        }

        .utp-card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--line);
        }

        .utp-card-head small {
          color: var(--muted);
          display: block;
          font-size: 12.5px;
          margin-bottom: 6px;
        }

        .utp-card-head strong {
          font: 700 22px/1.1 'Archivo', sans-serif;
        }

        .utp-price {
          text-align: right;
        }

        .utp-price strong {
          font-size: 34px;
          color: var(--green);
          letter-spacing: -1.5px;
        }

        .utp-price span {
          color: var(--muted);
          font-size: 12.5px;
          display: block;
          margin-top: 3px;
        }

        .utp-summary {
          padding: 22px 0;
          display: grid;
          gap: 15px;
        }

        .utp-row {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          font-size: 14px;
        }

        .utp-row span:first-child {
          color: var(--muted);
        }

        .utp-row strong {
          font-weight: 600;
          text-align: right;
        }

        .utp-total {
          padding-top: 17px;
          margin-top: 3px;
          border-top: 1px solid var(--line);
        }

        .utp-total strong {
          color: var(--green-soft);
        }

        .utp-button {
          width: 100%;
          border: 0;
          border-radius: 14px;
          padding: 15px 18px;
          cursor: pointer;
          font: 700 15px/1 'IBM Plex Sans', sans-serif;
          color: #041108;
          background: linear-gradient(135deg, #2bea7b, #16bc5b);
          box-shadow: 0 12px 34px rgba(32,214,107,.22);
          transition: transform .2s ease, filter .2s ease, box-shadow .2s ease;
        }

        .utp-button:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.04);
          box-shadow: 0 18px 40px rgba(32,214,107,.29);
        }

        .utp-button:disabled {
          cursor: wait;
          opacity: .58;
        }

        .utp-secure {
          text-align: center;
          color: var(--muted);
          font-size: 12px;
          margin-top: 13px;
        }

        .utp-error,
        .utp-success {
          margin-top: 16px;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 13px;
          line-height: 1.45;
        }

        .utp-error {
          color: #ffc1b5;
          background: rgba(255,92,64,.09);
          border: 1px solid rgba(255,92,64,.2);
        }

        .utp-success {
          color: #c3ffd9;
          background: rgba(32,214,107,.1);
          border: 1px solid rgba(32,214,107,.24);
        }

        .utp-foot {
          color: #6f8b78;
          font-size: 12px;
          margin-top: 20px;
          text-align: center;
        }

        @media (max-width: 860px) {
          .utp-main {
            grid-template-columns: 1fr;
            gap: 42px;
            padding-top: 50px;
          }

          .utp-title {
            letter-spacing: -2px;
          }
        }

        @media (max-width: 560px) {
          .utp-wrap {
            width: min(100% - 28px, 1080px);
          }

          .utp-nav {
            height: 70px;
          }

          .utp-main {
            min-height: calc(100vh - 70px);
            padding: 40px 0 58px;
          }

          .utp-title {
            font-size: 44px;
            letter-spacing: -1.8px;
          }

          .utp-sub {
            font-size: 16px;
          }

          .utp-card {
            padding: 21px;
            border-radius: 19px;
          }
        }
      `}</style>

      <div className="utp-glow" />
      <div className="utp-grid" />

      <div className="utp-wrap">
        <header className="utp-nav">
          <div className="utp-brand">
            <div className="utp-mark">UP</div>
            <span>UP Torneos</span>
          </div>

          {ENVIRONMENT === "sandbox" && (
            <span className="utp-test">SANDBOX</span>
          )}
        </header>

        <main className="utp-main">
          <section>
            <div className="utp-kicker">Configuración de pagos</div>

            <h1 className="utp-title">
              Tu liga paga
              <br />
              <span>solo cuando juega.</span>
            </h1>

            <p className="utp-sub">
              Asociá un medio de pago a tu liga. No hay abono mensual: UP
              Torneos cobra USD 1 por cada partido disputado y agrupa el consumo
              para su facturación.
            </p>

            <div className="utp-points">
              <div className="utp-point">
                <span className="utp-dot">✓</span>
                Sin costo fijo mensual.
              </div>
              <div className="utp-point">
                <span className="utp-dot">✓</span>
                Cobro basado únicamente en partidos disputados.
              </div>
              <div className="utp-point">
                <span className="utp-dot">✓</span>
                Pago procesado de forma segura por Paddle.
              </div>
            </div>
          </section>

          <aside className="utp-card">
            <div className="utp-card-head">
              <div>
                <small>Producto</small>
                <strong>UP Torneos</strong>
              </div>

              <div className="utp-price">
                <strong>USD 1</strong>
                <span>por partido</span>
              </div>
            </div>

            <div className="utp-summary">
              <div className="utp-row">
                <span>Liga</span>
                <strong>
                  {idLiga === "sandbox-test" ? "Prueba sandbox" : `#${idLiga}`}
                </strong>
              </div>

              <div className="utp-row">
                <span>Abono mensual</span>
                <strong>USD 0</strong>
              </div>

              <div className="utp-row">
                <span>Partido disputado</span>
                <strong>USD 1 c/u</strong>
              </div>

              <div className="utp-row utp-total">
                <span>Hoy</span>
                <strong>USD 0</strong>
              </div>
            </div>

            {completed ? (
              <div className="utp-success">
                Medio de pago configurado correctamente. La suscripción de la
                liga quedó creada en Paddle.
              </div>
            ) : (
              <button
                type="button"
                className="utp-button"
                onClick={openCheckout}
                disabled={loading || opening}
              >
                {loading
                  ? "Preparando Paddle..."
                  : opening
                    ? "Abriendo checkout..."
                    : "Configurar medio de pago"}
              </button>
            )}

            <div className="utp-secure">
              PayPal, tarjeta, Apple Pay o Google Pay según disponibilidad.
            </div>

            {error && <div className="utp-error">{error}</div>}

            <div className="utp-foot">
              En sandbox no se realizan cargos reales.
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

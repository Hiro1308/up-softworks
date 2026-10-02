import { useEffect, useMemo, useState } from "react";

type Factura = {
  id_factura: number;

  periodo: string;

  cantidad_partidos: number;

  importe_original_usd: number;

  descuentos_borrados_usd: number;

  total_usd: number;

  estado_pago: string;

  pagada: boolean;
};

type ResolverResponse = {
  factura?: Factura;

  error?: string;
};

type PayPalCreateOrderResponse = {
  ok?: boolean;
  pagada?: boolean;
  status?: string;
  orderId?: string;
  captureId?: string;
  error?: string;
};

type PayPalCaptureResponse = {
  ok?: boolean;
  pagada?: boolean;
  status?: string;
  orderId?: string;
  captureId?: string;
  error?: string;
};

type PayPalApproveData = {
  orderId: string;
};

type PayPalEligibleMethods = {
  isEligible: (method: string) => boolean;
};

type PayPalPaymentSession = {
  start: (
    options: {
      presentationMode?: "auto" | "popup" | "modal" | "redirect";
    },
    orderPromise: Promise<{ orderId: string }>,
  ) => Promise<unknown>;
};

type PayPalSdkInstance = {
  findEligibleMethods: (options: {
    currencyCode: string;
  }) => Promise<PayPalEligibleMethods>;

  createPayPalOneTimePaymentSession: (options: {
    onApprove: (data: PayPalApproveData) => void | Promise<void>;
    onCancel?: (data: unknown) => void | Promise<void>;
    onError?: (error: unknown) => void | Promise<void>;
  }) => PayPalPaymentSession;
};

type PayPalGlobal = {
  createInstance: (options: {
    clientId: string;
    components?: string[];
    pageType?: "checkout" | "product-details" | "cart" | "mini-cart" | "home";
    locale?: string;
    clientMetadataId?: string;
  }) => Promise<PayPalSdkInstance>;
};

declare global {
  interface Window {
    paypal?: PayPalGlobal;
  }
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID as
  | string
  | undefined;

const PAYPAL_ENV = (import.meta.env.VITE_PAYPAL_ENV ?? "sandbox") as
  | "sandbox"
  | "live";

const PAYPAL_SCRIPT_ID = "paypal-web-sdk-v6";

const PAYPAL_SCRIPT_URL =
  PAYPAL_ENV === "live"
    ? "https://www.paypal.com/web-sdk/v6/core"
    : "https://www.sandbox.paypal.com/web-sdk/v6/core";

async function loadPayPalSdk(): Promise<PayPalGlobal> {
  if (window.paypal?.createInstance) {
    return window.paypal;
  }

  const existing = document.getElementById(
    PAYPAL_SCRIPT_ID,
  ) as HTMLScriptElement | null;

  if (existing) {
    await new Promise<void>((resolve, reject) => {
      if (window.paypal?.createInstance) {
        resolve();
        return;
      }

      const onLoad = () => {
        cleanup();
        resolve();
      };

      const onError = () => {
        cleanup();
        reject(new Error("No se pudo cargar PayPal."));
      };

      const cleanup = () => {
        existing.removeEventListener("load", onLoad);
        existing.removeEventListener("error", onError);
      };

      existing.addEventListener("load", onLoad);
      existing.addEventListener("error", onError);
    });

    if (!window.paypal?.createInstance) {
      throw new Error("PayPal no quedó disponible después de cargar el SDK.");
    }

    return window.paypal;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");

    script.id = PAYPAL_SCRIPT_ID;
    script.src = PAYPAL_SCRIPT_URL;
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar PayPal."));

    document.head.appendChild(script);
  });

  if (!window.paypal?.createInstance) {
    throw new Error("PayPal no quedó disponible después de cargar el SDK.");
  }

  return window.paypal;
}

const IS_DEV = import.meta.env.DEV;

const DEMO_FACTURA: Factura = {
  id_factura: 999,

  periodo: "2026-09-01",

  cantidad_partidos: 18,

  importe_original_usd: 20,

  descuentos_borrados_usd: 2,

  total_usd: 18,

  estado_pago: "pendiente",

  pagada: false,
};

function money(value: unknown) {
  const n = Number(value ?? 0);

  if (!Number.isFinite(n)) {
    return "USD 0,00";
  }

  return `USD ${n.toFixed(2).replace(".", ",")}`;
}

function formatPeriod(period: string) {
  const parts = period.split("-");

  if (parts.length < 2) {
    return period;
  }

  const year = Number(parts[0]);

  const month = Number(parts[1]);

  const months = [
    "Enero",

    "Febrero",

    "Marzo",

    "Abril",

    "Mayo",

    "Junio",

    "Julio",

    "Agosto",

    "Septiembre",

    "Octubre",

    "Noviembre",

    "Diciembre",
  ];

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    month < 1 ||
    month > 12
  ) {
    return period;
  }

  return `${months[month - 1]} ${year}`;
}

function estadoLabel(estado: string) {
  switch (estado) {
    case "pagada":
    case "COMPLETED":
      return "Pagada";

    case "esperando_pago":
    case "APPROVED":
    case "PENDING":
      return "Procesando";

    case "creando_transaccion":
    case "CREATING":
      return "Procesando";

    case "fallida":
    case "DENIED":
    case "FAILED":
    case "CAPTURE_FAILED":
      return "Pago pendiente";

    case "cancelada":
      return "Pendiente";

    case "pendiente":
    case "CREATED":
      return "Pendiente";

    default:
      return "Pendiente";
  }
}

export default function UpTorneosPago() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const token = params.get("t") ?? "";

  /*



   * Solo funciona ejecutando Vite



   * en modo desarrollo.



   *



   * En producción ?demo=1



   * no habilita el modo demo.



   */

  const demo = IS_DEV && params.get("demo") === "1";

  const [factura, setFactura] = useState<Factura | null>(
    demo ? DEMO_FACTURA : null,
  );

  const [loading, setLoading] = useState(!demo);

  const [paying, setPaying] = useState(false);

  const [error, setError] = useState(
    !demo && !PAYPAL_CLIENT_ID
      ? "No se pudo preparar PayPal porque falta VITE_PAYPAL_CLIENT_ID."
      : "",
  );

  const [success, setSuccess] = useState("");

  const [paypalSession, setPaypalSession] =
    useState<PayPalPaymentSession | null>(null);

  const [paypalLoading, setPaypalLoading] = useState(
    !demo && Boolean(PAYPAL_CLIENT_ID),
  );

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  /*

   * Esta página usa su propio título e ícono en la pestaña.

   * Cuando el componente se desmonta, restauramos los originales

   * del sitio de UP Softworks.

   */

  useEffect(() => {
    const previousTitle = document.title;

    const existingFavicon =
      document.querySelector<HTMLLinkElement>('link[rel~="icon"]');

    const previousFaviconHref = existingFavicon?.href ?? null;

    const previousFaviconType = existingFavicon?.type ?? null;

    let favicon = existingFavicon;

    let createdFavicon = false;

    if (!favicon) {
      favicon = document.createElement("link");

      favicon.rel = "icon";

      document.head.appendChild(favicon);

      createdFavicon = true;
    }

    document.title = "UP Torneos · Pago seguro";

    favicon.href = "/uptorneos.png";

    favicon.type = "image/png";

    return () => {
      document.title = previousTitle;

      if (createdFavicon) {
        favicon?.remove();

        return;
      }

      if (favicon && previousFaviconHref) {
        favicon.href = previousFaviconHref;
      }

      if (favicon) {
        if (previousFaviconType) {
          favicon.type = previousFaviconType;
        } else {
          favicon.removeAttribute("type");
        }
      }
    };
  }, []);

  /*
   * PayPal Web SDK v6.
   *
   * El Client ID es público y puede vivir en Vite.
   * El Secret queda únicamente en Supabase.
   *
   * La Order y la captura se hacen siempre del lado servidor.
   */
  useEffect(() => {
    if (demo) {
      return;
    }

    const clientId = PAYPAL_CLIENT_ID;

    if (!clientId) {
      console.error("Falta VITE_PAYPAL_CLIENT_ID.");
      return;
    }

    let active = true;

    async function initPayPal(clientId: string) {
      try {
        const paypal = await loadPayPalSdk();

        if (!active) {
          return;
        }

        const sdk = await paypal.createInstance({
          clientId,
          components: ["paypal-payments"],
          pageType: "checkout",
          locale: "es-UY",
          clientMetadataId:
            typeof crypto.randomUUID === "function"
              ? crypto.randomUUID()
              : `upt-${Date.now()}`,
        });

        if (!active) {
          return;
        }

        const eligible = await sdk.findEligibleMethods({
          currencyCode: "USD",
        });

        if (!eligible.isEligible("paypal")) {
          throw new Error(
            "PayPal no está disponible para este navegador o ubicación.",
          );
        }

        const session = sdk.createPayPalOneTimePaymentSession({
          onApprove: async ({ orderId }) => {
            if (!active) {
              return;
            }

            setSuccess("Pago aprobado. Estamos confirmando la operación...");

            try {
              const captured = await capturePayPalOrder(orderId);

              if (!active) {
                return;
              }

              if (captured.pagada) {
                setFactura((current) =>
                  current
                    ? {
                        ...current,
                        pagada: true,
                        estado_pago: "pagada",
                      }
                    : current,
                );

                setSuccess("");
                await refreshInvoice();
              } else {
                setSuccess(
                  "El pago fue aprobado y está esperando confirmación.",
                );
              }
            } catch (captureError) {
              console.error("PayPal capture:", captureError);

              if (active) {
                setError(
                  captureError instanceof Error
                    ? captureError.message
                    : "No se pudo confirmar el pago de PayPal.",
                );
              }
            } finally {
              if (active) {
                setCheckoutOpen(false);
              }
            }
          },

          onCancel: () => {
            if (!active) {
              return;
            }

            setCheckoutOpen(false);
            setSuccess("");
          },

          onError: (paypalError) => {
            console.error("PayPal checkout:", paypalError);

            if (!active) {
              return;
            }

            setCheckoutOpen(false);
            setError("PayPal no pudo abrir o procesar el checkout.");
          },
        });

        if (active) {
          setPaypalSession(session);
        }
      } catch (e) {
        console.error("PayPal init:", e);

        if (active) {
          setError(
            e instanceof Error
              ? e.message
              : "No se pudo preparar el checkout de PayPal.",
          );
        }
      } finally {
        if (active) {
          setPaypalLoading(false);
        }
      }
    }

    void initPayPal(clientId);

    return () => {
      active = false;
    };
  }, [demo, token]);

  useEffect(() => {
    if (demo) {
      return;
    }

    let mounted = true;

    async function resolveLink() {
      setLoading(true);

      setError("");

      if (!token) {
        setError("Este enlace no es válido o ya no está disponible.");

        setLoading(false);

        return;
      }

      if (!SUPABASE_URL) {
        setError("No se pudo conectar con el servicio.");

        setLoading(false);

        return;
      }

      try {
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/resolver-link-pago`,

          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              token,
            }),
          },
        );

        const json = (await response.json()) as ResolverResponse;

        if (!response.ok) {
          throw new Error(json.error ?? "No se pudo validar el enlace.");
        }

        if (!json.factura) {
          throw new Error("No encontramos la información solicitada.");
        }

        if (mounted) {
          setFactura(json.factura);
        }
      } catch (e) {
        console.error(e);

        if (mounted) {
          setError(
            e instanceof Error
              ? e.message
              : "No se pudo cargar la información.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    resolveLink();

    return () => {
      mounted = false;
    };
  }, [token, demo]);

  async function refreshInvoice(): Promise<Factura | null> {
    if (demo || !token || !SUPABASE_URL) {
      return factura;
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/resolver-link-pago`,

        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            token,
          }),
        },
      );

      const json = (await response.json()) as ResolverResponse;

      if (response.ok && json.factura) {
        setFactura(json.factura);

        return json.factura;
      }
    } catch (e) {
      console.error("No se pudo actualizar la información:", e);
    }

    return null;
  }

  async function createPayPalOrder(): Promise<{ orderId: string }> {
    if (!token || !SUPABASE_URL) {
      throw new Error("No se pudo iniciar la operación.");
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/paypal-crear-order`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          token,
        }),
      },
    );

    const json = (await response.json()) as PayPalCreateOrderResponse;

    if (!response.ok) {
      throw new Error(json.error ?? "PayPal no pudo preparar el pago.");
    }

    if (json.pagada) {
      setFactura((current) =>
        current
          ? {
              ...current,
              pagada: true,
              estado_pago: "pagada",
            }
          : current,
      );

      throw new Error("Esta factura ya está pagada.");
    }

    const orderId = String(json.orderId ?? "").trim();

    if (!orderId) {
      throw new Error("PayPal no devolvió una Order válida.");
    }

    return {
      orderId,
    };
  }

  async function capturePayPalOrder(
    orderId: string,
  ): Promise<PayPalCaptureResponse> {
    if (!token || !SUPABASE_URL) {
      throw new Error("No se pudo confirmar la operación.");
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/paypal-capturar-order`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          token,
          orderId,
        }),
      },
    );

    const json = (await response.json()) as PayPalCaptureResponse;

    if (!response.ok) {
      throw new Error(json.error ?? "PayPal no pudo confirmar el pago.");
    }

    return json;
  }

  async function payInvoice() {
    setError("");
    setSuccess("");

    if (!factura) {
      return;
    }

    if (factura.pagada) {
      setSuccess("Esta gestión ya fue completada.");
      return;
    }

    if (demo) {
      setPaying(true);

      await new Promise((resolve) => setTimeout(resolve, 850));

      setPaying(false);

      setSuccess(
        "Modo demo: la interfaz funciona correctamente. No se realizó ninguna operación real.",
      );

      return;
    }

    if (!token || !SUPABASE_URL) {
      setError("No se pudo iniciar la operación.");
      return;
    }

    if (!PAYPAL_CLIENT_ID) {
      setError("No se pudo cargar PayPal en esta página.");
      return;
    }

    if (!paypalSession) {
      setError("PayPal todavía se está preparando. Intentá nuevamente.");
      return;
    }

    setPaying(true);
    setCheckoutOpen(true);

    try {
      await paypalSession.start(
        {
          presentationMode: "auto",
        },
        createPayPalOrder(),
      );
    } catch (e) {
      console.error("PayPal start:", e);

      const message =
        e instanceof Error ? e.message : "No se pudo completar la operación.";

      if (!message.toLowerCase().includes("ya está pagada")) {
        setError(message);
      }

      await refreshInvoice();
    } finally {
      setCheckoutOpen(false);
      setPaying(false);
    }
  }

  const paid = factura?.pagada === true;

  const estado = factura?.estado_pago ?? "pendiente";

  return (
    <div className="utp-page">
      <style>{`



        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap');


        :root {



          color-scheme: dark;



        }


        html,



        body,



        #root {



          margin: 0;



          min-width: 0;



          width: 100%;



          min-height: 100%;



        }


        body {



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


          width: 100%;



          min-height: 100vh;


          color: var(--text);


          font-family:



            'IBM Plex Sans',



            system-ui,



            sans-serif;


          position: relative;


          overflow-x: hidden;



        }


        .utp-glow {



          position: fixed;


          width: 760px;



          height: 760px;


          border-radius: 50%;


          left: 50%;



          top: -330px;


          transform:



            translateX(-50%);


          background:



            radial-gradient(



              circle,



              rgba(32,214,107,.24) 0%,



              rgba(32,214,107,.08) 38%,



              transparent 70%



            );


          filter:



            blur(8px);


          pointer-events:



            none;



        }


        .utp-grid {



          position:



            fixed;


          inset: 0;


          pointer-events:



            none;


          opacity:



            .25;


          background-image:



            linear-gradient(



              rgba(124,255,175,.055) 1px,



              transparent 1px



            ),



            linear-gradient(



              90deg,



              rgba(124,255,175,.055) 1px,



              transparent 1px



            );


          background-size:



            44px 44px;


          mask-image:



            linear-gradient(



              to bottom,



              #000,



              transparent 76%



            );



        }


        .utp-wrap {



          width:



            min(



              1080px,



              calc(100% - 40px)



            );


          margin:



            0 auto;


          position:



            relative;


          z-index:



            1;



        }


        .utp-nav {



          height:



            82px;


          display:



            flex;


          align-items:



            center;


          justify-content:



            space-between;


          gap:



            16px;


          border-bottom:



            1px solid



            var(--line);



        }


        .utp-brand {



          min-width: 0;


          display:



            flex;


          align-items:



            center;


          gap:



            12px;


          font:



            800 17px/1



            'Archivo',



            sans-serif;


          letter-spacing:



            -.4px;



        }


        .utp-brand span {



          white-space:



            nowrap;



        }


        .utp-logo {



          width:



            42px;


          height:



            42px;


          flex:



            0 0 auto;


          display:



            block;


          object-fit:



            cover;


          border-radius:



            12px;


          box-shadow:



            0 0 0 1px



              rgba(255,255,255,.08),



            0 8px 30px



              rgba(32,214,107,.18);



        }


        .utp-badge {



          flex:



            0 0 auto;


          border:



            1px solid



            rgba(124,255,175,.2);


          background:



            rgba(32,214,107,.08);


          color:



            var(--green-soft);


          border-radius:



            999px;


          padding:



            7px 11px;


          font-size:



            12px;


          font-weight:



            600;


          letter-spacing:



            .2px;


          white-space:



            nowrap;



        }


        .utp-main {



          min-height:



            calc(



              100vh - 82px



            );


          display:



            grid;


          grid-template-columns:



            minmax(0, 1.08fr)



            minmax(340px, .92fr);


          gap:



            76px;


          align-items:



            center;


          padding:



            70px 0 90px;



        }


        .utp-main > section,



        .utp-main > aside {



          min-width:



            0;



        }


        .utp-kicker {



          color:



            var(--green-soft);


          font-size:



            13px;


          font-weight:



            700;


          text-transform:



            uppercase;


          letter-spacing:



            1.8px;


          margin-bottom:



            18px;



        }


        .utp-title {



          font-family:



            'Archivo',



            sans-serif;


          font-size:



            clamp(



              46px,



              6vw,



              76px



            );


          line-height:



            .98;


          letter-spacing:



            -3.4px;


          margin:



            0;


          max-width:



            760px;



        }


        .utp-title span {



          color:



            var(--green);



        }


        .utp-sub {



          margin:



            24px 0 0;


          color:



            #c0d1c6;


          max-width:



            620px;


          font-size:



            18px;


          line-height:



            1.65;



        }


        .utp-points {



          display:



            grid;


          gap:



            12px;


          margin-top:



            30px;



        }


        .utp-point {



          display:



            flex;


          gap:



            12px;


          align-items:



            center;


          color:



            #d7e6dc;


          font-size:



            14.5px;



        }


        .utp-dot {



          width:



            22px;


          height:



            22px;


          border-radius:



            50%;


          flex:



            0 0 auto;


          display:



            grid;


          place-items:



            center;


          background:



            rgba(32,214,107,.12);


          border:



            1px solid



            rgba(32,214,107,.28);


          color:



            var(--green);


          font-size:



            12px;


          font-weight:



            800;



        }


        .utp-card {



          width:



            100%;


          background:



            linear-gradient(



              180deg,



              rgba(19,47,29,.96),



              rgba(9,25,15,.98)



            );


          border:



            1px solid



            rgba(124,255,175,.15);


          border-radius:



            24px;


          padding:



            28px;


          box-shadow:



            0 32px 90px



              rgba(0,0,0,.42),



            inset 0 1px 0



              rgba(255,255,255,.04);



        }


        .utp-card-head {



          display:



            flex;


          align-items:



            flex-start;


          justify-content:



            space-between;


          gap:



            18px;


          padding-bottom:



            24px;


          border-bottom:



            1px solid



            var(--line);



        }


        .utp-card-head small {



          color:



            var(--muted);


          display:



            block;


          font-size:



            12.5px;


          margin-bottom:



            6px;



        }


        .utp-card-head strong {



          font:



            700 22px/1.1



            'Archivo',



            sans-serif;



        }


        .utp-price {



          flex:



            0 0 auto;


          text-align:



            right;



        }


        .utp-price strong {



          font-size:



            34px;


          color:



            var(--green);


          letter-spacing:



            -1.5px;



        }


        .utp-price span {



          color:



            var(--muted);


          font-size:



            12.5px;


          display:



            block;


          margin-top:



            3px;



        }


        .utp-summary {



          padding:



            22px 0;


          display:



            grid;


          gap:



            15px;



        }


        .utp-row {



          min-width:



            0;


          display:



            flex;


          align-items:



            center;


          justify-content:



            space-between;


          gap:



            20px;


          font-size:



            14px;



        }


        .utp-row > span:first-child {



          min-width:



            0;


          color:



            var(--muted);



        }


        .utp-row > strong {



          flex:



            0 0 auto;


          font-weight:



            600;


          text-align:



            right;



        }


        .utp-total {



          padding-top:



            17px;


          margin-top:



            3px;


          border-top:



            1px solid



            var(--line);



        }


        .utp-total strong {



          color:



            var(--green-soft);


          font-size:



            20px;



        }


        .utp-status {



          display:



            inline-flex;


          align-items:



            center;


          gap:



            7px;


          width:



            fit-content;


          border-radius:



            999px;


          padding:



            7px 10px;


          font-size:



            12px;


          font-weight:



            700;


          background:



            rgba(



              255,



              255,



              255,



              .055



            );


          border:



            1px solid



            rgba(



              255,



              255,



              255,



              .08



            );



        }


        .utp-status.paid {



          color:



            #baffd2;


          background:



            rgba(32,214,107,.1);


          border-color:



            rgba(32,214,107,.24);



        }


        .utp-button {



          width:



            100%;


          min-height:



            49px;


          border:



            0;


          border-radius:



            14px;


          padding:



            15px 18px;


          cursor:



            pointer;


          font:



            700 15px/1



            'IBM Plex Sans',



            sans-serif;


          color:



            #041108;


          background:



            linear-gradient(



              135deg,



              #2bea7b,



              #16bc5b



            );


          box-shadow:



            0 12px 34px



              rgba(32,214,107,.22);


          transition:



            transform .2s ease,



            filter .2s ease,



            box-shadow .2s ease;



        }


        .utp-button:hover:not(:disabled) {



          transform:



            translateY(-2px);


          filter:



            brightness(1.04);


          box-shadow:



            0 18px 40px



              rgba(32,214,107,.29);



        }


        .utp-button:disabled {



          cursor:



            default;


          opacity:



            .58;



        }


        .utp-secure {



          text-align:



            center;


          color:



            var(--muted);


          font-size:



            12px;


          margin-top:



            13px;



        }


        .utp-error,



        .utp-success {



          margin-top:



            16px;


          border-radius:



            12px;


          padding:



            12px 14px;


          font-size:



            13px;


          line-height:



            1.45;



        }


        .utp-error {



          color:



            #ffc1b5;


          background:



            rgba(255,92,64,.09);


          border:



            1px solid



            rgba(255,92,64,.2);



        }


        .utp-success {



          color:



            #c3ffd9;


          background:



            rgba(32,214,107,.1);


          border:



            1px solid



            rgba(32,214,107,.24);



        }


        .utp-loading {



          padding:



            70px 20px;


          text-align:



            center;


          color:



            var(--muted);



        }


        .utp-spinner {



          width:



            31px;


          height:



            31px;


          margin:



            0 auto 16px;


          border-radius:



            50%;


          border:



            3px solid



            rgba(32,214,107,.15);


          border-top-color:



            var(--green);


          animation:



            utp-spin



            .8s linear



            infinite;



        }


        @keyframes utp-spin {



          to {



            transform:



              rotate(360deg);



          }



        }


        .utp-invalid {



          text-align:



            center;


          padding:



            45px 25px;



        }


        .utp-invalid strong {



          font:



            700 20px/1.2



            'Archivo',



            sans-serif;



        }


        .utp-invalid p {



          color:



            var(--muted);


          line-height:



            1.5;



        }


        .utp-foot {



          color:



            #6f8b78;


          font-size:



            12px;


          margin-top:



            20px;


          text-align:



            center;



        }


        /*



         * TABLET



         */



        @media (



          max-width: 860px



        ) {



          .utp-wrap {



            width:



              min(



                calc(100% - 32px),



                720px



              );



          }


          .utp-main {



            min-height:



              auto;


            grid-template-columns:



              1fr;


            gap:



              36px;


            align-items:



              stretch;


            padding:



              44px 0 64px;



          }


          .utp-title {



            max-width:



              620px;


            font-size:



              clamp(



                42px,



                9vw,



                60px



              );


            letter-spacing:



              -2px;



          }


          .utp-sub {



            max-width:



              620px;



          }


          .utp-card {



            width:



              100%;



          }



        }


        /*



         * MOBILE



         */



        @media (



          max-width: 560px



        ) {



          .utp-wrap {



            width:



              calc(



                100% - 24px



              );



          }


          .utp-nav {



            height:



              66px;


            gap:



              8px;



          }


          .utp-brand {



            gap:



              9px;


            font-size:



              15px;



          }


          .utp-logo {



            width:



              36px;


            height:



              36px;


            border-radius:



              10px;



          }


          .utp-badge {



            padding:



              6px 9px;


            font-size:



              10px;


            letter-spacing:



              .1px;



          }


          .utp-main {



            min-height:



              auto;


            display:



              block;


            padding:



              30px 0 42px;



          }


          .utp-main > section {



            margin-bottom:



              28px;



          }


          .utp-kicker {



            margin-bottom:



              12px;


            font-size:



              11px;


            letter-spacing:



              1.4px;



          }


          .utp-title {



            font-size:



              clamp(



                38px,



                12vw,



                48px



              );


            line-height:



              1;


            letter-spacing:



              -1.8px;



          }


          .utp-sub {



            margin-top:



              18px;


            font-size:



              15px;


            line-height:



              1.55;



          }


          .utp-points {



            gap:



              10px;


            margin-top:



              22px;



          }


          .utp-point {



            align-items:



              flex-start;


            font-size:



              13px;


            line-height:



              1.45;



          }


          .utp-dot {



            width:



              20px;


            height:



              20px;


            margin-top:



              1px;


            font-size:



              11px;



          }


          .utp-card {



            padding:



              18px;


            border-radius:



              18px;



          }


          .utp-card-head {



            flex-direction:



              column;


            gap:



              12px;


            padding-bottom:



              18px;



          }


          .utp-card-head small {



            font-size:



              11px;



          }


          .utp-card-head strong {



            font-size:



              20px;



          }


          .utp-price {



            width:



              100%;


            text-align:



              left;



          }


          .utp-price strong {



            font-size:



              30px;



          }


          .utp-price span {



            font-size:



              11px;



          }


          .utp-summary {



            gap:



              13px;


            padding:



              18px 0;



          }


          .utp-row {



            align-items:



              flex-start;


            gap:



              12px;


            font-size:



              13px;



          }


          .utp-row > span:first-child {



            flex:



              1 1 auto;



          }


          .utp-row > strong {



            flex:



              0 0 auto;


            max-width:



              52%;


            text-align:



              right;


            overflow-wrap:



              anywhere;



          }


          .utp-status {



            padding:



              6px 8px;


            font-size:



              11px;



          }


          .utp-total {



            padding-top:



              14px;



          }


          .utp-total strong {



            font-size:



              18px;



          }


          .utp-button {



            min-height:



              48px;


            padding:



              14px 16px;


            border-radius:



              13px;


            font-size:



              14px;



          }


          .utp-secure,



          .utp-foot {



            font-size:



              11px;


            line-height:



              1.4;



          }


          .utp-error,



          .utp-success {



            padding:



              11px 12px;


            font-size:



              12px;



          }


          .utp-loading {



            padding:



              48px 14px;



          }


          .utp-invalid {



            padding:



              34px 14px;



          }



        }


        /*



         * CELULARES MUY CHICOS



         */



        @media (



          max-width: 380px



        ) {



          .utp-wrap {



            width:



              calc(



                100% - 18px



              );



          }


          .utp-title {



            font-size:



              36px;



          }


          .utp-brand span {



            display:



              none;



          }


          .utp-card {



            padding:



              15px;



          }


          .utp-row {



            font-size:



              12.5px;



          }


          .utp-row > strong {



            max-width:



              48%;



          }


          .utp-badge {



            font-size:



              9px;



          }



        }



      `}</style>

      <div className="utp-glow" />

      <div className="utp-grid" />

      <div className="utp-wrap">
        <header className="utp-nav">
          <div className="utp-brand">
            <img src="/uptorneos.png" alt="UP Torneos" className="utp-logo" />

            <span>UP Torneos</span>
          </div>

          <span className="utp-badge">
            {demo ? "DEMO LOCAL" : "ENTORNO SEGURO"}
          </span>
        </header>

        <main className="utp-main">
          <section>
            <div className="utp-kicker">Gestión de cuenta</div>

            <h1 className="utp-title">
              Todo claro,
              <br />
              <span>en un solo lugar.</span>
            </h1>

            <p className="utp-sub">
              Revisá el resumen de tu período y completá cualquier gestión
              pendiente de forma simple y segura.
            </p>

            <div className="utp-points">
              <div className="utp-point">
                <span className="utp-dot">✓</span>
                Información clara y actualizada.
              </div>

              <div className="utp-point">
                <span className="utp-dot">✓</span>
                Estado de tu cuenta en tiempo real.
              </div>

              <div className="utp-point">
                <span className="utp-dot">✓</span>
                Operaciones procesadas de forma segura.
              </div>
            </div>
          </section>

          <aside className="utp-card">
            {loading ? (
              <div className="utp-loading">
                <div className="utp-spinner" />
                Cargando información...
              </div>
            ) : error && !factura ? (
              <div className="utp-invalid">
                <strong>No pudimos abrir este enlace</strong>

                <p>{error}</p>

                <p>Volvé a la aplicación y generá un nuevo enlace.</p>
              </div>
            ) : factura ? (
              <>
                <div className="utp-card-head">
                  <div>
                    <small>Resumen del período</small>

                    <strong>{formatPeriod(factura.periodo)}</strong>
                  </div>

                  <div className="utp-price">
                    <strong>{money(factura.total_usd)}</strong>

                    <span>total</span>
                  </div>
                </div>

                <div className="utp-summary">
                  <div className="utp-row">
                    <span>Actividad registrada</span>

                    <strong>{factura.cantidad_partidos}</strong>
                  </div>

                  <div className="utp-row">
                    <span>Importe del período</span>

                    <strong>{money(factura.importe_original_usd)}</strong>
                  </div>

                  {Number(factura.descuentos_borrados_usd) > 0 && (
                    <div className="utp-row">
                      <span>Descuentos aplicados</span>

                      <strong>-{money(factura.descuentos_borrados_usd)}</strong>
                    </div>
                  )}

                  <div className="utp-row">
                    <span>Estado</span>

                    <strong>
                      <span className={`utp-status ${paid ? "paid" : ""}`}>
                        {paid ? "✓ " : ""}

                        {estadoLabel(estado)}
                      </span>
                    </strong>
                  </div>

                  <div className="utp-row utp-total">
                    <span>Total</span>

                    <strong>{money(factura.total_usd)}</strong>
                  </div>
                </div>

                {paid ? (
                  <div className="utp-success">
                    ✓ Esta gestión ya fue completada correctamente.
                  </div>
                ) : (
                  <button
                    type="button"
                    className="utp-button"
                    onClick={payInvoice}
                    disabled={
                      paying ||
                      checkoutOpen ||
                      (!demo && (paypalLoading || !paypalSession))
                    }
                  >
                    {paying
                      ? "Preparando checkout..."
                      : checkoutOpen
                        ? "Checkout abierto"
                        : !demo && paypalLoading
                          ? "Preparando PayPal..."
                          : `Continuar · ${money(factura.total_usd)}`}
                  </button>
                )}

                <div className="utp-secure">
                  Procesado de forma segura mediante PayPal.
                </div>

                {success && !paid && (
                  <div className="utp-success">{success}</div>
                )}

                {error && factura && <div className="utp-error">{error}</div>}

                <div className="utp-foot">
                  {demo
                    ? "Modo demo local · No se realiza ninguna operación real."
                    : "Este enlace es temporal y está asociado únicamente a esta gestión."}
                </div>
              </>
            ) : null}
          </aside>
        </main>
      </div>
    </div>
  );
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import UpSoftworksLanding from "./UpSoftworksLanding.tsx";
import UpTorneosPago from "./UpTorneosPago.tsx";

const path = window.location.pathname.replace(/\/+$/, "") || "/";

if (path === "/pago/resultado") {
  window.location.replace(
    `/pago/resultado/index.html${window.location.search}`,
  );
} else if (path === "/pago/cancelado") {
  window.location.replace(
    `/pago/cancelado/index.html${window.location.search}`,
  );
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      {path === "/pago" ? <UpTorneosPago /> : <UpSoftworksLanding />}
    </StrictMode>,
  );
}
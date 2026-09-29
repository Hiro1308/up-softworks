import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import UpSoftworksLanding from "./UpSoftworksLanding.tsx";
import UpTorneosPago from "./UpTorneosPago.tsx";

const path = window.location.pathname.replace(/\/+$/, "") || "/";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {path === "/pago" ? <UpTorneosPago /> : <UpSoftworksLanding />}
  </StrictMode>,
);

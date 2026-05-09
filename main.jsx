import React from "react"
import { createRoot } from "react-dom/client"
import PaletteIQ from "./PaletteIQ.jsx"

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PaletteIQ />
  </React.StrictMode>
)

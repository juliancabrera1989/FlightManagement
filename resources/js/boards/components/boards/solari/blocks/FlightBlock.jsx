import React from "react";
import SolariCell from "../SolariCell"; 
import SolariLogoCell from "../SolariLogoCell"; 

export default function FlightBlock({
  flight,
  mode,
  airlines = [], // 🎯 Recibimos la lista dinámica desde la base de datos
  onBuildDone,
  onClearDone
}) {
  // Extraemos el ID de la aerolínea objetivo desde Laravel
  const targetAirlineId = flight?.airline?.id || 0; 

  // 🎯 CONSTRUCCIÓN DINÁMICA DEL CHARSET MECÁNICO:
  // Añadimos siempre un elemento vacío al inicio (id: 0) y mapeamos el resto que viene de la DB
  const dynamicCharset = [
    { id: 0, name: "Empty", logo_path: null },
    ...airlines
  ];

  // Código de vuelo (ej: "AA123") padedado a 6 caracteres
  const flightCode = (flight?.flight_number || "").toUpperCase().padEnd(6, " ");

  return (
    <div className="solari-block block-flight">
      
      {/* SECCIÓN A: La Celda Dinámica de Flap de Logos (Le inyectamos el charset dinámico) */}
      <SolariLogoCell 
        mode={mode}
        targetAirlineId={targetAirlineId}
        airlineCharset={dynamicCharset} // 🎯 Pasamos el abecedario de logos real
        onBuildDone={onBuildDone}
        onClearDone={onClearDone}
      />

      {/* SECCIÓN B: Las Celdas Mecánicas del Código de Vuelo */}
      {flightCode.split("").map((char, i) => (
        <SolariCell
          key={i}
          mode={mode}
          targetChar={char}
          animable={char !== " "}
          onBuildDone={onBuildDone}
          onClearDone={onClearDone}
          isNumeric={i >= 2}
        />
      ))}

    </div>
  );
}
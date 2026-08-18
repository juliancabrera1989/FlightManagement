// import React, { useEffect } from "react";
// import SolarisCell from "../SolarisCell";

// export const AIRLINE_CHARSET = [
//   { id: 0, name: "Empty", logo_path: null }, // Módulo vacío de fondo
//   { id: 1, name: "American Airlines", logo_path: "/logos/aa.png" },
//   { id: 2, name: "Delta Air Lines", logo_path: "/logos/dl.png" },
//   { id: 3, name: "United Airlines", logo_path: "/logos/ua.png" },
//   { id: 4, name: "Southwest Airlines", logo_path: "/logos/wn.png" },
//   { id: 5, name: "Alaska Airlines", logo_path: "/logos/as.png" },
//   { id: 6, name: "JetBlue Airways", logo_path: "/logos/b6.png" },
//   { id: 7, name: "Air Canada", logo_path: "/logos/ac.png" },
//   { id: 8, name: "British Airways", logo_path: "/logos/ba.png" },
//   { id: 9, name: "Lufthansa", logo_path: "/logos/lh.png" },
//   { id: 10, name: "KLM Royal Dutch Airlines", logo_path: "/logos/kl.png" },
//   { id: 11, name: "Air France", logo_path: "/logos/af.png" },
//   { id: 12, name: "Emirates", logo_path: "/logos/ek.png" },
//   { id: 13, name: "Qatar Airways", logo_path: "/logos/qr.png" },
//   { id: 14, name: "Singapore Airlines", logo_path: "/logos/sq.png" },
//   { id: 15, name: "Cathay Pacific", logo_path: "/logos/cx.png" },
//   { id: 16, name: "Japan Airlines", logo_path: "/logos/jl.png" },
//   { id: 17, name: "All Nippon Airways", logo_path: "/logos/nh.png" },
//   { id: 18, name: "LATAM Airlines", logo_path: "/logos/la.png" },
//   { id: 19, name: "Qantas", logo_path: "/logos/qf.png" }
// ];




// export default function FlightBlock({
//   flight,
//   mode,
//   onBuildDone,
//   onClearDone
// }) {
//   // 1. Extraemos el código de vuelo (ej: "AA1234") y el path del logo
//   const flightCode = (flight?.flight_code || "").toUpperCase();
  
//   // Extraemos el logo_path que viene de la relación con 'airline' en tu backend Laravel
//   const logoPath = flight?.airline?.logo_path || null;

//   // Aseguramos que el código ocupe exactamente 5 celdas de texto
//   const paddedCode = flightCode.padEnd(5, " ");

//   // 2. Control del ciclo de vida de la animación para el LOGO estático
//   useEffect(() => {
//     if (mode === "BUILD") {
//       // El logo aparece instantáneamente, así que reporta listo al toque
//       onBuildDone();
//     } else if (mode === "CLEAR") {
//       // El logo se limpia instantáneamente, reporta listo al toque
//       onClearDone();
//     }
//   }, [mode, flight]);

//   return (
//     <div className="solari-block block-flight">
      
//       {/* SECCIÓN A: La celda alargada del Logo de la Aerolínea */}
//       <div className="solari-cell-logo">
//         {/* Solo renderizamos la imagen si estamos en modo BUILD o IDLE y existe el path */}
//         {(mode === "BUILD" || mode === "IDLE") && logoPath && (
//           <img 
//             src={`http://127.0.0.1:8000${logoPath}`} 
//             alt={flight?.airline?.name || "Airline logo"} 
//           />
//         )}
//       </div>

//       {/* SECCIÓN B: Las 5 celdas mecánicas para el código de vuelo */}
//       {paddedCode.split("").map((char, i) => (
//         <SolarisCell
//           key={i}
//           mode={mode}
//           targetChar={char}
//           animable={char !== " "}
//           onBuildDone={onBuildDone}
//           onClearDone={onClearDone}
//         />
//       ))}

//     </div>
//   );
// }




// import React from "react";
// import SolariCell from "../SolariCell"; // Tus celdas de caracteres normales
// import SolariLogoCell from "../SolariLogoCell"; // La nueva celda que gira logos


// export const AIRLINE_CHARSET = [
//   { id: 0, name: "Empty", logo_path: null }, // Módulo vacío de fondo
//   { id: 1, name: "American Airlines", logo_path: "/logos/aa.png" },
//   { id: 2, name: "Delta Air Lines", logo_path: "/logos/dl.png" },
//   { id: 3, name: "United Airlines", logo_path: "/logos/ua.png" },
//   { id: 4, name: "Southwest Airlines", logo_path: "/logos/wn.png" },
//   { id: 5, name: "Alaska Airlines", logo_path: "/logos/as.png" },
//   { id: 6, name: "JetBlue Airways", logo_path: "/logos/b6.png" },
//   { id: 7, name: "Air Canada", logo_path: "/logos/ac.png" },
//   { id: 8, name: "British Airways", logo_path: "/logos/ba.png" },
//   { id: 9, name: "Lufthansa", logo_path: "/logos/lh.png" },
//   { id: 10, name: "KLM Royal Dutch Airlines", logo_path: "/logos/kl.png" },
//   { id: 11, name: "Air France", logo_path: "/logos/af.png" },
//   { id: 12, name: "Emirates", logo_path: "/logos/ek.png" },
//   { id: 13, name: "Qatar Airways", logo_path: "/logos/qr.png" },
//   { id: 14, name: "Singapore Airlines", logo_path: "/logos/sq.png" },
//   { id: 15, name: "Cathay Pacific", logo_path: "/logos/cx.png" },
//   { id: 16, name: "Japan Airlines", logo_path: "/logos/jl.png" },
//   { id: 17, name: "All Nippon Airways", logo_path: "/logos/nh.png" },
//   { id: 18, name: "LATAM Airlines", logo_path: "/logos/la.png" },
//   { id: 19, name: "Qantas", logo_path: "/logos/qf.png" }
// ];






// export default function FlightBlock({
//   flight,
//   mode,
//   onBuildDone,
//   onClearDone
// }) {
//   // Extraemos el ID de la aerolínea (target) de la relación Laravel
//   const targetAirlineId = flight?.airline?.id || 0; 

//   // Código de vuelo (ej: "AA123") padedado a 6 caracteres
//   const flightCode = (flight?.flight_number || "").toUpperCase().padEnd(6, " ");

//   return (
//     <div className="solari-block block-flight">
      
//       {/* SECCIÓN A: La Celda Dinámica de Flap de Logos */}
//       <SolariLogoCell 
//         mode={mode}
//         targetAirlineId={targetAirlineId}
//         onBuildDone={onBuildDone}
//         onClearDone={onClearDone}
//       />

//       {/* SECCIÓN B: Las 5 Celdas Mecánicas del Código de Vuelo */}
//       {flightCode.split("").map((char, i) => (
//         <SolariCell
//           key={i}
//           mode={mode}
//           targetChar={char}
//           animable={char !== " "}
//           onBuildDone={onBuildDone}
//           onClearDone={onClearDone}
//           isNumeric={i >= 2}
//         />
//       ))}

//     </div>
//   );
// }

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
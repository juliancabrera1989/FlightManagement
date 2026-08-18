// import { useEffect, useMemo, useState } from "react";
// import SolarisRow from "./SolarisRow";
// import SolarisCell from "./SolarisCell";
// import "./solaris.css";

// const SOLARI_CHARSET = [
//   "1","2","3","4","5","6","7","8","9","0",
//   "A","B","C","D","E","F","G",
//   "H","I","J","K","L","M","N",
//   "O","P","Q","R","S","T","U",
//   "V","W","X","Y","Z",
//   ".", "-", "/"
// ];

// const FIELD_LAYOUT = {
//   time: 4,
//   flight: 6,
//   city: 12,
//   gate: 3
// };

// const PHASES = {
//   BLACK: "BLACK",
//   BUILD: "BUILD",
//   IDLE: "IDLE",
//   CLEAR: "CLEAR"
// };


// export default function SolarisBoard({
//   flights = [],
//   direction = "departures",
//   pageSize = 10,
//   idleDuration = 3000,
//   blackDuration = 800
// }) {

//   useEffect(() => {
//   if (flights?.length) {
//     console.log("FLIGHT SAMPLE:", flights[0])
//   }
// }, [flights])


//   const [phase, setPhase] = useState(PHASES.BLACK);
//   const [pageIndex, setPageIndex] = useState(0);
//   const [cellsTotal, setCellsTotal] = useState(0);
//   const [cellsDone, setCellsDone] = useState(0);

//   /* =========================
//      Página actual
//      ========================= */

//   const pageFlights = useMemo(() => {
//     console.log("Solaris flights sample:", flights?.[0]);
//     return flights.slice(pageIndex, pageIndex + pageSize);
//   }, [flights, pageIndex, pageSize]);

//   /* =========================
//      Construcción del layout
//      ========================= */


//     /* =========================
//      Resolver datos reales del vuelo
//      ========================= */

//   function formatTime(raw) {
//     if (!raw) return "";
//     const match = raw.match(/(\d{2}:\d{2})/);
//     return match ? match[1] : "";
//   }

// function resolveFieldValue(flight, field, direction) {
//   if (!flight) return "";

//   switch (field) {

//     case "time": {
//       const rawTime =
//         direction === "departures"
//           ? flight.departure_time
//           : flight.arrival_time;

//       if (!rawTime) return "";

//       const date = new Date(rawTime);

//       const hours = String(date.getUTCHours()).padStart(2, "0");
//       const minutes = String(date.getUTCMinutes()).padStart(2, "0");

//       return (hours + minutes).toUpperCase(); // "1200"
//     }

//     case "city": {
//       const city =
//         direction === "departures"
//           ? flight.arrival_airport?.city
//           : flight.departure_airport?.city;

//       return city ? city.toUpperCase() : "";
//     }

//     case "airport": {
//       const code =
//         direction === "departures"
//           ? flight.arrival_airport?.code
//           : flight.departure_airport?.code;

//       return code ? code.toUpperCase() : "";
//     }

//     case "flight":
//       return flight.flight_number
//         ? flight.flight_number.toUpperCase()
//         : "";

//     case "airline":
//       return flight.airline?.code
//         ? flight.airline.code.toUpperCase()
//         : "";

//     case "status":
//       return flight.status
//         ? flight.status.toUpperCase()
//         : "";

//     case "gate":
//       return flight.gate
//         ? flight.gate.toUpperCase()
//         : "";

//     case "terminal":
//       return flight.terminal
//         ? flight.terminal.toUpperCase()
//         : "";

//     default:
//       return "";
//   }
// }


   
//   const boardMatrix = useMemo(() => {
//     let total = 0;

//     const rows = pageFlights.map(flight => {
//       const rowCells = [];

//       Object.entries(FIELD_LAYOUT).forEach(([field, size]) => {
//         // const value = flight?.[field] ?? "";
//         const value = resolveFieldValue(flight, field, direction);


//         for (let i = 0; i < size; i++) {
//           const char = value[i] ?? " ";

//           const animable =
//             char !== " " &&
//             SOLARI_CHARSET.includes(char);

//           total += 1;

//           rowCells.push({
//             animable,
//             targetChar: char
//           });
//         }
//       });

//       return rowCells;
//     });

//     setCellsTotal(total);
//     return rows;
//   }, [pageFlights, direction]);

//   /* =========================
//      Callbacks de celdas
//      ========================= */

//   const handleBuildDone = () => {
//     setCellsDone(prev => prev + 1);
//   };

//   const handleClearDone = () => {
//     setCellsDone(prev => prev + 1);
//   };

//   /* =========================
//      Máquina de estados
//      ========================= */

//   // BLACK → BUILD
//   useEffect(() => {
//     if (phase !== PHASES.BLACK) return;

//     setCellsDone(0);

//     const t = setTimeout(() => {
//       setPhase(PHASES.BUILD);
//     }, blackDuration);

//     return () => clearTimeout(t);
//   }, [phase, blackDuration]);

//   // BUILD → IDLE
//   useEffect(() => {
//     if (phase !== PHASES.BUILD) return;
//     if (cellsDone !== cellsTotal) return;

//     setCellsDone(0);
//     setPhase(PHASES.IDLE);
//   }, [phase, cellsDone, cellsTotal]);

//   // IDLE → CLEAR
//   useEffect(() => {
//     if (phase !== PHASES.IDLE) return;

//     const t = setTimeout(() => {
//       setPhase(PHASES.CLEAR);
//     }, idleDuration);

//     return () => clearTimeout(t);
//   }, [phase, idleDuration]);

//   // CLEAR → BLACK (avanza página)
//   useEffect(() => {
//     if (phase !== PHASES.CLEAR) return;
//     if (cellsDone !== cellsTotal) return;

//     setCellsDone(0);

//     setPageIndex(prev => {
//       const next = prev + pageSize;
//       return next >= flights.length ? 0 : next;
//     });

//     setPhase(PHASES.BLACK);
//   }, [phase, cellsDone, cellsTotal, flights.length, pageSize]);



//     useEffect(() => {
//     setPageIndex(0);
//   }, [direction]);

//   /* =========================
//      Render
//      ========================= */

//   if (!flights.length) return null;

//   return (
//     <div className="solari-board">
//       {boardMatrix.map((row, rowIndex) => (
//         <SolarisRow key={rowIndex}>
//           {row.map((cell, cellIndex) => (
//             <SolarisCell
//               key={cellIndex}
//               mode={phase}
//               targetChar={cell.targetChar}
//               animable={cell.animable}
//               onBuildDone={handleBuildDone}
//               onClearDone={handleClearDone}
//             />
//           ))}
//         </SolarisRow>
//       ))}
//     </div>
//   );
// }




// import React from 'react';
// import SolarisSkeleton from './SolarisSkeleton';
// // import "./solaris.css";

// export default function SolarisBoard() {
//   // Retornamos únicamente el esqueleto estático para montar el fondo
//   return <SolarisSkeleton />;
// }















// import { useEffect, useMemo, useState } from "react";
// import SolarisRow from "./SolarisRow";
// import TimeBlock from "./blocks/TimeBlock";
// import RouteBlock from "./blocks/RouteBlock";
// import "./solaris.css";

// const PHASES = {
//   BLACK: "BLACK",
//   BUILD: "BUILD",
//   IDLE: "IDLE",
//   CLEAR: "CLEAR"
// };

// const CELLS_PER_ROW = 4 + 12; // SOLO los bloques actuales

// export default function SolarisBoard({
//   flights = [],
//   direction = "departures",
//   pageSize = 10,
//   idleDuration = 3000,
//   blackDuration = 800
// }) {
  

//   const [phase, setPhase] = useState(PHASES.BLACK);
//   const [pageIndex, setPageIndex] = useState(0);
//   const [cellsTotal, setCellsTotal] = useState(0);
//   const [cellsDone, setCellsDone] = useState(0);

//   const pageFlights = useMemo(() => {
//     return flights.slice(pageIndex, pageIndex + pageSize);
//   }, [flights, pageIndex, pageSize]);

//   useEffect(() => {
//     setCellsTotal(pageFlights.length * CELLS_PER_ROW);
//   }, [pageFlights]);

//   const handleBuildDone = () => {
//     setCellsDone(prev => prev + 1);
//   };

//   const handleClearDone = () => {
//     setCellsDone(prev => prev + 1);
//   };

//   useEffect(() => {
//     if (phase !== PHASES.BLACK) return;
//     setCellsDone(0);
//     const t = setTimeout(() => setPhase(PHASES.BUILD), blackDuration);
//     return () => clearTimeout(t);
//   }, [phase, blackDuration]);

//   useEffect(() => {
//     if (phase !== PHASES.BUILD) return;
//     if (cellsDone !== cellsTotal) return;
//     setCellsDone(0);
//     setPhase(PHASES.IDLE);
//   }, [phase, cellsDone, cellsTotal]);

//   useEffect(() => {
//     if (phase !== PHASES.IDLE) return;
//     const t = setTimeout(() => setPhase(PHASES.CLEAR), idleDuration);
//     return () => clearTimeout(t);
//   }, [phase, idleDuration]);

//   useEffect(() => {
//     if (phase !== PHASES.CLEAR) return;
//     if (cellsDone !== cellsTotal) return;

//     setCellsDone(0);
//     setPageIndex(prev => {
//       const next = prev + pageSize;
//       return next >= flights.length ? 0 : next;
//     });

//     setPhase(PHASES.BLACK);
//   }, [phase, cellsDone, cellsTotal, flights.length, pageSize]);

//   if (!flights.length) return null;


// return (
//     <div className="solari-board">
//       {pageFlights.map((flight, rowIndex) => (
//         <SolarisRow key={rowIndex}>
//           <TimeBlock
//             flight={flight}
//             direction={direction}
//             mode={phase}
//             onBuildDone={handleBuildDone}
//             onClearDone={handleClearDone}
//           />
//           <RouteBlock
//             flight={flight}
//             direction={direction}
//             mode={phase}
//             onBuildDone={handleBuildDone}
//             onClearDone={handleClearDone}
//           />
//         </SolarisRow>
//       ))}
//     </div>
//   );
// }




// import React, { useEffect, useMemo, useState } from "react";
// import SolariRow from "./SolariRow";
// import TimeBlock from "./blocks/TimeBlock";
// import RouteBlock from "./blocks/RouteBlock";
// import FlightBlock from "./blocks/FlightBlock"; // Requerirá crear este bloque para el código del vuelo
// import "./solari-skeleton.css";
// import "./solari.css";

// const PHASES = {
//   BLACK: "BLACK",
//   BUILD: "BUILD",
//   IDLE: "IDLE",
//   CLEAR: "CLEAR"
// };

// // Actualizamos el contador total: 4 (Time) + 12 (To) + 1 (Logo) + 6 (Código Flight)
// const CELLS_PER_ROW = 4 + 12 + 1 + 6; 

// export default function SolarisBoard({
//   flights = [],
//   direction = "departures",
//   pageSize = 10,
//   idleDuration = 3000,
//   blackDuration = 800
// }) {
//   const [phase, setPhase] = useState(PHASES.BLACK);
//   const [pageIndex, setPageIndex] = useState(0);
//   const [cellsTotal, setCellsTotal] = useState(0);
//   const [cellsDone, setCellsDone] = useState(0);

//   const pageFlights = useMemo(() => {
//     return flights.slice(pageIndex, pageIndex + pageSize);
//   }, [flights, pageIndex, pageSize]);

//   useEffect(() => {
//     setCellsTotal(pageFlights.length * CELLS_PER_ROW);
//   }, [pageFlights]);

//   const handleBuildDone = () => setCellsDone(prev => prev + 1);
//   const handleClearDone = () => setCellsDone(prev => prev + 1);

//   useEffect(() => {
//     if (phase !== PHASES.BLACK) return;
//     setCellsDone(0);
//     const t = setTimeout(() => setPhase(PHASES.BUILD), blackDuration);
//     return () => clearTimeout(t);
//   }, [phase, blackDuration]);

//   useEffect(() => {
//     if (phase !== PHASES.BUILD) return;
//     if (cellsDone !== cellsTotal) return;
//     setCellsDone(0);
//     setPhase(PHASES.IDLE);
//   }, [phase, cellsDone, cellsTotal]);

//   useEffect(() => {
//     if (phase !== PHASES.IDLE) return;
//     const t = setTimeout(() => setPhase(PHASES.CLEAR), idleDuration);
//     return () => clearTimeout(t);
//   }, [phase, idleDuration]);

//   useEffect(() => {
//     if (phase !== PHASES.CLEAR) return;
//     if (cellsDone !== cellsTotal) return;

//     setCellsDone(0);
//     setPageIndex(prev => {
//       const next = prev + pageSize;
//       return next >= flights.length ? 0 : next;
//     });
//     setPhase(PHASES.BLACK);
//   }, [phase, cellsDone, cellsTotal, flights.length, pageSize]);

//   // if (!flights.length) return null;

//   return (
//     /* EL CORAZÓN DEL MUEBLE ESTÁTICO AHORA ENVUELVE TODO */
//     <div className="solari-housing">
      
//       {/* HEADER: Remate superior fijo */}
//       <div className="solari-terminal-header">
//         <h1>{direction === "arrivals" ? "ARRIVALS" : "DEPARTURES"}</h1>
//       </div>
      
//       {/* MARQUESINA: Títulos alineados */}
//       <div className="solari-marquee">
//         <div className="marquee-col label-time">TIME</div>
//         <div className="marquee-col label-to">{direction === "arrivals" ? "FROM" : "TO"}</div>
//         <div className="marquee-col label-flight">FLIGHT</div>
//       </div>

//       {/* PANEL PRINCIPAL DINÁMICO */}
//       {/* PANEL PRINCIPAL DINÁMICO */}
// <div className="solari-board-static">
  
//   {/* 1. Tus vuelos reales de la página actual */}
//   {pageFlights.map((flight, rowIndex) => (
//     <SolariRow key={flight?.id || rowIndex} className="solari-row-skeleton">
//       <TimeBlock 
//         flight={flight}
//         direction={direction}
//         mode={phase}
//         onBuildDone={handleBuildDone}
//         onClearDone={handleClearDone}
//       />
//       <RouteBlock
//         flight={flight}
//         direction={direction}
//         mode={phase}
//         onBuildDone={handleBuildDone}
//         onClearDone={handleClearDone}
//       />
//       <FlightBlock
//         flight={flight}
//         mode={phase}
//         onBuildDone={handleBuildDone}
//         onClearDone={handleClearDone}
//       />
//     </SolariRow>
//   ))}

//   {/* 2. EL RELLENO FIJO: Si hay menos de 10 filas en pantalla, completamos con filas fantasma */}
//   {pageFlights.length < pageSize && 
//     Array.from({ length: pageSize - pageFlights.length }).map((_, i) => (
//       <SolariRow key={`blank-row-${i}`} className="solari-row-skeleton empty-row">
        
//         {/* Bloque de Tiempo Vacío (4 celdas apagadas en IDLE) */}
//         <TimeBlock 
//           flight={null} 
//           direction={direction} 
//           mode={PHASES.IDLE} 
//           onBuildDone={() => {}} 
//           onClearDone={() => {}} 
//         />
        
//         {/* Bloque de Ruta Vacío (12 celdas apagadas en IDLE) */}
//         <RouteBlock 
//           flight={null} 
//           direction={direction} 
//           mode={PHASES.IDLE} 
//           onBuildDone={() => {}} 
//           onClearDone={() => {}} 
//         />
        
//         {/* Bloque de Vuelo Vacío (1 logo + 6 celdas apagadas en IDLE) */}
//         <FlightBlock 
//           flight={null} 
//           mode={PHASES.IDLE} 
//           onBuildDone={() => {}} 
//           onClearDone={() => {}} 
//         />

//       </SolariRow>
//     ))
//   }
// </div>
//     </div>
//   );
// }


// import React, { useEffect, useMemo, useState } from "react";
// import SolariRow from "./SolariRow";
// import TimeBlock from "./blocks/TimeBlock";
// import RouteBlock from "./blocks/RouteBlock";
// import FlightBlock from "./blocks/FlightBlock";
// import "./solari-skeleton.css";
// import "./solari.css";

// const PHASES = {
//   BLACK: "BLACK",
//   BUILD: "BUILD",
//   IDLE: "IDLE",
//   CLEAR: "CLEAR"
// };

// const CELLS_PER_ROW = 4 + 12 + 1 + 6; 

// export default function SolarisBoard({
//   flights = [],
//   direction = "departures",
//   pageSize = 10,
//   idleDuration = 3000,
//   blackDuration = 800
// }) {
//   const [phase, setPhase] = useState(PHASES.BLACK);
//   const [pageIndex, setPageIndex] = useState(0);
//   const [cellsTotal, setCellsTotal] = useState(0);
//   const [cellsDone, setCellsDone] = useState(0);

//   // Filtramos los vuelos que entran en la página actual
//   const pageFlights = useMemo(() => {
//     if (!flights || flights.length === 0) return [];
//     return flights.slice(pageIndex, pageIndex + pageSize);
//   }, [flights, pageIndex, pageSize]);

//   // Contamos solo las celdas de los vuelos REALES que se van a animar
//   useEffect(() => {
//     setCellsTotal(pageFlights.length * CELLS_PER_ROW);
//   }, [pageFlights]);

//   const handleBuildDone = () => setCellsDone(prev => prev + 1);
//   const handleClearDone = () => setCellsDone(prev => prev + 1);

//   useEffect(() => {
//     if (phase !== PHASES.BLACK) return;
//     setCellsDone(0);
//     const t = setTimeout(() => setPhase(PHASES.BUILD), blackDuration);
//     return () => clearTimeout(t);
//   }, [phase, blackDuration]);

//   useEffect(() => {
//     if (phase !== PHASES.BUILD) return;
//     if (cellsDone !== cellsTotal) return;
//     setCellsDone(0);
//     setPhase(PHASES.IDLE);
//   }, [phase, cellsDone, cellsTotal]);

//   useEffect(() => {
//     if (phase !== PHASES.IDLE) return;
//     const t = setTimeout(() => setPhase(PHASES.CLEAR), idleDuration);
//     return () => clearTimeout(t);
//   }, [phase, idleDuration]);

//   useEffect(() => {
//     if (phase !== PHASES.CLEAR) return;
//     if (cellsDone !== cellsTotal) return;

//     setCellsDone(0);
//     setPageIndex(prev => {
//       const next = prev + pageSize;
//       return next >= flights.length ? 0 : next;
//     });
//     setPhase(PHASES.BLACK);
//   }, [phase, cellsDone, cellsTotal, flights.length, pageSize]);

//   return (
//     <div className="solari-housing">
      
//       {/* HEADER */}
//       <div className="solari-terminal-header">
//         <h1>{direction === "arrivals" ? "ARRIVALS" : "DEPARTURES"}</h1>
//       </div>
      
//       {/* MARQUESINA */}
//       <div className="solari-marquee">
//         <div className="marquee-col label-time">TIME</div>
//         <div className="marquee-col label-to">{direction === "arrivals" ? "FROM" : "TO"}</div>
//         <div className="marquee-col label-flight">FLIGHT</div>
//       </div>

// {/* PANEL PRINCIPAL UNIFICADO */}
//       <div className="solari-board-static">
//         {
//           // 🎯 ESTRATEGIA: Iteramos siempre 10 veces fijas (pageSize)
//           Array.from({ length: pageSize }).map((_, rowIndex) => {
//             const flight = pageFlights[rowIndex]; // Puede ser el objeto vuelo o undefined

//             // 1. SI HAY VUELO: Renderizamos el renglón con animaciones normales
//             if (flight) {
//               return (
//                 <SolariRow key={flight.id || rowIndex} className="solari-row">
//                   <TimeBlock 
//                     flight={flight}
//                     direction={direction}
//                     mode={phase}
//                     onBuildDone={handleBuildDone}
//                     onClearDone={handleClearDone}
//                   />
//                   <RouteBlock
//                     flight={flight}
//                     direction={direction}
//                     mode={phase}
//                     onBuildDone={handleBuildDone}
//                     onClearDone={handleClearDone}
//                   />
//                   <FlightBlock
//                     flight={flight}
//                     mode={phase}
//                     onBuildDone={handleBuildDone}
//                     onClearDone={handleClearDone}
//                   />
//                 </SolariRow>
//               );
//             }

//             // 2. NO HAY VUELO (Relleno o carga inicial): Renglón estático con plaquetas negras
//             return (
//               <SolariRow key={`blank-row-${rowIndex}`} className="solari-row empty-row">
                
//                 {/* Bloque de Tiempo Apagado (4 celdas vacías) */}
//                 <div className="solari-block block-time">
//                   {[" ", " ", " ", " "].map((_, idx) => (
//                     <React.Fragment key={idx}>
//                       <div className="solari-cell cell-empty-black"></div>
//                       {idx === 1 && <div className="solari-time-divider">:</div>}
//                     </React.Fragment>
//                   ))}
//                 </div>
                
//                 {/* Bloque de Ruta Apagado (12 celdas vacías) - Corregido a solari-destination */}
//                 <div className="solari-block solari-destination">
//                   {Array.from({ length: 12 }).map((_, idx) => (
//                     <div key={idx} className="solari-cell cell-empty-black"></div>
//                   ))}
//                 </div>
                
//                 {/* Bloque de Vuelo/Logo Apagado (1 logo + 6 celdas vacías) - Corregido a block-flight y solari-cell-logo */}
//                 <div className="solari-block block-flight">
//                   <div className="solari-cell-logo logo-empty-black"></div>
//                   {Array.from({ length: 6 }).map((_, idx) => (
//                     <div key={idx} className="solari-cell cell-empty-black"></div>
//                   ))}
//                 </div>

//               </SolariRow>
//             );
//           })
//         }
//       </div>
//     </div>
//   );
// }



import React, { useEffect, useMemo, useState } from "react";
import SolariRow from "./SolariRow";
import TimeBlock from "./blocks/TimeBlock";
import RouteBlock from "./blocks/RouteBlock";
import FlightBlock from "./blocks/FlightBlock";
import "./solari-skeleton.css";
import "./solari.css";

const PHASES = {
  BLACK: "BLACK",
  BUILD: "BUILD",
  IDLE: "IDLE",
  CLEAR: "CLEAR"
};

const CELLS_PER_ROW = 4 + 12 + 1 + 6; 

export default function SolarisBoard({
  flights = [],
  airlines = [], // 🎯 RECIBIMOS EL CATÁLOGO COMPLETO DE LA BASE DE DATOS
  direction = "departures",
  pageSize = 10,
  idleDuration = 3000,
  blackDuration = 800
}) {
  const [phase, setPhase] = useState(PHASES.BLACK);
  const [pageIndex, setPageIndex] = useState(0);
  const [cellsTotal, setCellsTotal] = useState(0);
  const [cellsDone, setCellsDone] = useState(0);

  // Filtramos los vuelos que entran en la página actual
  const pageFlights = useMemo(() => {
    if (!flights || flights.length === 0) return [];
    return flights.slice(pageIndex, pageIndex + pageSize);
  }, [flights, pageIndex, pageSize]);

  // Contamos solo las celdas de los vuelos REALES que se van a animar
  useEffect(() => {
    setCellsTotal(pageFlights.length * CELLS_PER_ROW);
  }, [pageFlights]);

  const handleBuildDone = () => setCellsDone(prev => prev + 1);
  const handleClearDone = () => setCellsDone(prev => prev + 1);

  useEffect(() => {
    if (phase !== PHASES.BLACK) return;
    setCellsDone(0);
    const t = setTimeout(() => setPhase(PHASES.BUILD), blackDuration);
    return () => clearTimeout(t);
  }, [phase, blackDuration]);

  useEffect(() => {
    if (phase !== PHASES.BUILD) return;
    if (cellsDone !== cellsTotal) return;
    setCellsDone(0);
    setPhase(PHASES.IDLE);
  }, [phase, cellsDone, cellsTotal]);

  useEffect(() => {
    if (phase !== PHASES.IDLE) return;
    const t = setTimeout(() => setPhase(PHASES.CLEAR), idleDuration);
    return () => clearTimeout(t);
  }, [phase, idleDuration]);

  useEffect(() => {
    if (phase !== PHASES.CLEAR) return;
    if (cellsDone !== cellsTotal) return;

    setCellsDone(0);
    setPageIndex(prev => {
      const next = prev + pageSize;
      return next >= flights.length ? 0 : next;
    });
    setPhase(PHASES.BLACK);
  }, [phase, cellsDone, cellsTotal, flights.length, pageSize]);

  return (
    <div className="solari-housing">
      
      {/* HEADER */}
      <div className="solari-terminal-header">
        <h1>{direction === "arrivals" ? "ARRIVALS" : "DEPARTURES"}</h1>
      </div>
      
      {/* MARQUESINA */}
      <div className="solari-marquee">
        <div className="marquee-col label-time">TIME</div>
        <div className="marquee-col label-to">{direction === "arrivals" ? "FROM" : "TO"}</div>
        <div className="marquee-col label-flight">FLIGHT</div>
      </div>

      {/* PANEL PRINCIPAL UNIFICADO */}
      <div className="solari-board-static">
        {
          // Iteramos siempre 10 veces fijas (pageSize)
          Array.from({ length: pageSize }).map((_, rowIndex) => {
            const flight = pageFlights[rowIndex]; 

            // 1. SI HAY VUELO: Renglón dinámico con animaciones
            if (flight) {
              return (
                <SolariRow key={flight.id || rowIndex} className="solari-row">
                  <TimeBlock 
                    flight={flight}
                    direction={direction}
                    mode={phase}
                    onBuildDone={handleBuildDone}
                    onClearDone={handleClearDone}
                  />
                  <RouteBlock
                    flight={flight}
                    direction={direction}
                    mode={phase}
                    onBuildDone={handleBuildDone}
                    onClearDone={handleClearDone}
                  />
                  <FlightBlock
                    flight={flight}
                    mode={phase}
                    airlines={airlines} // 🎯 INYECTAMOS LA LISTA DINÁMICA DIRECTO AL RECUADRO DE VUELO
                    onBuildDone={handleBuildDone}
                    onClearDone={handleClearDone}
                  />
                </SolariRow>
              );
            }

            // 2. NO HAY VUELO: Renglón estático con plaquetas negras
            return (
              <SolariRow key={`blank-row-${rowIndex}`} className="solari-row empty-row">
                
                {/* Bloque de Tiempo Apagado */}
                <div className="solari-block block-time">
                  {[" ", " ", " ", " "].map((_, idx) => (
                    <React.Fragment key={idx}>
                      <div className="solari-cell cell-empty-black"></div>
                      {idx === 1 && <div className="solari-time-divider">:</div>}
                    </React.Fragment>
                  ))}
                </div>
                
                {/* Bloque de Ruta Apagado */}
                <div className="solari-block solari-destination">
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <div key={idx} className="solari-cell cell-empty-black"></div>
                  ))}
                </div>
                
                {/* Bloque de Vuelo/Logo Apagado */}
                <div className="solari-block block-flight">
                  <div className="solari-cell-logo logo-empty-black"></div>
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="solari-cell cell-empty-black"></div>
                  ))}
                </div>

              </SolariRow>
            );
          })
        }
      </div>
    </div>
  );
}
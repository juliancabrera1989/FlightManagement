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
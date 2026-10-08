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

const CELLS_PER_ROW = 4 + 12 + 1 + 6; // 23 celdas

export default function SolarisBoard({
  flights = [],
  airlines = [],
  direction = "departures",
  pageSize = 10,
  idleDuration = 4000,
  blackDuration = 600
}) {
  const [phase, setPhase] = useState(PHASES.BLACK);
  const [pageIndex, setPageIndex] = useState(0);
  const [cellsTotal, setCellsTotal] = useState(0);
  const [cellsDone, setCellsDone] = useState(0);

  // Reinicio si cambia la lista total de vuelos
  useEffect(() => {
    setPageIndex(0);
    setPhase(PHASES.BLACK);
    setCellsDone(0);
  }, [flights]);

  // Vuelos de la página actual
  const pageFlights = useMemo(() => {
    if (!flights || flights.length === 0) return [];
    return flights.slice(pageIndex, pageIndex + pageSize);
  }, [flights, pageIndex, pageSize]);

  // Total de celdas activas
  useEffect(() => {
    setCellsTotal(pageFlights.length * CELLS_PER_ROW);
  }, [pageFlights]);

  const handleDone = () => setCellsDone(prev => prev + 1);

  // FASE 1: BLACK -> BUILD
  useEffect(() => {
    if (phase !== PHASES.BLACK) return;
    setCellsDone(0);
    const t = setTimeout(() => setPhase(PHASES.BUILD), blackDuration);
    return () => clearTimeout(t);
  }, [phase, blackDuration]);

  // FASE 2: BUILD -> IDLE (Sincronizado por celdas + Timeout de seguridad)
  useEffect(() => {
    if (phase !== PHASES.BUILD) return;

    if (cellsTotal > 0 && cellsDone >= cellsTotal) {
      setCellsDone(0);
      setPhase(PHASES.IDLE);
      return;
    }

    // Safety Timeout: Si tras 4.5 segundos alguna celda no respondió, forzar IDLE
    const safetyTimer = setTimeout(() => {
      setCellsDone(0);
      setPhase(PHASES.IDLE);
    }, 4500);

    return () => clearTimeout(safetyTimer);
  }, [phase, cellsDone, cellsTotal]);

  // FASE 3: IDLE -> CLEAR
  useEffect(() => {
    if (phase !== PHASES.IDLE) return;
    const t = setTimeout(() => {
      setCellsDone(0);
      setPhase(PHASES.CLEAR);
    }, idleDuration);
    return () => clearTimeout(t);
  }, [phase, idleDuration]);

  // FASE 4: CLEAR -> NEXT PAGE & BLACK
  useEffect(() => {
    if (phase !== PHASES.CLEAR) return;

    const advanceToNextPage = () => {
      setCellsDone(0);
      setPageIndex(prev => {
        const next = prev + pageSize;
        return next >= flights.length ? 0 : next;
      });
      setPhase(PHASES.BLACK);
    };

    if (cellsTotal > 0 && cellsDone >= cellsTotal) {
      advanceToNextPage();
      return;
    }

    // Safety Timeout: Si alguna celda no terminó de limpiar en 3 seg, avanzar igual
    const safetyTimer = setTimeout(advanceToNextPage, 3000);

    return () => clearTimeout(safetyTimer);
  }, [phase, cellsDone, cellsTotal, flights.length, pageSize]);

  return (
    <div className="solari-housing">
      <div className="solari-terminal-header">
        <h1>{direction === "arrivals" ? "ARRIVALS" : "DEPARTURES"}</h1>
      </div>
      
      <div className="solari-marquee">
        <div className="marquee-col label-time">TIME</div>
        <div className="marquee-col label-to">{direction === "arrivals" ? "FROM" : "TO"}</div>
        <div className="marquee-col label-flight">FLIGHT</div>
      </div>

      <div className="solari-board-static">
        {
          Array.from({ length: pageSize }).map((_, rowIndex) => {
            const flight = pageFlights[rowIndex]; 

            if (flight) {
              return (
                <SolariRow key={flight.id || `flight-${pageIndex}-${rowIndex}`} className="solari-row">
                  <TimeBlock 
                    flight={flight}
                    direction={direction}
                    mode={phase}
                    onBuildDone={handleDone}
                    onClearDone={handleDone}
                  />
                  <RouteBlock
                    flight={flight}
                    direction={direction}
                    mode={phase}
                    onBuildDone={handleDone}
                    onClearDone={handleDone}
                  />
                  <FlightBlock
                    flight={flight}
                    mode={phase}
                    airlines={airlines}
                    onBuildDone={handleDone}
                    onClearDone={handleDone}
                  />
                </SolariRow>
              );
            }

            return (
              <SolariRow key={`blank-row-${rowIndex}`} className="solari-row empty-row">
                <div className="solari-block block-time">
                  {[" ", " ", " ", " "].map((_, idx) => (
                    <React.Fragment key={idx}>
                      <div className="solari-cell cell-empty-black"></div>
                      {idx === 1 && <div className="solari-time-divider">:</div>}
                    </React.Fragment>
                  ))}
                </div>
                
                <div className="solari-block solari-destination">
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <div key={idx} className="solari-cell cell-empty-black"></div>
                  ))}
                </div>
                
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
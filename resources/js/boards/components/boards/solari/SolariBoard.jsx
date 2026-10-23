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

export default function SolarisBoard({
  flights = [],
  airlines = [],
  direction = "departures",
  pageSize = 10,
  idleDuration = 4000,
  blackDuration = 600,
  buildDuration = 6500 // 🎯 Tiempo holgado para que CUALQUIER letra (Y, Z) llegue sin apuros
}) {
  const [phase, setPhase] = useState(PHASES.BLACK);
  const [pageIndex, setPageIndex] = useState(0);

  // Reinicio si cambia la lista total de vuelos
  useEffect(() => {
    setPageIndex(0);
    setPhase(PHASES.BLACK);
  }, [flights]);

  // Vuelos de la página actual
  const pageFlights = useMemo(() => {
    if (!flights || flights.length === 0) return [];
    return flights.slice(pageIndex, pageIndex + pageSize);
  }, [flights, pageIndex, pageSize]);

  // FASE 1: BLACK -> BUILD
  useEffect(() => {
    if (phase !== PHASES.BLACK) return;
    const t = setTimeout(() => setPhase(PHASES.BUILD), blackDuration);
    return () => clearTimeout(t);
  }, [phase, blackDuration]);

  // FASE 2: BUILD -> IDLE (Por tiempo holgado: sin apurar a las celdas largas)
  useEffect(() => {
    if (phase !== PHASES.BUILD) return;
    const t = setTimeout(() => setPhase(PHASES.IDLE), buildDuration);
    return () => clearTimeout(t);
  }, [phase, buildDuration]);

  // FASE 3: IDLE -> CLEAR
  useEffect(() => {
    if (phase !== PHASES.IDLE) return;
    const t = setTimeout(() => setPhase(PHASES.CLEAR), idleDuration);
    return () => clearTimeout(t);
  }, [phase, idleDuration]);

  // FASE 4: CLEAR -> NEXT PAGE & BLACK (Por tiempo holgado de limpieza)
  useEffect(() => {
    if (phase !== PHASES.CLEAR) return;

    const t = setTimeout(() => {
      setPageIndex(prev => {
        const next = prev + pageSize;
        return next >= flights.length ? 0 : next;
      });
      setPhase(PHASES.BLACK);
    }, 10000);

    return () => clearTimeout(t);
  }, [phase, flights.length, pageSize]);

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
                <SolariRow key={flight.id || `flight-${pageIndex}-${rowIndex}`}>
                  <TimeBlock 
                    flight={flight}
                    direction={direction}
                    mode={phase}
                  />
                  <RouteBlock
                    flight={flight}
                    direction={direction}
                    mode={phase}
                  />
                  <FlightBlock
                    flight={flight}
                    mode={phase}
                    airlines={airlines}
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
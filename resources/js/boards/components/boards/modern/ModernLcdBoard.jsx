import { useState, useEffect } from "react";
import LcdRow from "./LcdRow";
import "./modern-lcd.css";

export default function ModernLcdBoard({
  flights = [],
  direction = "departures",
  visibleCount = 10,
  holdMs = 4000
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Generamos el set de vuelos que se van a mostrar en las N filas
  const visibleFlights = flights.slice(currentIndex, currentIndex + visibleCount);

  useEffect(() => {
    if (flights.length <= visibleCount) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        // Si nos pasamos del total, volvemos al principio (bucle infinito de cartel)
        return nextIndex + visibleCount > flights.length ? 0 : nextIndex;
      });
    }, holdMs);

    return () => clearInterval(interval);
  }, [flights, visibleCount, holdMs]);

  const title = direction?.toLowerCase().startsWith("dep") ? "DEPARTURES" : "ARRIVALS";

  return (
    <div className="lcd-board-container">
      {/* HEADER SUPERIOR ESTILO PRAGA */}
      <div className="lcd-header">
        <div className="lcd-header-title">{title}</div>
        <div className="lcd-clock">20:51</div> {/* Mock de reloj estático o dinámico */}
      </div>

      {/* MARQUESINA DE COLUMNAS */}
      <div className="lcd-marquee">
        <div className="lcd-col-label col-time">TIME</div>
        <div className="lcd-col-label col-dest">
          {direction?.toLowerCase().startsWith("dep") ? "DESTINATION" : "ORIGIN"}
        </div>
        <div className="lcd-col-label col-flight">FLIGHT</div>
        <div className="lcd-col-label col-gate">GATE</div>
        <div className="lcd-col-label col-remark">REMARK</div>
      </div>

      {/* GRILA DE FILAS INTERCALADAS */}
      <div className="lcd-rows-grid">
        {Array.from({ length: visibleCount }).map((_, i) => {
          const flight = visibleFlights[i] || null;
          return (
            <LcdRow 
              key={i} 
              flight={flight} 
              direction={direction} /* <--- AGREGAMOS ESTO */
              isEven={i % 2 === 0} 
            />
          );
        })}
      </div>
    </div>
  );
}
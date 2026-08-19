import { useState, useEffect } from "react";

export default function LcdRow({ flight, direction, isEven }) { // <--- Recibimos 'direction'
  const [displayFlight, setDisplayFlight] = useState(flight);
  const [animationClass, setAnimationClass] = useState("fade-in");

  useEffect(() => {
    setAnimationClass("fade-out");

    const timer = setTimeout(() => {
      setDisplayFlight(flight);
      setAnimationClass("fade-in");
    }, 400);

    return () => clearTimeout(timer);
  }, [flight]);

  if (!displayFlight) {
    return <div className={`lcd-row ${isEven ? "even" : "odd"}`} />;
  }

  // 1. EXTRAEMOS LA CIUDAD DE MANERA IDÉNTICA A TUS OTROS TABLEROS
  const city =
    direction === "arrivals"
      ? (displayFlight.departure_airport?.city || displayFlight.origin || "")
      : (displayFlight.arrival_airport?.city || displayFlight.destination || "");

  // 2. EXTRAEMOS LA HORA DE SALIDA O ARRIBO DE TU BD
  const formatTime = (flightObj) => {
    const raw =
      direction === "arrivals"
        ? (flightObj.arrival_time || flightObj.time || "")
        : (flightObj.departure_time || flightObj.time || "");

    const m = raw.match(/(\d{2}:\d{2})/);
    return (m && m[1]) || raw.slice(11, 16) || raw || "--:--";
  };

  const getStatusClass = (status) => {
    const s = status?.toUpperCase();
    if (s?.includes("DELAYED") || s?.includes("CANCELLED")) return "status-delayed";
    if (s?.includes("BOARDING") || s?.includes("CALL")) return "status-active";
    return "status-ontime";
  };

  return (
    <div className={`lcd-row ${isEven ? "even" : "odd"} ${animationClass}`}>
      {/* Hora formateada dinámicamente */}
      <div className="lcd-cell col-time">{formatTime(displayFlight)}</div>
      
      {/* ¡Ciudad real recuperada de los objetos anidados! */}
      <div className="lcd-cell col-dest">{city.toUpperCase() || "UNKNOWN"}</div>
      
      {/* Nro de Vuelo de tu BD */}
      <div className="lcd-cell col-flight">{displayFlight.flight_number}</div>
      
      {/* Compuerta de tu BD */}
      <div className="lcd-cell col-gate">{displayFlight.gate || "--"}</div>
      
      {/* Estado con color de tu BD */}
      <div className={`lcd-cell col-remark ${getStatusClass(displayFlight.status)}`}>
        {displayFlight.status}
      </div>
    </div>
  );
}
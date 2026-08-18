// import { useState, useEffect } from "react";

// export default function LcdRow({ flight, isEven }) {
//   const [displayFlight, setDisplayFlight] = useState(flight);
//   const [animationClass, setAnimationClass] = useState("fade-in");

//   useEffect(() => {
//     // Si el vuelo cambia, disparamos la transición estética
//     setAnimationClass("fade-out");

//     const timer = setTimeout(() => {
//       setDisplayFlight(flight);
//       setAnimationClass("fade-in");
//     }, 400); // Mitad del tiempo para hacer el cambiazo a ciegas

//     return () => clearTimeout(timer);
//   }, [flight]);

//   // Si no hay vuelo para esta fila, renderizamos una celda vacía pero estructural
//   if (!displayFlight) {
//     return <div className={`lcd-row ${isEven ? "even" : "odd"}`} />;
//   }

//   return (
//     <div className={`lcd-row ${isEven ? "even" : "odd"} ${animationClass}`}>
//       <div className="lcd-cell col-time">{displayFlight.time}</div>
//       <div className="lcd-cell col-dest">{displayFlight.destination}</div>
//       <div className="lcd-cell col-flight">{displayFlight.flightNumber}</div>
//       <div className="lcd-cell col-gate">{displayFlight.gate || "--"}</div>
//       <div className="lcd-cell col-remark status-active">{displayFlight.remark}</div>
//     </div>
//   );
// }









// import { useState, useEffect } from "react";

// export default function LcdRow({ flight, isEven }) {
//   const [displayFlight, setDisplayFlight] = useState(flight);
//   const [animationClass, setAnimationClass] = useState("fade-in");

//   useEffect(() => {
//     setAnimationClass("fade-out");

//     const timer = setTimeout(() => {
//       setDisplayFlight(flight);
//       setAnimationClass("fade-in");
//     }, 400);

//     return () => clearTimeout(timer);
//   }, [flight]);

//   if (!displayFlight) {
//     return <div className={`lcd-row ${isEven ? "even" : "odd"}`} />;
//   }

//   // FUNCIÓN AUXILIAR: Extrae "HH:MM" del string "2025-12-07 21:00:41" de tu BD
//   const formatTime = (dateTimeString) => {
//     if (!dateTimeString) return "--:--";
//     try {
//       const date = new Date(dateTimeString);
//       return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
//     } catch (e) {
//       // Por si viene directo como "21:00" desde algún formateador previo
//       return dateTimeString.substring(11, 16) || dateTimeString;
//     }
//   };

//   // ASIGNACIÓN DE CLASE DE COLOR SEGÚN TU COLUMNA 'status'
//   const getStatusClass = (status) => {
//     const s = status?.toUpperCase();
//     if (s?.includes("DELAYED") || s?.includes("CANCELLED")) return "status-delayed";
//     if (s?.includes("BOARDING") || s?.includes("CALL")) return "status-active";
//     return "status-ontime";
//   };

//   return (
//     <div className={`lcd-row ${isEven ? "even" : "odd"} ${animationClass}`}>
//       {/* Sincronizado con departure_time */}
//       <div className="lcd-cell col-time">{formatTime(displayFlight.departure_time)}</div>
      
//       {/* Tu propiedad de destino u origen (asegurate de mapearla en el contenedor o pasarla así) */}
//       <div className="lcd-cell col-dest">{displayFlight.destination || "UNKNOWN"}</div>
      
//       {/* Sincronizado con flight_number */}
//       <div className="lcd-cell col-flight">{displayFlight.flight_number}</div>
      
//       {/* Sincronizado con gate */}
//       <div className="lcd-cell col-gate">{displayFlight.gate || "--"}</div>
      
//       {/* Sincronizado con status */}
//       <div className="lcd-cell col-remark {getStatusClass(displayFlight.status)}">
//         {displayFlight.status}
//       </div>
//     </div>
//   );
// }




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
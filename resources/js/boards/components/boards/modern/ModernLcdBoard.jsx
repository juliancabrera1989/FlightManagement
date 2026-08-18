//     export default function ClassicBoard({ flights, filters }) {
    
//     return (
//         <div style={{
//             border: "2px solid black",
//             padding: "10px",
//             width: "100%",
//             background:"#111",
//             color:"yellow",
//             fontFamily:"monospace"
//         }}>
//             <h3 style={{color:"white"}}>FLIGHTS</h3>

//             {flights.length === 0 && <div>No flights</div>}

//             {flights.length > 0 && (
//                 <table width="100%">
//                     <thead>
//                         <tr>
//                             <th>Flight</th>
//                             <th>From</th>
//                             <th>To</th>
//                             <th>Departure</th>
//                             <th>Arrival</th>
//                         </tr>
//                     </thead>
//                         <tbody>
//                             {/* rows reales */}
//                             {flights.slice(0, 10).map(flight => (
//                                 <tr key={flight.id}>
//                                     <td>{flight.code}</td>
//                                     <td>{flight.airline?.name}</td>

//                                     <td>
//                                         {filters.direction === "departures"
//                                             ? flight.arrival_airport?.name
//                                             : flight.departure_airport?.name}
//                                     </td>

//                                     <td>
//                                         {filters.direction === "departures"
//                                             ? flight.arrival_airport?.city
//                                             : flight.departure_airport?.city}
//                                     </td>

//                                     <td>{flight.scheduled_time}</td>
//                                     <td>{flight.status}</td>
//                                 </tr>
//                             ))}

//                             {/* si hay menos de 10, rellenar */}
//                             {Array.from({ length: Math.max(0, 10 - flights.length) }).map((_, i) => (
//                                 <tr key={`empty-${i}`}>
//                                     <td colSpan="6" style={{ opacity: 0.3 }}>—</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                 </table>
//             )}

//         </div>
//     );

// }


// export default function ClassicBoard({ flights, filters }) {

//     return (
//         <div style={{
//             width: "100%",
//             background: "#000",
//             color: "#FFD700",
//             padding: "20px",
//             fontFamily: "monospace",
//             border: "2px solid #222",
//             boxShadow: "0 0 20px #000"
//         }}>
//             <h3 style={{ color: "#FFF", marginBottom: "15px" }}>
//                 ✈ FLIGHT BOARD
//             </h3>

//             {flights.length === 0 && (
//                 <div style={{ opacity: 0.4 }}>No flights</div>
//             )}

//             {flights.length > 0 && (
//                 <table style={{
//                     width: "100%",
//                     borderCollapse: "collapse",
//                     fontSize: "18px"
//                 }}>
//                     <thead style={{ background:"#111" }}>
//                         <tr>
//                             {["Flight","From","To","City","Time","Status"]
//                                 .map((h,i)=>(
//                                     <th key={i} style={{
//                                         padding:"8px 4px",
//                                         borderBottom:"2px solid #333",
//                                         letterSpacing:"1px"
//                                     }}>{h}</th>
//                                 ))}
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {flights.slice(0,10).map(flight => (
//                             <tr key={flight.id}>
//                                 <td style={cell}>{flight.code}</td>

//                                 <td style={cell}>
//                                     {flight.airline?.name}
//                                 </td>

//                                 <td style={cell}>
//                                     {filters.direction === "departures"
//                                         ? flight.arrival_airport?.name
//                                         : flight.departure_airport?.name}
//                                 </td>

//                                 <td style={cell}>
//                                     {filters.direction === "departures"
//                                         ? flight.arrival_airport?.city
//                                         : flight.departure_airport?.city}
//                                 </td>

//                                 <td style={cell}>{flight.scheduled_time}</td>
//                                 <td style={cell}>{flight.status}</td>
//                             </tr>
//                         ))}

//                         {/* relleno */}
//                         {Array.from({ length: Math.max(0,10 - flights.length) })
//                             .map((_,i)=>(
//                                 <tr key={"empty-"+i}>
//                                     <td colSpan={6} style={{
//                                         opacity:0.2,
//                                         padding:"6px 0"
//                                     }}>—</td>
//                                 </tr>
//                             ))}
//                     </tbody>
//                 </table>
//             )}
//         </div>
//     );
// }

// const cell = {
//     padding:"6px 4px",
//     borderBottom:"1px solid #222",
//     textShadow:"0 0 3px yellow"
// };




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
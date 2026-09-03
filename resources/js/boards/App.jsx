import { useEffect, useState } from "react";
import Filters from "./components/Filters";
import Board from "./components/Board";
import { getFlights, getAirlines } from "./api"; // 🎯 Sumamos getAirlines

function App() {
  const boardOptions = ["modern", "matrix", "solari"];
  const directionOptions = ["departures", "arrivals"];

  const initialAirportId = window.INITIAL_AIRPORT_ID;

  const [filters, setFilters] = useState(() => {
    const randomDirection = directionOptions[Math.floor(Math.random() * directionOptions.length)];
    
    return {
      country: null, 
      airport: initialAirportId, 
      direction: initialAirportId ? randomDirection : "departures",
    };
  });

  const [boardType, setBoardType] = useState(() => {
    if (initialAirportId) {
      return boardOptions[Math.floor(Math.random() * boardOptions.length)];
    }
    return "modern";
  });

  const [flights, setFlights] = useState([]);
  const [allAirlines, setAllAirlines] = useState([]); // 🎯 Estado de raíz para el charset mecánico

  // 👉 FETCH DE AEROLÍNEAS COMPLETO (Se ejecuta una sola vez al iniciar la App)
  useEffect(() => {
    getAirlines().then(data => {
      setAllAirlines(Array.isArray(data) ? data : []);
    });
  }, []);

  // 👉 FETCH DE VUELOS CON REORDENAMIENTO TEMPORAL INTELIGENTE
  useEffect(() => {
    if (!filters.airport) {
      setFlights([]);
      return;
    }
    console.log("Filtros en React:", filters);
    getFlights(filters).then(data => {
      if (!Array.isArray(data) || data.length === 0) {
        setFlights([]);
        return;
      }

      const now = new Date();

      // Ordenamos para priorizar el horario actual sin perder ningún vuelo
      const sorted = [...data].sort((a, b) => {
        const timeA = new Date(filters.direction === "departures" ? a.departure_time : a.arrival_time);
        const timeB = new Date(filters.direction === "departures" ? b.departure_time : b.arrival_time);

        // Diferencia en minutos con la hora actual
        let diffA = (timeA - now) / 60000;
        let diffB = (timeB - now) / 60000;

        // Vuelos ocurridos hace más de 30 mins se empujan al final del carrusel
        if (diffA < -30) diffA += 1440;
        if (diffB < -30) diffB += 1440;

        return diffA - diffB;
      });

      setFlights(sorted);
    });
  }, [filters.airport, filters.direction]); 

  return (
    <div style={{ padding: "20px" }}>
      <select
        value={boardType}
        onChange={e => setBoardType(e.target.value)}
        style={{ marginBottom: "20px" }}
      >
        <option value="modern">Modern</option>
        <option value="matrix">Dot Matrix</option>
        <option value="solari">Solari</option>
      </select>

      <Filters filters={filters} setFilters={setFilters} />

      <Board
        key={`${filters.airport}-${filters.direction}-${boardType}`}
        type={boardType}
        flights={flights}
        airlines={allAirlines} // 🎯 Pasamos la lista real de la base de datos
        direction={filters.direction}
      />
    </div>
  );
}

export default App;
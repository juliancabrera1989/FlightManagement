import { useEffect, useState } from "react";
import Filters from "./components/Filters";
import Board from "./components/Board";
import { getFlights, getAirlines } from "./api";

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
  const [allAirlines, setAllAirlines] = useState([]);

  // 👉 FETCH DE AEROLÍNEAS
  useEffect(() => {
    getAirlines().then(data => {
      setAllAirlines(Array.isArray(data) ? data : []);
    });
  }, []);

  // 👉 FETCH DE VUELOS CON ORDENAMIENTO ROBUSTO
  useEffect(() => {
    if (!filters.airport) {
      setFlights([]);
      return;
    }
    
    getFlights(filters).then(data => {
      if (!Array.isArray(data) || data.length === 0) {
        setFlights([]);
        return;
      }

      // Ordenamos cronológicamente sin descartar registros por zona horaria
      const sortedFlights = [...data].sort((a, b) => {
        const timeA = new Date(filters.direction === "departures" ? a.departure_time : a.arrival_time);
        const timeB = new Date(filters.direction === "departures" ? b.departure_time : b.arrival_time);
        return timeA - timeB;
      });

      setFlights(sortedFlights);
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
        airlines={allAirlines}
        direction={filters.direction}
      />
    </div>
  );
}

export default App;
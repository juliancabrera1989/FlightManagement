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

  // 👉 1. FETCH DE AEROLÍNEAS: Normalizamos el campo 'logo_path'
  useEffect(() => {
    getAirlines().then(data => {
      if (Array.isArray(data)) {
        const normalized = data.map(airline => ({
          ...airline,
          logo_path: airline.logo_path || airline.logo || ""
        }));
        setAllAirlines(normalized);
      } else {
        setAllAirlines([]);
      }
    });
  }, []);

  // 👉 2. FETCH DE VUELOS CON ORDENAMIENTO TEMPORAL
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

      const now = new Date();

      // Ordenamos para priorizar el horario actual sin perder ningún vuelo
      const sorted = [...data].sort((a, b) => {
        const rawA = filters.direction === "departures" ? a.departure_time : a.arrival_time;
        const rawB = filters.direction === "departures" ? b.departure_time : b.arrival_time;

        if (!rawA) return 1;
        if (!rawB) return -1;

        const timeA = new Date(rawA);
        const timeB = new Date(rawB);

        let diffA = (timeA - now) / 60000;
        let diffB = (timeB - now) / 60000;

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

      {/* 🎯 ESPERAMOS A QUE CARGUEN LAS AEROLÍNEAS PARA NO DESCONFIGURAR EL RODILLO DE LOGOS */}
      {allAirlines.length > 0 ? (
        <Board
          key={`${filters.airport}-${filters.direction}-${boardType}`}
          type={boardType}
          flights={flights}
          airlines={allAirlines}
          direction={filters.direction}
        />
      ) : (
        <div style={{ color: "#fff", marginTop: "20px" }}>Cargando tablero...</div>
      )}
    </div>
  );
}

export default App;
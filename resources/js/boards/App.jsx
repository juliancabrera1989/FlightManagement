import { useEffect, useState, useMemo } from "react";
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

  const [rawFlights, setRawFlights] = useState([]);
  const [allAirlines, setAllAirlines] = useState([]);

  // 🎯 FETCH DE AEROLÍNEAS: Mapeamos para garantizar 'logo_path' indistinto del campo retornado por DB
  useEffect(() => {
    getAirlines().then(data => {
      if (Array.isArray(data)) {
        const normalized = data.map(item => ({
          ...item,
          logo_path: item.logo_path || item.logo || ""
        }));
        setAllAirlines(normalized);
      } else {
        setAllAirlines([]);
      }
    });
  }, []);

  useEffect(() => {
    if (!filters.airport) {
      setRawFlights([]);
      return;
    }
    getFlights(filters).then(data => {
      setRawFlights(Array.isArray(data) ? data : []);
    });
  }, [filters.airport, filters.direction]); 

  // 🎯 ORDENAMIENTO OPTIMIZADO Y PROTEGIDO CONTRA REGISTROS CON NULL
  const flights = useMemo(() => {
    if (!rawFlights || rawFlights.length === 0) return [];

    const now = new Date();

    return [...rawFlights].sort((a, b) => {
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
  }, [rawFlights, filters.direction]);

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

      {/* 🎯 ESPERAMOS A QUE CARGUEN LAS AEROLÍNEAS ANTES DE MONTAR EL TABLERO */}
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
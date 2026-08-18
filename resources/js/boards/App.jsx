// import { useEffect, useState } from "react";
// import Filters from "./components/Filters";
// import Board from "./components/Board";
// import { getFlights } from "./api";

// function App() {
//   const [filters, setFilters] = useState({
//     country: null,
//     airport: null,
//     direction: "departures",
//   });

//   const [boardType, setBoardType] = useState("solari");
//   const [flights, setFlights] = useState([]);

//   // 👉 FETCH DE VUELOS
//   useEffect(() => {
//     if (!filters.airport) {
//       setFlights([]);
//       return;
//     }

//     getFlights(filters).then(data => {
//       setFlights(Array.isArray(data) ? data : []);
//     });
//   }, [filters.airport, filters.direction]);

//   return (
//     <div style={{ padding: "20px" }}>
//       <select
//         value={boardType}
//         onChange={e => setBoardType(e.target.value)}
//         style={{ marginBottom: "20px" }}
//       >
//         <option value="modern">Modern</option>
//         <option value="matrix">Dot Matrix</option>
//         <option value="solari">Solari</option>
//       </select>

//       <Filters filters={filters} setFilters={setFilters} />

//       <Board
//           key={`${filters.airport}-${filters.direction}-${boardType}`}
//           type={boardType}
//           flights={flights}
//           direction={filters.direction}
//         />

//     </div>
//   );
// }

// export default App;





// import { useEffect, useState } from "react";
// import Filters from "./components/Filters";
// import Board from "./components/Board";
// import { getFlights } from "./api";

// function App() {
//   // 🎲 Configuración de opciones para la aleatoriedad
//   const boardOptions = ["modern", "matrix", "solari"];
//   const directionOptions = ["departures", "arrivals"];

//   // 📡 Leemos los parámetros que Laravel manda en la URL (ej: ?airport=JFK)
//   const searchParams = new URLSearchParams(window.location.search);
//   const urlAirport = searchParams.get("airport"); // Guardará "JFK", "HND", etc. o null

//   // 👉 ESTADOS INICIALES INTELIGENTES
//   const [filters, setFilters] = useState(() => {
//     // Si viene un aeropuerto en la URL, elegimos dirección al azar
//     const randomDirection = directionOptions[Math.floor(Math.random() * directionOptions.length)];
    
//     return {
//       country: null, // Se rellenará después si es necesario, lo importante es el ID del airport
//       airport: urlAirport || null, 
//       direction: urlAirport ? randomDirection : "departures", // Al azar si viene de la Landing
//     };
//   });

//   const [boardType, setBoardType] = useState(() => {
//     // Si viene un aeropuerto por URL, elegimos un tablero al azar. Si no, por defecto "modern"
//     if (urlAirport) {
//       return boardOptions[Math.floor(Math.random() * boardOptions.length)];
//     }
//     return "modern";
//   });

//   const [flights, setFlights] = useState([]);

//   // 👉 FETCH DE VUELOS (Tu lógica intacta)
//   useEffect(() => {
//     if (!filters.airport) {
//       setFlights([]);
//       return;
//     }
// console.log("Filtros en React:", filters);
//     getFlights(filters).then(data => {
//       setFlights(Array.isArray(data) ? data : []);
//     });
//   }, [filters.airport, filters.direction]);

//   return (
//     <div style={{ padding: "20px" }}>
//       <select
//         value={boardType}
//         onChange={e => setBoardType(e.target.value)}
//         style={{ marginBottom: "20px" }}
//       >
//         <option value="modern">Modern</option>
//         <option value="matrix">Dot Matrix</option>
//         <option value="solari">Solari</option>
//       </select>

//       <Filters filters={filters} setFilters={setFilters} />

//       <Board
//         key={`${filters.airport}-${filters.direction}-${boardType}`}
//         type={boardType}
//         flights={flights}
//         direction={filters.direction}
//       />
//     </div>
//   );
// }

// export default App;












// import { useEffect, useState } from "react";
// import Filters from "./components/Filters";
// import Board from "./components/Board";
// import { getFlights } from "./api";

// function App() {
//   const boardOptions = ["modern", "matrix", "solari"];
//   const directionOptions = ["departures", "arrivals"];

//   // 📡 Leemos DIRECTAMENTE el ID numérico real que Laravel ya buscó en la DB
//   const initialAirportId = window.INITIAL_AIRPORT_ID; // Será un número (ej: 1) o null

//   // 👉 ESTADOS INICIALES (Se ejecutan UNA sola vez)
//   const [filters, setFilters] = useState(() => {
//     const randomDirection = directionOptions[Math.floor(Math.random() * directionOptions.length)];
    
//     return {
//       country: null, 
//       airport: initialAirportId, // 🎯 Seteado con el ID real desde el milisegundo cero
//       direction: initialAirportId ? randomDirection : "departures",
//     };
//   });

//   const [boardType, setBoardType] = useState(() => {
//     if (initialAirportId) {
//       return boardOptions[Math.floor(Math.random() * boardOptions.length)];
//     }
//     return "modern";
//   });

//   const [flights, setFlights] = useState([]);

//   // 👉 FETCH DE VUELOS (Tu lógica limpia original)
//   useEffect(() => {
//     if (!filters.airport) {
//       setFlights([]);
//       return;
//     }
//     console.log("Filtros en React:", filters);
//     getFlights(filters).then(data => {
//       setFlights(Array.isArray(data) ? data : []);
//     });
//   }, [filters.airport, filters.direction]); // Solo corre si cambian los filtros reales

//   return (
//     <div style={{ padding: "20px" }}>
//       <select
//         value={boardType}
//         onChange={e => setBoardType(e.target.value)}
//         style={{ marginBottom: "20px" }}
//       >
//         <option value="modern">Modern</option>
//         <option value="matrix">Dot Matrix</option>
//         <option value="solari">Solari</option>
//       </select>

//       <Filters filters={filters} setFilters={setFilters} />

//       <Board
//         key={`${filters.airport}-${filters.direction}-${boardType}`}
//         type={boardType}
//         flights={flights}
//         direction={filters.direction}
//       />
//     </div>
//   );
// }

// export default App;





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

  // 👉 FETCH DE VUELOS
  useEffect(() => {
    if (!filters.airport) {
      setFlights([]);
      return;
    }
    console.log("Filtros en React:", filters);
    getFlights(filters).then(data => {
      setFlights(Array.isArray(data) ? data : []);
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
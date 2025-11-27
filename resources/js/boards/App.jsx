import React, { useState } from "react";
import ReactDOM from "react-dom/client";


import Filters from "./components/Filters";
import Board from "./components/Board";

function App() {

   console.log("React is running!");

    const [filters, setFilters] = useState({
        continent: null,
        country: null,
        airport: null,
        direction: "departures",
    });

    return (
        <div style={{padding: "20px"}}>
            <Filters filters={filters} setFilters={setFilters} />

            <Board filters={filters} />
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("board-root")).render(<App />);


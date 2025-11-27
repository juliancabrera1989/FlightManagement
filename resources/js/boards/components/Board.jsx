import React, { useEffect, useState } from "react";
import { getFlights } from "../api";

export default function Board({ filters }) {

    const [flights, setFlights] = useState([]);

    useEffect(() => {
        // stop if no airport selected
        if(!filters.airport) {
            setFlights([]);
            return;
        }

        console.log("React → enviando filtros:", filters);

        getFlights(filters).then(setFlights).catch(err => console.error(err));;

    }, [filters]);



    return (
        <div style={{
            border: "2px solid black",
            padding: "10px",
            width: "100%",
            background:"#111",
            color:"yellow",
            fontFamily:"monospace"
        }}>
            <h3 style={{color:"white"}}>FLIGHTS</h3>

            {flights.length === 0 && <div>No flights</div>}

            {flights.length > 0 && (
                <table width="100%">
                    <thead>
                        <tr>
                            <th>Flight</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Departure</th>
                            <th>Arrival</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flights.map(flight => (
                            <tr key={flight.id}>
                                <td>{flight.code}</td>
                                <td>{flight.airline?.name}</td>

                                {/* Aeropuerto según dirección */}
                                <td>
                                    {filters.direction === "departures"
                                        ? flight.arrival_airport?.name
                                        : flight.departure_airport?.name}
                                </td>

                                {/* Ciudad destino/origen */}
                                <td>
                                    {filters.direction === "departures"
                                        ? flight.arrival_airport?.city
                                        : flight.departure_airport?.city}
                                </td>

                                <td>{flight.scheduled_time}</td>
                                <td>{flight.status}</td>
                            </tr>
                        ))}
                    </tbody>
                    

                </table>
            )}

        </div>
    );
}

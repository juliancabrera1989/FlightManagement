import React, { useEffect, useState } from "react";
import { getCountries, getAirports } from "../api";

export default function Filters({ filters, setFilters }) {

    const [countries, setCountries] = useState([]);
    const [airports, setAirports] = useState([]);

    useEffect(() => {
        getCountries().then(setCountries);
    }, []);

    useEffect(() => {
        if(filters.country)
            getAirports(filters.country).then(setAirports);
    }, [filters.country]);

    return (
        <div style={{display:"flex", gap: "20px", marginBottom: "20px"}}>

            {/* COUNTRY */}
            <select
                value={filters.country ?? ""}
                onChange={(e)=> setFilters({...filters, country: e.target.value })}>
                <option value="">Select Country</option>
                {countries.map(c=> (
                    <option key={c.country} value={c.country}>{c.country}</option>
                ))}
            </select>

            {/* AIRPORT */}
            <select
                value={filters.airport ?? ""}
                onChange={(e)=> setFilters({...filters, airport: e.target.value })}>
                <option value="">Select Airport</option>
                {airports.map(a=> (
                    <option key={a.id} value={a.id}>{a.name}</option>
                ))}
            </select>

            {/* DIRECTION */}
            <select
                value={filters.direction}
                onChange={(e)=> setFilters({...filters, direction: e.target.value })}>
                <option value="departures">Departures</option>
                <option value="arrivals">Arrivals</option>
            </select>

        </div>
    )
}




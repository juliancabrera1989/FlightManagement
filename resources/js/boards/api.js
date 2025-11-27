

// import axios from "axios";



export async function getCountries() {
    return fetch("/api/countries").then(r => r.json());
}

export async function getAirports(country) {
    return fetch(`/api/airports?country=${country}`).then(r => r.json());
}

// export async function getFlights(filters) {
//     const params = new URLSearchParams(filters);
//     return fetch(`/api/flights?${params.toString()}`).then(r => r.json());
// }
// export async function getFlights(filters) {

//     const params = new URLSearchParams({
//         airport_id: filters.airport?.id,
//         type: filters.direction === "departures" ? "departure" : "arrival",
//     });

//     const res = await axios.get('/api/flights?' + params.toString());
//     return res.data;
// }


// export async function getFlights(filters) {

//     if (!filters.airport) {
//         return [];
//     }

//     const params = new URLSearchParams({
//         airport_id: filters.airport.id,
//         type: filters.direction === "departures" ? "departure" : "arrival"
//     });

//     const res = await fetch(`/api/flights?${params.toString()}`);

//     if (!res.ok) {
//         console.error("Response error:", res.status);
//         return [];
//     }

//     return res.json();
// }


// export async function getFlights(filters) {
//     if (!filters.airport || !filters.airport.id) {
//         console.warn("getFlights: airport missing", filters);
//         return [];
//     }

//     const params = new URLSearchParams({
//         airport_id: filters.airport.id,
//         type: filters.direction === "departures" ? "departure" : "arrival",
//     });

//     const res = await fetch(`/api/flights?${params.toString()}`);
//     return res.json();
// }

export async function getFlights(filters) {

    if (!filters.airport) {
        console.error("getFlights: airport missing", filters);
        return [];
    }

    const params = new URLSearchParams({
        airport_id: filters.airport,    // 👈 ACEPTA DIRECTAMENTE EL ID
        type: filters.direction === "departures" ? "departure" : "arrival",
    });

    const res = await fetch(`/api/flights?${params.toString()}`);
    return res.json();
}

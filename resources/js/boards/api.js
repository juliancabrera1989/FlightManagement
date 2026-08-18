// // resources/js/boards/api.js
// export async function getCountries() {
//   return fetch("/api/countries").then(r => r.json());
// }

// export async function getAirports(country) {
//   return fetch(`/api/airports?country=${encodeURIComponent(country)}`).then(r => r.json());
// }


// export async function getFlights(filters) {
//   // build parameters: use airport id (string or number)
//   const params = new URLSearchParams({
//     airport_id: filters.airport,
//     type: filters.direction === "departures" ? "departure" : "arrival",
//     limit: filters.limit || 200 // request bigger list for rotation
//   });
//   const res = await fetch(`/api/flights?${params.toString()}`);
//   return res.ok ? res.json() : [];
// }

// resources/js/boards/api.js

// 🔹 Captura la URL base de Laravel si existe (vía Apache), de lo contrario queda vacío (vía Artisan serve)
const BASE_URL = window.Laravel?.baseUrl || "";

export async function getCountries() {
  return fetch(`${BASE_URL}/api/countries`).then(r => r.json());
}

export async function getAirports(country) {
  return fetch(`${BASE_URL}/api/airports?country=${encodeURIComponent(country)}`).then(r => r.json());
}

export async function getFlights(filters) {
  // build parameters: use airport id (string or number)
  const params = new URLSearchParams({
    airport_id: filters.airport,
    type: filters.direction === "departures" ? "departures" : "arrivals",
    limit: filters.limit || 200 // request bigger list for rotation
  });
  
  const res = await fetch(`${BASE_URL}/api/flights?${params.toString()}`);
  return res.ok ? res.json() : [];
}

export async function getAirlines() {
  return fetch(`${BASE_URL}/api/airlines`).then(r => r.json());
}
# 🌍 Global Flight Management & Multi-Criteria Route Optimization System

> A robust, full-stack enterprise web application designed to simulate international airport operations, featuring dynamic role management and graph-theory algorithms for optimized flight path discovery.

[🚀 Live Demo](https://flightmanagement-e4u9.onrender.com/) 
[📄 Case Study (PDF)](https://juliancabrera1989.github.io/static-portfolio/projects.html/FlightManagement.PDF)

---

## 🚀 Key Features

* **Real-Time Board Simulation:** A decoupled React UI engine replicating mechanical Solari, Dot-Matrix, and modern airport dashboards driven by live database state mutations.
* **Role-Based Access Control (RBAC):** Strict partition of permissions for Guests (search-only), Airport/Airline Employees (granular flight data editing), and System Administrators.
* **Multi-Criteria Route Optimization:** Visual route planning utilizing Graph Theory to find optimal connections between any global origin and destination.

---

## 🧠 Core Algorithms & Engineering

This application models international airports as **nodes** and individual flights as **weighted edges** inside a custom graph data structure.

### 1. Shortest Path Optimization (Dijkstra's Algorithm)
* Solves the single-source shortest path problem over the flight graph network.
* Allows dynamic re-weighting based on **Cost ($)**, **Total Distance (km)**, or **Flight Duration (time)**.
* Handles time-window constraints (departure/arrival bounds and mandatory connection windows).
* Outputs the absolute optimal path, rendered dynamically using the **Google Maps API**.

### 2. Full Path Enumeration (Depth-First Search - DFS)
* Implements a backtracking DFS algorithm to exhaustively traverse the graph.
* Discovers and enumerates all viable interconnected flight itineraries with multi-hop connections.
* Features cycle detection and depth capping to prevent infinite recursive loops.
* Provides the frontend with an array of alternative travel routes for interactive map comparison.

---

## 🛠️ Tech Stack & Architecture

* **Backend:** Laravel (PHP 8.x), Eloquent ORM, Service Layer Architecture.
* **Frontend:** React (Interactive Dashboard Components), JavaScript (ES6+ Vanilla), Blade Templates, Vite, Bootstrap 5.
* **Database:** MySQL (Relational Schema Optimization & Data Indexing).
* **APIs & Tooling:** Google Maps JavaScript API (Geometry Library).

---

## ⚙️ Local Setup

```bash
# Clone the repository
git clone https://github.com/juliancabrera1989/FlightManagement.git

# Install PHP dependencies
composer install

# Install JS dependencies & build assets
npm install
npm run build

# Configure environment
cp .env.example .env
php artisan key:generate

# Run migrations & seed data
php artisan migrate --seed

# Start local server
php artisan serve
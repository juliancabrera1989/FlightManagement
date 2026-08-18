# Global Flight Management & Multi-Criteria Route Optimization System

> A robust, full-stack enterprise web application designed to simulate international airport operations, featuring dynamic multi-tenant role management and graph-theory algorithms for optimized flight path discovery.

[🔗 Live Demo Link](https://tusitioweb.com) | [📁 Architecture Documentation](link-al-pdf)

---

## 🚀 Key Features

* **Real-Time Board Simulation:** A decoupled UI engine replicating mechanical Solari, Dot-Matrix, and modern airport dashboards driven by live database state mutations.
* **Role-Based Access Control (RBAC):** Strict partition of permissions for Guests (search-only), Airport/Airline Employees (granular flight data editing), and Premium Customers.
* **Multi-Criteria Route Optimization:** Visual route planning utilizing Graph Theory to find optimal connections between any global origin and destination.

---

## 🧠 Core Algorithms & Engineering

This application models international airports as **nodes** and individual flights as **weighted edges** inside a custom graph data structure.

### 1. Shortest Path Optimization (Dijkstra's Algorithm)
* Solves the single-source shortest path problem over the flight graph network.
* Allows dynamic re-weighting based on **Cost**, **Total Distance**, or **Flight Duration**.
* Outputs the absolute optimal path, rendered dynamically using the **Google Maps API**.

### 2. Full Path Enumeration (Depth-First Search - DFS)
* Implements a backtracking DFS algorithm to exhaustively traverse the graph.
* Discovers and enumerates all viable interconnected flight itineraries with multi-hop connections.
* Provides the frontend with an array of alternative travel routes for user visualization.

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** React, HTML5, CSS3, Bootstrap, Blade (Server-Side Rendering integration).
* **Backend:** Laravel (PHP), RESTful API Design, Eloquent ORM.
* **Database:** MySQL (Relational Schema Optimization & Data Indexing).
* **APIs & Integration:** Google Maps JavaScript API.


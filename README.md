# Z Energy Station Finder

A redesign of the Z Energy station locator and fuel price experience, built for Mission 5 Phase 2. The app helps drivers find nearby Z Energy stations, filter them by the services they offer (car wash, EV charging, food, bathrooms, etc.), compare fuel prices across stations, and plan a route that shows stations along the way.

## The Brief

Z Energy customers (represented by our persona, Alex, a road-trip photographer) struggled with the existing site:

- Filtering stations by specific services (e.g. car wash) was unintuitive.
- Fuel prices weren't visible on the map, so comparing stations meant visiting multiple pages or calling ahead.
- There was no quick way to compare prices across stations side by side.
- The site was difficult to use on mobile — cramped layout, lots of zooming.

This project addresses each of those pain points with a station map, a filterable nearby-stations list, a side-by-side price comparison view, and a route planner, all designed for mobile and desktop use.

## Features

- **Interactive station map** — Google Maps view with custom Z Energy pins, hover popups showing available services, and a detail panel per station.
- **Nearby stations list** — searchable/filterable list view of stations with cards showing services and fuel prices.
- **Filter preferences** — filter stations by popular services (24/7 pay at pump, EV charging) and station type (truck stop, service station, etc.).
- **Price comparison** — compare fuel prices (Z91 Unleaded, ZX Premium, Diesel) side by side across two or more stations, with the cheaper price highlighted.
- **Route planning** — enter a start point and destination to calculate a route and surface Z Energy stations along the way, with configurable preferences (avoid tolls/highways/ferries, travel mode).
- **Geolocation** — detects the user's location to find and highlight the nearest station.
- **Responsive design** — dedicated mobile and desktop layouts, plus a dark mode toggle.

## Tech Stack

**Frontend** (`m5phase2-frontend`)

- React 19 + Vite
- [`@vis.gl/react-google-maps`](https://www.npmjs.com/package/@vis.gl/react-google-maps) for the map and directions
- CSS Modules for component styling
- ESLint for linting

**Backend** (`m5phase2-backend`)

- Node.js + Express 5
- MongoDB + Mongoose (with 2dsphere geospatial indexing for nearest-station queries)
- Jest + Supertest for testing

## Getting Started

### Prerequisites

- Node.js (v18+)
- A running MongoDB instance (local)
- A Google Maps API key with the Maps JavaScript API and Directions API enabled

### 1. Clone and install

```bash
git clone https://github.com/MR-2026-FT-Q2-L5ADV/mission-5-phase-2-copilot-drop-outs
cd mission-5-phase-2-copilot-drop-outs

# Backend
cd m5phase2-backend
npm install

# Frontend
cd ../m5phase2-frontend
npm install
```

### 2. Configure environment variables

**Backend** — copy `m5phase2-backend/.env.example` to `m5phase2-backend/.env` and fill in:

```bash
MONGODB_URI=mongodb://localhost:27017/z-energy-stations
GOOGLE_MAPS_BROWSER_KEY=your_browser_key
GOOGLE_DIRECTIONS_SERVER_KEY=your_server_key
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
```

**Frontend** — copy `m5phase2-frontend/.env.example` to `m5phase2-frontend/.env` and add your Google Maps browser key

### 4. Run the app

```bash
# Terminal 1 - backend (http://localhost:3000)
cd m5phase2-backend
npm run dev

# Terminal 2 - frontend (http://localhost:5173)
cd m5phase2-frontend
npm run dev
```

## Contributors

- Austin — https://github.com/sameyer48-cpu
- David — https://github.com/King5ula
- Hans — https://github.com/King5ula


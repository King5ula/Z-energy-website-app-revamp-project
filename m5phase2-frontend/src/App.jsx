import { useState } from "react";
import { useCallback } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import MapView from "./components/MapView";
import ActionOverlay from "./components/ActionOverlay";
import StationDetailPanel from "./components/StationDetailPanel";
import RoutePlanner from "./components/RoutePlanner";
import FilterPreferences from "./pages/FilterPreferences/FilterPreferences.jsx";
import { useGeolocation } from "./hooks/useGeolocation";
import { useDeviceType } from "./hooks/useDeviceType";
import "./App.css";

function App() {
  const [showActionOverlay, setShowActionOverlay] = useState(true);
  const [showFilterPreferences, setShowFilterPreferences] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showRoutePlanner, setShowRoutePlanner] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [nearestStation, setNearestStation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const deviceType = useDeviceType();

  const { requestLocation } = useGeolocation((location) => {
    setUserLocation(location);
    fetchNearestStation(location);
  });

  const fetchNearestStation = async (location) => {
    try {
      const response = await fetch(
        `/api/stations/nearest?lat=${location.lat}&lng=${location.lng}&limit=1`,
      );
      const result = await response.json();
      const data = result.success ? result.data : result;
      if (data && data.length > 0) {
        setNearestStation(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch nearest station:", error);
    }
  };

  const handleStationClick = (station) => {
    setSelectedStation(station);
  };

  const handleCloseDetail = () => {
    setSelectedStation(null);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setShowNearbyStation(true);
  };

  const handlePlanRoute = async (routeData) => {
    console.log("Plan route:", routeData);
    setRouteData(routeData);
    setShowActionOverlay(false);
    setShowRoutePlanner(true);
  };

  const handleRouteCreated = (routeData) => {
    console.log("Route created:", routeData);
    setRouteData(routeData);
  };

  const handleCloseRoutePlanner = () => {
    setShowRoutePlanner(false);
  };

  const handleFilter = () => {
    setShowActionOverlay(false);
    setShowFilterPreferences(true);
  };

  // Use useCallback to prevent unnecessary re-renders of child components that depend on this function, improving performance.
  const handleFiltersChange = useCallback((filters) => {
    setSelectedFilters(filters);
  }, []);
  if (showNearbyStation) {
    return <NearbyStation onBack={() => setShowNearbyStation(false)} />;
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <Navbar />

        <div className="main-container">
          <main className="map-section">
            <MapView
              userLocation={userLocation}
              onStationClick={handleStationClick}
              routeData={routeData}
              filters={selectedFilters}
            />
          </main>
        </div>

        {showActionOverlay && (
          <ActionOverlay
            onSearch={handleSearch}
            onPlanRoute={handlePlanRoute}
            onFilter={handleFilter}
          />
        )}

        {selectedStation && (
          <StationDetailPanel
            station={selectedStation}
            userLocation={userLocation}
            deviceType={deviceType}
            onClose={handleCloseDetail}
          />
        )}

        {showRoutePlanner && (
          <RoutePlanner
            userLocation={userLocation}
            routeData={routeData}
            onRouteCreated={handleRouteCreated}
            onClose={handleCloseRoutePlanner}
          />
        )}

        {showFilterPreferences && (
          <FilterPreferences
            onClose={() => setShowFilterPreferences(false)}
            onFiltersChange={handleFiltersChange}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
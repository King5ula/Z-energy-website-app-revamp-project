import { useState, useEffect, useRef } from "react";
import { loadGoogleMapsScript } from "../../utils/googleMapsLoader";
import { calculateDistance } from "../../utils/geoHelpers";
import "./NearbyStation.module.css";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE";

export default function NearbyStation({ userLocation, onBack, onStationSelect, selectedStation, hasLocationPermission }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [stations, setStations] = useState([]);
  const [nearestStation, setNearestStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    loadGoogleMapsScript(API_KEY)
      .then(() => {
        initMap();
      })
      .catch((err) => {
        setError(err.message || "Failed to load Google Maps");
        setLoading(false);
      });
  }, []);

  const initMap = () => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: userLocation || { lat: -41.0, lng: 174.0 },
        zoom: userLocation ? 12 : 5.5,
        mapTypeControl: true,
        streetViewControl: false,
      });
      fetchNearbyStations();
    }
  };

  const fetchNearbyStations = async () => {
    try {
      setLoading(true);
      let url = "/api/nearby-stations";
      if (userLocation) {
        url = `/api/nearby-stations?lat=${userLocation.lat}&lng=${userLocation.lng}&limit=230`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setStations(data.data || []);
        if (data.data && data.data.length > 0) {
          setNearestStation(data.data[0]);
        }
        renderStationMarkers(data.data || []);
      } else {
        setError(data.message || "Failed to fetch stations");
      }
    } catch (err) {
      console.error("Failed to fetch nearby stations:", err);
      setError("Failed to fetch nearby stations");
    } finally {
      setLoading(false);
    }
  };

  const renderStationMarkers = (stationsData) => {
    if (!mapInstanceRef.current || !window.google) return;

    markersRef.current.forEach((marker) => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];

    const newMarkers = stationsData.map((station) => {
      const position = {
        lat: station.location?.coordinates?.[1] || station.lat,
        lng: station.location?.coordinates?.[0] || station.lng,
      };

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: station.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#FF5C00",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      marker.addListener("click", () => {
        if (onStationSelect) {
          onStationSelect(station);
        }
        mapInstanceRef.current.panTo(position);
        mapInstanceRef.current.setZoom(14);
      });

      return marker;
    });

    markersRef.current = newMarkers;

    if (userLocation && window.google) {
      const userMarker = new window.google.maps.Marker({
        position: userLocation,
        map: mapInstanceRef.current,
        title: "Your Location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      });
      markersRef.current.push(userMarker);
    }
  };

  return (
    <div className="nearby-station-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>
          <span className="back-arrow"></span> Back
        </button>
        <h1>Nearby Z Stations</h1>
        {nearestStation && userLocation && (
          <div className="nearest-info">
            <span className="location-icon"></span>
            <span>Nearest: {nearestStation.name}</span>
          </div>
        )}
      </header>

      <div className="content-container">
        <div className="map-section">
          <div ref={mapContainerRef} className="map-container"></div>
          {loading && <div className="loading-overlay">Loading map...</div>}
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="stations-list">
          <h2>Stations ({stations.length})</h2>
          <div className="list-content">
            {stations.map((station, index) => {
              const stationLat = station.location?.coordinates?.[1] || station.lat;
              const stationLng = station.location?.coordinates?.[0] || station.lng;
              const distance = userLocation
                ? calculateDistance(userLocation.lat, userLocation.lng, stationLat, stationLng)
                : null;

              return (
                <div
                  key={station._id || station.id || index}
                  className={`station-item ${selectedStation?._id === station._id ? "selected" : ""}`}
                  onClick={() => onStationSelect && onStationSelect(station)}
                >
                  <div className="station-info">
                    <h3>{station.name}</h3>
                    <p className="station-address">
                      {station.address?.line1 || station.address}
                      {station.address?.suburb && `, ${station.address.suburb}`}
                    </p>
                    {distance && (
                      <p className="station-distance">{distance.toFixed(1)} km away</p>
                    )}
                  </div>
                  <div className="station-arrow"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedStation && (
        <div className="station-detail-panel">
          <div className="panel-header">
            <h2>{selectedStation.name}</h2>
            <button className="close-btn" onClick={() => onStationSelect(null)}>
              <span className="close-icon"></span>
            </button>
          </div>
          <div className="panel-content">
            <h3>Address</h3>
            <p>
              {selectedStation.address?.line1 || selectedStation.address}
              <br />
              {selectedStation.address?.suburb}, {selectedStation.address?.region}{" "}
              {selectedStation.address?.postcode}
            </p>

            {selectedStation.openingHours && (
              <>
                <h3>Opening Hours</h3>
                <p>{selectedStation.openingHours}</p>
              </>
            )}

            {selectedStation.phone && (
              <>
                <h3>Phone</h3>
                <p>{selectedStation.phone}</p>
              </>
            )}

            {selectedStation.amenities && selectedStation.amenities.length > 0 && (
              <>
                <h3>Amenities</h3>
                <ul>
                  {selectedStation.amenities.map((amenity, idx) => (
                    <li key={idx}>{amenity}</li>
                  ))}
                </ul>
              </>
            )}

            {userLocation && (
              <button
                className="btn-directions"
                onClick={() => {
                  const lat = selectedStation.location?.coordinates?.[1] || selectedStation.lat;
                  const lng = selectedStation.location?.coordinates?.[0] || selectedStation.lng;
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}`,
                    "_blank"
                  );
                }}
              >
                Get Directions
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

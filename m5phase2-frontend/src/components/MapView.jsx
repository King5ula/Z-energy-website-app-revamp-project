import { useState, useEffect, useRef } from "react";
import { loadGoogleMapsScript } from "../utils/googleMapsLoader";
import { calculateDistanceApprox } from "../utils/geoHelpers";
import "../styles/MapView.css";
import zPinImage from "../assets/z_pin.png";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE";

const REGION_CENTROIDS = {
  Auckland: { lat: -36.8485, lng: 174.7633 },
  Wellington: { lat: -41.2865, lng: 174.7762 },
  Canterbury: { lat: -43.5321, lng: 172.6362 },
  Waikato: { lat: -37.787, lng: 175.2793 },
  "Bay of Plenty": { lat: -37.6878, lng: 176.1651 },
  Otago: { lat: -45.0312, lng: 169.3176 },
  Northland: { lat: -35.7275, lng: 174.3236 },
  "Hawke's Bay": { lat: -39.4902, lng: 176.9174 },
  Taranaki: { lat: -39.0556, lng: 174.0752 },
  "Manawatu-Wanganui": { lat: -39.9332, lng: 175.0501 },
  Southland: { lat: -46.4132, lng: 168.3538 },
  Gisborne: { lat: -38.6626, lng: 178.0176 },
  Nelson: { lat: -41.2706, lng: 173.284 },
  Marlborough: { lat: -41.5131, lng: 173.958 },
  Tasman: { lat: -41.2706, lng: 172.9897 },
  "West Coast": { lat: -42.4509, lng: 171.2103 },
};

function MapView({ userLocation, onStationClick, routeData, filters = [] }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const directionsRendererRef = useRef(null);
  const [stations, setStations] = useState([]);
  const [viewMode, setViewMode] = useState("regions"); // 'regions' or 'stations'
  const [regionalClusters, setRegionalClusters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    console.log("MapView: Initializing Google Maps");

    loadGoogleMapsScript(API_KEY)
      .then(() => {
        console.log("MapView: Google Maps script loaded");
        if (mapContainerRef.current && !mapInstanceRef.current) {
          mapInstanceRef.current = new window.google.maps.Map(
            mapContainerRef.current,
            {
              center: { lat: -41.0, lng: 174.0 },
              zoom: 5.5,
              mapTypeControl: true,
              streetViewControl: false,
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }],
                },
              ],
            },
          );
          console.log("MapView: Map instance created");
          setIsLoading(false);
          fetchStationsAndCluster();
        }
      })
      .catch((error) => {
        console.error("MapView: Failed to load Google Maps:", error);
        setError(error.message);
        setIsLoading(false);
      });

    return () => {
      clearMarkers();
    };
  }, []);

  // Added a new prop and endpoint based on if filters are active (Austin)
  const fetchStationsAndCluster = async () => {
    try {
      const endpoint =
        filters.length > 0
          ? `/api/filter-preferences?filters=${encodeURIComponent(filters.join(","))}`
          : "/api/stations";
      console.log("MapView: Fetching all stations...");
      const response = await fetch(endpoint);
      console.log("MapView: Response status:", response.status);
      const result = await response.json();

      let data;
      if (result.success && result.data) {
        data = Array.isArray(result.data)
          ? result.data
          : result.data.stations || result.data;
      } else {
        data = Array.isArray(result) ? result : [];
      }
      console.log("MapView: Stations fetched:", data.length);
      console.log("MapView: Sample station:", data[0]);
      setStations(data);

      const clusters = clusterStationsByRegion(data);
      console.log("MapView: Clusters created:", clusters);
      console.log("MapView: Number of clusters:", clusters.length);
      clusters.forEach((cluster) => {
        console.log(
          `  - ${cluster.region}: ${cluster.stations.length} stations at`,
          cluster.centroid,
        );
      });
      setRegionalClusters(clusters);
      console.log(
        "MapView: State updated with",
        clusters.length,
        "regional clusters",
      );
    } catch (error) {
      console.error("MapView: Failed to fetch stations:", error);
      setError("Failed to load stations");
    }
  };

  const clusterStationsByRegion = (stationsData) => {
    const clusters = {};

    stationsData.forEach((station) => {
      const lat = station.location.coordinates[1];
      const lng = station.location.coordinates[0];

      // Find closest region
      let closestRegion = null;
      let minDistance = Infinity;

      Object.entries(REGION_CENTROIDS).forEach(([region, centroid]) => {
        const distance = calculateDistanceApprox(
          lat,
          lng,
          centroid.lat,
          centroid.lng,
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestRegion = region;
        }
      });

      if (!clusters[closestRegion]) {
        clusters[closestRegion] = {
          region: closestRegion,
          centroid: REGION_CENTROIDS[closestRegion],
          stations: [],
        };
      }

      clusters[closestRegion].stations.push(station);
    });

    return Object.values(clusters);
  };

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];
  };

  const renderRegionalClusters = () => {
    console.log(
      "MapView: renderRegionalClusters called with",
      regionalClusters.length,
      "clusters",
    );
    const newMarkers = regionalClusters.map((cluster) => {
      console.log(
        "Creating marker for region:",
        cluster.region,
        "at",
        cluster.centroid,
        "with",
        cluster.stations.length,
        "stations",
      );

      const zoom = mapInstanceRef.current.getZoom();
      const baseScale = Math.sqrt(cluster.stations.length) * 3;
      const zoomScale = Math.pow(2, zoom - 5.5);
      const radius = Math.max(15, Math.min(baseScale / zoomScale, 50));

      const marker = new window.google.maps.Marker({
        position: cluster.centroid,
        map: mapInstanceRef.current,
        title: `${cluster.region} (${cluster.stations.length} stations)`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: radius,
          fillColor: "#ff6523",
          fillOpacity: 0.3,
          strokeColor: "#ff6523",
          strokeOpacity: 0.8,
          strokeWeight: 2,
        },
        label: {
          text: String(cluster.stations.length),
          color: "#FFFFFF",
          fontSize: "16px",
          fontWeight: "bold",
        },
      });

      marker.addListener("click", () => {
        console.log("Cluster clicked:", cluster.region);
        mapInstanceRef.current.panTo(cluster.centroid);
        mapInstanceRef.current.setZoom(9);
        setViewMode("stations");
      });

      return marker;
    });

    markersRef.current = newMarkers;
    console.log(
      "MapView: Regional clusters rendered:",
      newMarkers.length,
      "markers created",
    );
  };

  const renderStationMarkers = () => {
    const newMarkers = stations.map((station) => {
      const position = {
        lat: station.location.coordinates[1],
        lng: station.location.coordinates[0],
      };

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: station.name || station.officialName,
        icon: {
          url: zPinImage,
          scaledSize: new window.google.maps.Size(30, 40),
          anchor: new window.google.maps.Point(15, 40),
        },
        animation: window.google.maps.Animation.DROP,
      });

      marker.addListener("click", () => {
        if (onStationClick) {
          onStationClick(station);
        }
        mapInstanceRef.current.panTo(position);
        mapInstanceRef.current.setZoom(15);
      });

      return marker;
    });

    markersRef.current = newMarkers;
    console.log("MapView: Station markers rendered:", newMarkers.length);
  };

  // to Fetch stations when filters change and guard against mapInstanceRef not being ready yet (Austin)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    fetchStationsAndCluster();
  }, [filters]);

  useEffect(() => {
    console.log(
      "MapView: useEffect triggered - viewMode:",
      viewMode,
      "clusters:",
      regionalClusters.length,
      "stations:",
      stations.length,
    );
    if (!mapInstanceRef.current) {
      console.log("MapView: No map instance yet");
      return;
    }

    if (viewMode === "regions" && regionalClusters.length > 0) {
      console.log("MapView: Rendering regional clusters NOW");
      clearMarkers();
      renderRegionalClusters();
    } else if (viewMode === "stations" && stations.length > 0) {
      console.log("MapView: Rendering individual stations");
      clearMarkers();
      renderStationMarkers();
    } else {
      console.log("MapView: No rendering - waiting for data");
    }
  }, [regionalClusters, viewMode, stations]);

  useEffect(() => {
    if (mapInstanceRef.current && userLocation) {
      console.log("MapView: Centering on user location:", userLocation);
      mapInstanceRef.current.panTo({
        lat: userLocation.lat,
        lng: userLocation.lng,
      });
      mapInstanceRef.current.setZoom(12);
      setViewMode("stations");

      new window.google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
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
    }
  }, [userLocation]);

  useEffect(() => {
    if (!mapInstanceRef.current || !routeData) {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
      return;
    }

    console.log("MapView: Rendering route with data:", routeData);

    const directionsService = new window.google.maps.DirectionsService();

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer(
        {
          map: mapInstanceRef.current,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: "#FF5C00",
            strokeWeight: 5,
            strokeOpacity: 0.8,
          },
        },
      );
    }

    const request = {
      origin: routeData.startPoint,
      destination: routeData.destination,
      travelMode:
        window.google.maps.TravelMode[
          routeData.preferences?.travelMode || "DRIVING"
        ],
    };

    if (routeData.preferences) {
      request.avoidTolls = routeData.preferences.avoidTolls || false;
      request.avoidHighways = routeData.preferences.avoidHighways || false;
      request.avoidFerries = routeData.preferences.avoidFerries || false;
    }

    console.log("MapView: Requesting directions with:", request);

    directionsService.route(request, (result, status) => {
      if (status === "OK") {
        console.log("MapView: Directions received successfully");
        directionsRendererRef.current.setDirections(result);
        clearMarkers();
      } else {
        console.error("MapView: Directions request failed:", status);
        setError(`Failed to calculate route: ${status}`);
      }
    });
  }, [routeData]);

  if (error) {
    return (
      <div
        className="map-container"
        style={{ width: "100%", height: "100%", position: "relative" }}
      >
        <div className="map-loading" style={{ color: "#ff5722" }}>
          <p>Error loading map: {error}</p>
          <p style={{ fontSize: "0.9rem", marginTop: "1rem" }}>
            Please check your configuration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="map-container"
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {isLoading && <div className="map-loading">Loading map...</div>}
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
      {!isLoading && stations.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            background: "rgba(255, 255, 255, 0.95)",
            padding: "12px 18px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            fontSize: "14px",
            fontWeight: "600",
            color: "#333",
          }}
        >
          {viewMode === "regions"
            ? `${regionalClusters.length} regions • ${stations.length} stations`
            : `${stations.length} Z Energy stations`}
        </div>
      )}
      {viewMode === "stations" && (
        <button
          onClick={() => {
            setViewMode("regions");
            mapInstanceRef.current.setCenter({ lat: -41.0, lng: 174.0 });
            mapInstanceRef.current.setZoom(5.5);
          }}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "#FF5C00",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => (e.target.style.background = "#CC4A00")}
          onMouseOut={(e) => (e.target.style.background = "#FF5C00")}
        >
          ← Back to Regions
        </button>
      )}
    </div>
  );
}

export default MapView;

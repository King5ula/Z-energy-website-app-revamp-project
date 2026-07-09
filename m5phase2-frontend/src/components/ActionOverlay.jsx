import { useState, useEffect } from "react";
import AddressAutocomplete from "./AddressAutocomplete";
import "../styles/ActionOverlay.css";
import SearchIcon from "../assets/Search.png";
import SearchIconInverted from "../assets/Search-inverted.png";
import RouteIcon from "../assets/Route.png";
import RouteIconInverted from "../assets/Route-inverted.png";
import SliderIcon from "../assets/Slider.png";
import SliderIconInverted from "../assets/Slider-inverted.png";
import Marker1 from "../assets/1.png";
import Marker2 from "../assets/2.png";
import Marker1Inverted from "../assets/1-inverted.png";
import Marker2Inverted from "../assets/2-inverted.png";
import LocationIcon from "../assets/location_icon.png";

function ActionOverlay({ onClose, onSearch, onPlanRoute, onFilter, routeData }) {
  const [view, setView] = useState("main"); // 'main', 'route-form', 'starting-point', 'destination'
  const [startPoint, setStartPoint] = useState("");
  const [destination, setDestination] = useState("");
  const [startLocation, setStartLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [nearbyStations, setNearbyStations] = useState([]);
  const [preferences, setPreferences] = useState({
    avoidTolls: false,
    avoidHighways: false,
    avoidFerries: false,
  });

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDarkMode(theme === "dark" || theme === null);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Restore route data when coming back from RoutePlanner
  useEffect(() => {
    if (routeData) {
      if (routeData.startPoint) {
        const startText = typeof routeData.startPoint === 'string'
          ? routeData.startPoint
          : `${routeData.startPoint.lat}, ${routeData.startPoint.lng}`;
        setStartPoint(startText);
      }
      if (routeData.destination) {
        const destText = typeof routeData.destination === 'string'
          ? routeData.destination
          : `${routeData.destination.lat}, ${routeData.destination.lng}`;
        setDestination(destText);
      }
      if (routeData.startLocation) {
        setStartLocation(routeData.startLocation);
      }
      if (routeData.destinationLocation) {
        setDestinationLocation(routeData.destinationLocation);
      }
      if (routeData.preferences) {
        setPreferences(prev => ({
          ...prev,
          ...routeData.preferences
        }));
      }
      // Show the route-form view when coming back
      setView('route-form');
    }
  }, [routeData]);

  const searchIcon = isDarkMode ? SearchIconInverted : SearchIcon;
  const routeIcon = isDarkMode ? RouteIconInverted : RouteIcon;
  const sliderIcon = isDarkMode ? SliderIconInverted : SliderIcon;
  const marker1Icon = isDarkMode ? Marker1Inverted : Marker1;
  const marker2Icon = isDarkMode ? Marker2Inverted : Marker2;

  useEffect(() => {
    const fetchNearbyStations = async () => {
      if (startLocation && startLocation.lat && startLocation.lng) {
        try {
          const response = await fetch(
            `/api/stations/nearest?lat=${startLocation.lat}&lng=${startLocation.lng}&limit=5`,
          );
          const result = await response.json();
          const data = result.success ? result.data : result;
          if (data && Array.isArray(data)) {
            setNearbyStations(data);
          }
        } catch (error) {
          console.error("Failed to fetch nearby stations:", error);
          setNearbyStations([]);
        }
      } else {
        setNearbyStations([]);
      }
    };

    fetchNearbyStations();
  }, [startLocation]);

  const handlePlanRoute = () => {
    setView("route-form");
  };

  const handleBack = () => {
    if (
      view === "starting-point" ||
      view === "destination" ||
      view === "filter"
    ) {
      setView("route-form");
    } else {
      setView("main");
      setStartPoint("");
      setDestination("");
      setStartLocation(null);
      setDestinationLocation(null);
    }
  };

  // Handle the filter button click
  const handleFilter = () => {
    if (onFilter) {
      onFilter();
    } else setView("filter");
  };

  const handlePreferenceChange = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleConfigureRoute = async () => {
    if (!startPoint || !destination) {
      alert("Please select both starting point and destination");
      return;
    }

    if (!startLocation || !destinationLocation) {
      alert("Please select valid locations from the autocomplete suggestions");
      return;
    }

    if (onPlanRoute) {
      onPlanRoute({
        startPoint,
        destination,
        startLocation,
        destinationLocation,
        preferences: {
          ...preferences,
          travelMode: "DRIVING",
        },
      });
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleSearchClick = () => {
    setView("search");
  };

  const handleStartPlaceSelected = (place) => {
    setStartPoint(place.address);
    setStartLocation(place.location);
    setTimeout(() => {
      setView("route-form");
    }, 300);
  };

  const handleDestinationPlaceSelected = (place) => {
    setDestination(place.address);
    setDestinationLocation(place.location);
    setTimeout(() => {
      setView("route-form");
    }, 300);
  };

  const handleStationSelected = (station) => {
    let stationAddress = "";
    if (typeof station.address === "string") {
      stationAddress = station.address;
    } else if (station.address && typeof station.address === "object") {
      const parts = [];
      if (station.address.lines) parts.push(station.address.lines);
      if (station.address.suburb) parts.push(station.address.suburb);
      if (station.address.region) parts.push(station.address.region);
      stationAddress = parts.join(", ");
    } else {
      stationAddress = `${station.name}, ${station.city || ""}`;
    }

    setDestination(stationAddress);
    setDestinationLocation({
      lat: station.latitude,
      lng: station.longitude,
    });
    setTimeout(() => {
      setView("route-form");
    }, 300);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by your browser. Please enter your address manually.",
      );
      return;
    }

    console.log("Requesting location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Success callback
        console.log("Location obtained:", position.coords);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // ponytail: Use Google Maps Geocoder to convert coordinates to address
        // Ceiling: Requires Google Maps to be loaded first
        if (
          window.google &&
          window.google.maps &&
          window.google.maps.Geocoder
        ) {
          const geocoder = new window.google.maps.Geocoder();
          const latlng = { lat, lng };

          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === "OK" && results[0]) {
              setStartPoint(results[0].formatted_address);
              setStartLocation({ lat, lng });
              setView("route-form");
            } else {
              const locationText = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
              setStartPoint(locationText);
              setStartLocation({ lat, lng });
              setView("route-form");
            }
          });
        } else {
          const locationText = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setStartPoint(locationText);
          setStartLocation({ lat, lng });
          setView("route-form");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Could not get your location. ";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage +=
              "Permission denied. Please allow location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out.";
            break;
          default:
            errorMessage += "An unknown error occurred.";
            break;
        }

        alert(errorMessage + "\n\nPlease enter your address manually instead.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  // Starting point selection view
  if (view === "starting-point") {
    return (
      <div className="action-overlay">
        <div className="action-card route-selection-card">
          <button className="back-button" onClick={handleBack}>
            <span className="back-arrow">←</span> Back
          </button>

          <h3 className="selection-title">Choose a starting point</h3>

          <AddressAutocomplete
            value={startPoint}
            onChange={setStartPoint}
            onPlaceSelected={handleStartPlaceSelected}
            placeholder="123 Queen Street"
            className="route-autocomplete-input"
          />

          <button className="use-location-button" onClick={handleUseMyLocation}>
            <img src={LocationIcon} alt="Location" className="location-icon-img" />
            Use my location
          </button>
        </div>
      </div>
    );
  }

  // Destination selection view
  if (view === "destination") {
    return (
      <div className="action-overlay">
        <div className="action-card route-selection-card">
          <button className="back-button" onClick={handleBack}>
            <span className="back-arrow">←</span> Back
          </button>

          <h3 className="selection-title">Enter Destination</h3>

          <AddressAutocomplete
            value={destination}
            onChange={setDestination}
            onPlaceSelected={handleDestinationPlaceSelected}
            placeholder="Enter destination address"
            className="route-autocomplete-input"
          />

          {nearbyStations.length > 0 && (
            <>
              <div className="stations-divider">
                <span>or choose a nearby Z station</span>
              </div>
              <div className="nearby-stations-list">
                {nearbyStations.map((station) => {
                  let displayAddress = "";
                  if (typeof station.address === "string") {
                    displayAddress = station.address;
                  } else if (
                    station.address &&
                    typeof station.address === "object"
                  ) {
                    const parts = [];
                    if (station.address.suburb)
                      parts.push(station.address.suburb);
                    if (station.address.region)
                      parts.push(station.address.region);
                    displayAddress = parts.join(", ") || station.city || "";
                  } else {
                    displayAddress = station.city || "";
                  }

                  return (
                    <button
                      key={station.id}
                      className="station-option"
                      onClick={() => handleStationSelected(station)}
                    >
                      <div className="station-info">
                        <span className="station-name">{station.name}</span>
                        <span className="station-address">
                          {displayAddress}
                        </span>
                      </div>
                      <span className="station-distance">
                        {station.distance
                          ? `${station.distance.toFixed(1)} km`
                          : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Route form view
  if (view === "route-form") {
    const hasStartPoint = startPoint && startLocation;

    return (
      <div className="action-overlay">
        <div className="action-card route-form">
          <button className="back-button" onClick={handleBack}>
            <span className="back-arrow">←</span> Back
          </button>

          <div className="route-buttons-overlay">
            <button
              className="route-button-overlay"
              onClick={() => setView("starting-point")}
            >
              <span className="route-button-text-overlay">
                {startPoint || "Choose a starting point"}
              </span>
              {hasStartPoint ? (
                <img src={marker1Icon} alt="1" className="route-marker-img" />
              ) : (
                <img src={searchIcon} alt="Search" className="route-icon-img" />
              )}
            </button>

            <button
              className="route-button-overlay"
              onClick={() => setView("destination")}
            >
              <span className="route-button-text-overlay">
                {destination || "Enter Destination"}
              </span>
              {hasStartPoint ? (
                <img src={marker2Icon} alt="2" className="route-marker-img" />
              ) : (
                <img src={routeIcon} alt="Destination" className="route-icon-img" />
              )}
            </button>
          </div>

          {!hasStartPoint ? (
            <div className="route-actions">
              <button className="btn-filter" onClick={handleFilter}>
                <img src={sliderIcon} alt="Filter" className="btn-icon-img" />{" "}
                Filter
              </button>
              <button
                className="btn-configure"
                onClick={handleConfigureRoute}
                disabled={!startPoint || !destination}
              >
                <img src={routeIcon} alt="Route" className="btn-icon-img" />{" "}
                Configure route
              </button>
            </div>
          ) : (
            <div className="route-actions-filled">
              <button className="btn-icon-small" onClick={handleConfigureRoute} title="Configure route">
                <img src={routeIcon} alt="Configure" className="btn-icon-img" />
              </button>
              <button className="btn-icon-small" onClick={handleFilter} title="Filter preferences">
                <img src={sliderIcon} alt="Filter" className="btn-icon-img" />
              </button>
              <button
                className={`btn-search-wide ${startPoint && destination ? 'active' : ''}`}
                onClick={handleConfigureRoute}
                disabled={!startPoint || !destination}
              >
                Search
                <img src={searchIcon} alt="Search" className="btn-icon-img" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Filter preferences view
  if (view === "filter") {
    return (
      <div className="action-overlay">
        <div className="action-card route-selection-card">
          <button className="back-button" onClick={handleBack}>
            <span className="back-arrow">←</span> Back
          </button>

          <h3 className="selection-title">Route Preferences</h3>

          <div className="filter-options">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={preferences.avoidTolls}
                onChange={() => handlePreferenceChange("avoidTolls")}
              />
              <span>Avoid Tolls</span>
            </label>

            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={preferences.avoidHighways}
                onChange={() => handlePreferenceChange("avoidHighways")}
              />
              <span>Avoid Highways</span>
            </label>

            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={preferences.avoidFerries}
                onChange={() => handlePreferenceChange("avoidFerries")}
              />
              <span>Avoid Ferries</span>
            </label>
          </div>

          <button
            className="btn-apply-filters"
            onClick={() => setView("route-form")}
          >
            Apply Filters
          </button>
        </div>
      </div>
    );
  }

  // Main overlay view
  return (
    <div className="action-overlay">
      <div className="action-card">
        <h2 className="action-title">Where are you heading?</h2>
        <div className="action-options">
          <button className="action-option" onClick={handleSearch}>
            <div className="option-content">
              <span className="option-text">Search for a nearby station</span>
              <img src={searchIcon} alt="Search" className="option-icon-img" />
            </div>
          </button>

          <button className="action-option" onClick={handlePlanRoute}>
            <div className="option-content">
              <span className="option-text">Plan your route</span>
              <img src={routeIcon} alt="Route" className="option-icon-img" />
            </div>
          </button>

          <button className="action-option" onClick={handleFilter}>
            <div className="option-content">
              <span className="option-text">Filter your preferences</span>
              <img src={sliderIcon} alt="Filter" className="option-icon-img" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActionOverlay;

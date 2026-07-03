import { useState, useRef, useEffect } from "react";
import { loadGoogleMapsScript } from "../../utils/googleMapsLoader";
import { useGeolocation } from "../../hooks/useGeolocation";
import AddressAutocomplete from "../../components/AddressAutocomplete";
import "./PlanRoute.module.css";
import SearchIcon from "../../assets/Search.png";
import SearchIconInverted from "../../assets/Search-inverted.png";
import NavigationIcon from "../../assets/Navigation.png";
import CrossroadIcon from "../../assets/Crossroad.png";
import SliderIcon from "../../assets/Slider.png";
import SliderIconInverted from "../../assets/Slider-inverted.png";
import RouteIcon from "../../assets/Route.png";
import RouteIconInverted from "../../assets/Route-inverted.png";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE";

export default function PlanRoute({ userLocation, onBack, onFilterClick }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);

  const [view, setView] = useState('main'); // 'main' or 'starting-point' or 'destination'
  const [startPoint, setStartPoint] = useState("");
  const [destination, setDestination] = useState("");
  const [startLocation, setStartLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeSteps, setRouteSteps] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(userLocation);

  const { requestLocation, error: geoError } = useGeolocation((location) => {
    setCurrentLocation(location);
    const locationText = `My Location (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`;
    setStartPoint(locationText);
    setStartLocation(location);
    setView('main');
  });

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDarkMode(theme === 'dark' || theme === null);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  const searchIcon = isDarkMode ? SearchIconInverted : SearchIcon;
  const routeIcon = isDarkMode ? RouteIconInverted : RouteIcon;
  const sliderIcon = isDarkMode ? SliderIconInverted : SliderIcon;

  useEffect(() => {
    if (mapInstanceRef.current) return;

    loadGoogleMapsScript(API_KEY)
      .then(() => {
        initMap();
        setMapsLoaded(true);
      })
      .catch((err) => {
        setError(err.message || "Failed to load Google Maps");
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

      directionsServiceRef.current = new window.google.maps.DirectionsService();
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map: mapInstanceRef.current,
        suppressMarkers: false,
      });
    }
  };

  const handleUseMyLocation = () => {
    if (currentLocation || userLocation) {
      const location = currentLocation || userLocation;
      const locationText = `My Location (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`;
      setStartPoint(locationText);
      setStartLocation(location);
      setView('main');
    } else {
      requestLocation();
    }
  };

  const handleStartPlaceSelected = (place) => {
    console.log('Start place selected:', place);
    setStartLocation(place.location);
    setStartPoint(place.address);
    setView('main');
  };

  const handleDestinationPlaceSelected = (place) => {
    console.log('Destination place selected:', place);
    setDestinationLocation(place.location);
    setDestination(place.address);
    setView('main');
  };

  const handleConfigureRoute = async () => {
    if (!startPoint || !destination) {
      setError("Please enter both starting point and destination");
      return;
    }

    if (!startLocation || !destinationLocation) {
      setError("Please select valid locations from the address suggestions");
      return;
    }

    if (!directionsServiceRef.current) {
      setError("Map not loaded yet");
      return;
    }

    setLoading(true);
    setError(null);
    setRouteInfo(null);

    try {
      const request = {
        origin: startLocation,
        destination: destinationLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      };

      directionsServiceRef.current.route(request, (result, status) => {
        setLoading(false);

        if (status === "OK") {
          directionsRendererRef.current.setDirections(result);

          const route = result.routes[0].legs[0];
          setRouteInfo({
            distance: route.distance.text,
            duration: route.duration.text,
            startAddress: route.start_address,
            endAddress: route.end_address,
          });

          // Extract turn-by-turn directions
          const steps = route.steps.map((step, index) => ({
            instruction: step.instructions,
            distance: step.distance.text,
            duration: step.duration.text,
          }));
          setRouteSteps(steps);
          setShowDirections(true);
        } else {
          setError(`Failed to calculate route: ${status}`);
        }
      });
    } catch (err) {
      setLoading(false);
      setError("Failed to calculate route");
      console.error(err);
    }
  };

  if (view === 'main') {
    const hasInputs = startPoint || destination;
    const bothInputsFilled = startPoint && destination;

    return (
      <div className="plan-route-overlay">
        <div className={showDirections ? "plan-route-card-expanded" : "plan-route-card"}>
          <button className="back-button" onClick={showDirections ? () => {
            setShowDirections(false);
            setRouteInfo(null);
            setRouteSteps([]);
          } : onBack}>
            <span className="icon-arrow-left"></span>
            Back
          </button>

          {!showDirections && (
            <>
              <div className="route-buttons">
                <button
                  className="route-button-field"
                  onClick={() => setView('starting-point')}
                >
                  <span className="route-button-text">
                    {startPoint || "Choose a starting point"}
                  </span>
                  {bothInputsFilled ? (
                    <span className="input-badge">1</span>
                  ) : (
                    <img src={searchIcon} alt="Search" className="button-icon" />
                  )}
                </button>

                <button
                  className="route-button-field"
                  onClick={() => setView('destination')}
                >
                  <span className="route-button-text">
                    {destination || "Enter Destination"}
                  </span>
                  {bothInputsFilled ? (
                    <span className="input-badge">2</span>
                  ) : (
                    <img src={routeIcon} alt="Route" className="button-icon" />
                  )}
                </button>
              </div>

              {!bothInputsFilled ? (
                <div className="route-actions">
                  <button className="btn-filter-route" onClick={onFilterClick}>
                    <img src={sliderIcon} alt="Filter" className="button-icon" />
                    Filter
                  </button>
                  <button
                    className="btn-configure-route"
                    onClick={handleConfigureRoute}
                    disabled={loading || !startPoint || !destination}
                  >
                    <img src={CrossroadIcon} alt="Configure" className="button-icon" />
                    Configure route
                  </button>
                </div>
              ) : (
                // Filled state: Three icon-only buttons
                <div className="route-actions-icons">
                  <button
                    className="icon-button icon-button-primary"
                    onClick={handleConfigureRoute}
                    disabled={loading}
                    title="Configure route"
                  >
                    <img src={CrossroadIcon} alt="Configure" className="action-icon" />
                  </button>
                  <button
                    className="icon-button icon-button-primary"
                    onClick={onFilterClick}
                    title="Filter"
                  >
                    <img src={sliderIcon} alt="Filter" className="action-icon" />
                  </button>
                  <button
                    className="icon-button icon-button-secondary"
                    onClick={handleConfigureRoute}
                    disabled={loading}
                    title="Search"
                  >
                    <img src={searchIcon} alt="Search" className="action-icon" />
                  </button>
                </div>
              )}
            </>
          )}

          {error && <div className="error-message">{error}</div>}

          {showDirections && routeInfo && (
            <div className="directions-container">
              <div className="route-summary">
                <h3>{routeInfo.startAddress}</h3>
                <p>to {routeInfo.endAddress}</p>
                <div className="route-stats">
                  <span>{routeInfo.duration} ({routeInfo.distance})</span>
                </div>
              </div>

              <div className="turn-by-turn-directions">
                {routeSteps.map((step, index) => (
                  <div key={index} className="direction-step">
                    <div className="step-icon">
                      <span className="step-arrow">→</span>
                    </div>
                    <div className="step-content">
                      <div
                        className="step-instruction"
                        dangerouslySetInnerHTML={{ __html: step.instruction }}
                      />
                      <div className="step-details">
                        <span>{step.duration}</span>
                        <span>{step.distance}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map remains visible */}
        <div ref={mapContainerRef} className="plan-route-map"></div>
        {loading && <div className="loading-overlay">Calculating route...</div>}
      </div>
    );
  }

  // Starting point selection view
  if (view === 'starting-point') {
    return (
      <div className="plan-route-overlay">
        <div className="plan-route-card-expanded">
          <button className="back-button" onClick={() => setView('main')}>
            <span className="icon-arrow-left"></span>
            Back
          </button>

          <h3 className="selection-title">Choose a starting point</h3>

          {mapsLoaded ? (
            <AddressAutocomplete
              value={startPoint}
              onChange={setStartPoint}
              onPlaceSelected={handleStartPlaceSelected}
              placeholder="123 Queen Street"
              className="route-autocomplete-input"
            />
          ) : (
            <div className="loading-message">Loading address search...</div>
          )}

          <button className="use-location-button" onClick={handleUseMyLocation}>
            <img src={NavigationIcon} alt="Navigation" className="button-icon" />
            Use my location
          </button>

          {error && <div className="error-message">{error}</div>}
          {geoError && <div className="error-message">Location: {geoError}</div>}
        </div>

        <div ref={mapContainerRef} className="plan-route-map"></div>
      </div>
    );
  }

  // Destination selection view
  if (view === 'destination') {
    return (
      <div className="plan-route-overlay">
        <div className="plan-route-card-expanded">
          <button className="back-button" onClick={() => setView('main')}>
            <span className="icon-arrow-left"></span>
            Back
          </button>

          <h3 className="selection-title">Choose a destination</h3>

          {mapsLoaded ? (
            <AddressAutocomplete
              value={destination}
              onChange={setDestination}
              onPlaceSelected={handleDestinationPlaceSelected}
              placeholder="Enter destination address"
              className="route-autocomplete-input"
            />
          ) : (
            <div className="loading-message">Loading address search...</div>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>

        <div ref={mapContainerRef} className="plan-route-map"></div>
      </div>
    );
  }
}

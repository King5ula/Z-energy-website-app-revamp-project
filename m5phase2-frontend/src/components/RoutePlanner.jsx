import { useState, useEffect, useRef } from 'react';
import AddressAutocomplete from './AddressAutocomplete';
import '../styles/RoutePlanner.css';
import CrossroadIcon from '../assets/Crossroad.png';
import SliderIcon from '../assets/Slider.png';
import CrossroadIconInverted from '../assets/Crossroad-inverted.png';
import SliderIconInverted from '../assets/Slider-inverted.png';

// this basically handles route planning with station waypoints
function RoutePlanner({ userLocation, routeData, onRouteCreated, onClose }) {
  const [startPoint, setStartPoint] = useState('');
  const [destination, setDestination] = useState('');
  const [startLocation, setStartLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routeResult, setRouteResult] = useState(null);
  const [directionsData, setDirectionsData] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState('5km');
  const [preferences, setPreferences] = useState({
    avoidTolls: false,
    avoidHighways: false,
    avoidFerries: false,
    travelMode: 'DRIVING'
  });
  const hasAutoPlanned = useRef(false); // ponytail: track if we've auto-planned for current routeData
  const [manualMode, setManualMode] = useState(false); // ponytail: prevent auto-plan when user clicks back
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const crossroadIcon = isDarkMode ? CrossroadIconInverted : CrossroadIcon;
  const sliderIcon = isDarkMode ? SliderIconInverted : SliderIcon;

  useEffect(() => {
    if (routeData) {
      hasAutoPlanned.current = false; // reset when routeData changes
      setManualMode(false); // reset manual mode for new routeData
      if (routeData.startPoint) {
        const startText = typeof routeData.startPoint === 'string'
          ? routeData.startPoint
          : routeData.startPoint.address || `${routeData.startPoint.lat}, ${routeData.startPoint.lng}`;
        setStartPoint(startText);
      }
      if (routeData.destination) {
        // ponytail: Handle both string addresses and coordinate objects
        const destText = typeof routeData.destination === 'string'
          ? routeData.destination
          : routeData.destination.address || `${routeData.destination.lat}, ${routeData.destination.lng}`;
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

      if (routeData.startLocation && routeData.destinationLocation && !hasAutoPlanned.current && !manualMode) {
        hasAutoPlanned.current = true;
        setTimeout(() => {
          planRoute(
            routeData.startLocation,
            routeData.destinationLocation,
            routeData.preferences || { travelMode: 'DRIVING' }
          );
        }, 100);
      }
    }
  }, [routeData, manualMode]);

  const planRoute = async (startLoc, destLoc, prefs = {}) => {
    console.log('planRoute called with:', { startLoc, destLoc, prefs });
    setLoading(true);
    setError(null);

    // ponytail: capture current state values to avoid closure issues in callback
    const currentStartPoint = startPoint;
    const currentDestination = destination;

    const timeout = setTimeout(() => {
      console.error('Route planning timed out after 30 seconds');
      setError('Route planning timed out. Please try again.');
      setLoading(false);
    }, 30000);

    try {
      if (!window.google || !window.google.maps) {
        clearTimeout(timeout);
        throw new Error('Google Maps not loaded');
      }

      const directionsService = new window.google.maps.DirectionsService();

      const origin = typeof startLoc === 'string'
        ? startLoc
        : new window.google.maps.LatLng(startLoc.lat, startLoc.lng);

      const destination = typeof destLoc === 'string'
        ? destLoc
        : new window.google.maps.LatLng(destLoc.lat, destLoc.lng);

      const request = {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING
      };

      console.log('Requesting directions...', request);

      directionsService.route(request, (result, status) => {
        clearTimeout(timeout);
        console.log('Directions result:', status, result);

        if (status === 'OK') {
          const route = result.routes[0].legs[0];

          setDirectionsData({
            duration: route.duration.text,
            distance: route.distance.text,
            startAddress: route.start_address,
            endAddress: route.end_address,
            steps: route.steps.map(step => ({
              instruction: step.instructions,
              distance: step.distance.text,
              duration: step.duration.text
            }))
          });

          const routeData = {
            startPoint: currentStartPoint,
            destination: currentDestination,
            startLocation: startLoc,
            destinationLocation: destLoc,
            preferences: prefs
          };

          setRouteResult(routeData);
          if (onRouteCreated) {
            onRouteCreated(routeData);
          }
          setLoading(false);
        } else {
          console.error('Directions request failed:', status);
          setError(`Failed to calculate route: ${status}`);
          setLoading(false);
        }
      });
    } catch (err) {
      clearTimeout(timeout);
      console.error('Route planning error:', err);
      setError(err.message || 'Failed to plan route');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation && !startPoint) {
      setStartPoint(`${userLocation.lat}, ${userLocation.lng}`);
      setStartLocation(userLocation);
    }
  }, [userLocation, startPoint]);

  const handleStartPlaceSelected = (place) => {
    console.log('Start place selected:', place);
    setStartPoint(place.address); // Update the text field
    setStartLocation(place.location);
  };

  const handleDestinationPlaceSelected = (place) => {
    console.log('Destination place selected:', place);
    setDestination(place.address); // Update the text field
    setDestinationLocation(place.location);
  };

  const handlePlanRoute = async () => {
    console.log('handlePlanRoute called');
    if (!startPoint || !destination) {
      setError('Please provide both start point and destination');
      return;
    }

    const parsedStart = startLocation || userLocation;
    const parsedDestination = destinationLocation;

    if (!parsedStart || !parsedDestination) {
      setError('Please select addresses from the dropdown suggestions');
      return;
    }

    setManualMode(false); // user is manually planning, allow normal flow
    planRoute(parsedStart, parsedDestination, preferences);
  };

  const handlePreferenceChange = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleTravelModeChange = (mode) => {
    setPreferences(prev => ({
      ...prev,
      travelMode: mode
    }));
  };

  return (
    <div className={`route-planner ${isMinimized ? 'minimized' : ''}`}>
      <div className="route-planner-header" onClick={() => isMinimized && setIsMinimized(false)}>
        <h2>Plan Your Route</h2>
        <button
          className="minimize-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(!isMinimized);
          }}
          aria-label={isMinimized ? "Maximize" : "Minimize"}
        >
          {isMinimized ? '□' : '−'}
        </button>
      </div>

      {!isMinimized && (
        <div className="route-planner-content">
          {!directionsData ? (
            <>
              <button className="btn-back" onClick={onClose}>
                ← Back
              </button>

              <div className="input-section">
                <div className="input-group">
                  <label>Starting Point</label>
                  <AddressAutocomplete
                    value={startPoint}
                    onChange={setStartPoint}
                    onPlaceSelected={handleStartPlaceSelected}
                    placeholder="Enter starting address"
                    className="route-input"
                  />
                </div>

                <div className="input-group">
                  <label>Destination</label>
                  <AddressAutocomplete
                    value={destination}
                    onChange={setDestination}
                    onPlaceSelected={handleDestinationPlaceSelected}
                    placeholder="Enter destination address"
                    className="route-input"
                  />
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              {routeResult && !directionsData && (
                <div className="route-result">
                  <h3>Route Ready</h3>
                  <p>Route will be displayed on the map using Google Maps Directions</p>
                </div>
              )}

              <button
                className="btn-plan-route"
                onClick={handlePlanRoute}
                disabled={loading || !startPoint || !destination}
              >
                {loading ? 'Planning Route...' : 'Plan Route'}
              </button>
            </>
          ) : (
            <div className="directions-container">
              <button className="btn-back" onClick={onClose}>
                ← Back
              </button>

              <div className="select-radius-container">
                <select
                  className="select-radius"
                  value={selectedRadius}
                  onChange={(e) => setSelectedRadius(e.target.value)}
                >
                  <option value="2km">2 km radius</option>
                  <option value="5km">5 km radius</option>
                  <option value="10km">10 km radius</option>
                  <option value="20km">20 km radius</option>
                </select>
              </div>

              <div className="route-summary">
                <div className="route-addresses">
                  <div className="route-address-item">
                    <span className="route-marker">1</span>
                    <span className="route-address-text">{directionsData.startAddress}</span>
                  </div>
                  <div className="route-address-item">
                    <span className="route-marker">2</span>
                    <span className="route-address-text">{directionsData.endAddress}</span>
                  </div>
                </div>
              </div>

              <div className="route-actions-row">
                <button className="btn-list-nearby-stations">
                  List Nearby Stations
                </button>

                <div className="route-action-icons">
                  <button
                    className="icon-btn"
                    onClick={handlePlanRoute}
                    title="Configure route"
                  >
                    <img src={crossroadIcon} alt="Configure" className="icon-img" />
                  </button>
                  <button
                    className="icon-btn"
                    title="Filter preferences"
                  >
                    <img src={sliderIcon} alt="Filter" className="icon-img" />
                  </button>
                </div>
              </div>

              <div className="route-stats-summary">
                <p>{directionsData.startAddress}</p>
                <p className="destination-text">to {directionsData.endAddress}</p>
                <div className="route-stats">
                  <span className="route-stat">{directionsData.duration} ({directionsData.distance})</span>
                </div>
              </div>

              <div className="directions-steps">
                {directionsData.steps.map((step, index) => (
                  <div key={index} className="direction-step">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                      <div
                        className="step-instruction"
                        dangerouslySetInnerHTML={{ __html: step.instruction }}
                      />
                      <div className="step-details">
                        <span>{step.duration}</span>
                        <span className="step-separator">•</span>
                        <span>{step.distance}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RoutePlanner;

import { useState, useEffect } from 'react';
import AddressAutocomplete from './AddressAutocomplete';
import '../styles/RoutePlanner.css';

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
  const [preferences, setPreferences] = useState({
    avoidTolls: false,
    avoidHighways: false,
    avoidFerries: false,
    travelMode: 'DRIVING'
  });

  useEffect(() => {
    if (routeData) {
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

      if (routeData.startLocation && routeData.destinationLocation) {
        setTimeout(() => {
          planRoute(
            routeData.startLocation,
            routeData.destinationLocation,
            routeData.preferences || { travelMode: 'DRIVING' }
          );
        }, 100);
      }
    }
  }, [routeData]);

  const planRoute = async (startLoc, destLoc, prefs = {}) => {
    console.log('planRoute called with:', { startLoc, destLoc, prefs });
    setLoading(true);
    setError(null);

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
            startPoint: startLoc,
            destination: destLoc,
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
              <button className="btn-back" onClick={() => setDirectionsData(null)}>
                ← Back
              </button>

              <div className="route-summary">
                <div className="route-addresses">
                  <div className="route-address-item">
                    <span className="route-marker">A</span>
                    <span className="route-address-text">{directionsData.startAddress}</span>
                  </div>
                  <div className="route-address-item">
                    <span className="route-marker">B</span>
                    <span className="route-address-text">{directionsData.endAddress}</span>
                  </div>
                </div>
                <div className="route-stats">
                  <span className="route-stat">{directionsData.duration}</span>
                  <span className="route-stat-separator">•</span>
                  <span className="route-stat">{directionsData.distance}</span>
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

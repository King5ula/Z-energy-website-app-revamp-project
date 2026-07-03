import { useState, useEffect } from 'react';
import '../styles/DirectionsPanelDesktop.css';

function DirectionsPanelDesktop({ origin, destination }) {
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!origin || !destination || !window.google) {
      return;
    }

    calculateDirections();
  }, [origin, destination]);

  const calculateDirections = () => {
    setLoading(true);
    setError(null);

    const directionsService = new window.google.maps.DirectionsService();

    const request = {
      origin: new window.google.maps.LatLng(origin.lat, origin.lng),
      destination: new window.google.maps.LatLng(destination.lat, destination.lng),
      travelMode: window.google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        setDirections(result);
        setLoading(false);
      } else {
        setError('Could not calculate directions');
        setLoading(false);
        console.error('Directions request failed:', status);
      }
    });
  };

  if (loading) {
    return (
      <div className="directions-panel-desktop">
        <h3>Directions</h3>
        <p>Calculating route...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="directions-panel-desktop">
        <h3>Directions</h3>
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!directions) {
    return null;
  }

  const route = directions.routes[0];
  const leg = route.legs[0];

  return (
    <div className="directions-panel-desktop">
      <h3>Directions</h3>

      <div className="route-summary">
        <p><strong>Distance:</strong> {leg.distance.text}</p>
        <p><strong>Duration:</strong> {leg.duration.text}</p>
      </div>

      <div className="turn-by-turn">
        <h4>Turn-by-turn</h4>
        <ol className="steps-list">
          {leg.steps.map((step, index) => (
            <li key={index} className="step-item">
              <div
                className="step-instruction"
                dangerouslySetInnerHTML={{ __html: step.instructions }}
              />
              <div className="step-details">
                {step.distance.text} • {step.duration.text}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default DirectionsPanelDesktop;

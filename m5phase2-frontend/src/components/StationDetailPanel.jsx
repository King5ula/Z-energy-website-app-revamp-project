import { buildDirectionsUrl } from '../utils/directionsHelper';
import DirectionsPanelDesktop from './DirectionsPanelDesktop';
import '../styles/StationDetailPanel.css';

function StationDetailPanel({ station, userLocation, deviceType, onClose }) {
  if (!station) return null;

  const stationLocation = {
    lat: station.location.coordinates[1],
    lng: station.location.coordinates[0]
  };

  const handleGetDirections = () => {
    if (deviceType === 'mobile' && userLocation) {
      const url = buildDirectionsUrl(userLocation, stationLocation);
      if (url) {
        window.open(url, '_blank');
      }
    }
  };

  return (
    <div className="station-detail-panel">
      <div className="panel-header">
        <h2>{station.name}</h2>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="panel-content">
        <div className="station-info">
          <h3>Address</h3>
          <p>
            {station.address.line1}<br />
            {station.address.suburb}, {station.address.region} {station.address.postcode}
          </p>

          <h3>Opening Hours</h3>
          <p>{station.openingHours}</p>

          {station.phone && (
            <>
              <h3>Phone</h3>
              <p>{station.phone}</p>
            </>
          )}

          {station.amenities && station.amenities.length > 0 && (
            <>
              <h3>Amenities</h3>
              <ul className="amenities-list">
                {station.amenities.map((amenity, index) => (
                  <li key={index}>{amenity}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="directions-section">
          {deviceType === 'mobile' ? (
            <button
              className="btn-primary btn-directions"
              onClick={handleGetDirections}
              disabled={!userLocation}
            >
              Get Directions
            </button>
          ) : (
            userLocation && (
              <DirectionsPanelDesktop
                origin={userLocation}
                destination={stationLocation}
              />
            )
          )}

          {!userLocation && (
            <p className="location-hint">
              Enable location access to get directions
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StationDetailPanel;

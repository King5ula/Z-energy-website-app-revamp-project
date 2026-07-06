import { useState } from "react";
import "./FilterPreferences.module.css";

export default function FilterPreferences({ onBack, onApply }) {
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [openNow, setOpenNow] = useState(false);

  const amenitiesList = [
    "Car Wash",
    "ATM",
    "Restrooms",
    "Wi-Fi",
    "Coffee",
    "Food Court",
    "EV Charging",
    "Air Pump",
  ];

  const servicesList = [
    "Z Card Accepted",
    "Sharetank Available",
    "LPG Available",
    "AdBlue Available",
    "Premium Fuel",
    "Diesel",
  ];

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleApply = () => {
    const filters = {
      amenities: selectedAmenities,
      services: selectedServices,
      openNow,
    };
    console.log("Applied filters:", filters);
    if (onApply) {
      onApply(filters);
    }
  };

  const handleClear = () => {
    setSelectedAmenities([]);
    setSelectedServices([]);
    setOpenNow(false);
  };

  return (
    <div className="filter-preferences-page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack}>
          <span className="back-arrow"></span> Back
        </button>
        <h1>Filter Preferences</h1>
      </header>

      <div className="filter-content">
        <div className="filter-section">
          <h2>Availability</h2>
          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={openNow}
                onChange={(e) => setOpenNow(e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">Open Now</span>
            </label>
          </div>
        </div>

        <div className="filter-section">
          <h2>Amenities</h2>
          <div className="filter-group">
            {amenitiesList.map((amenity) => (
              <label key={amenity} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h2>Services</h2>
          <div className="filter-group">
            {servicesList.map((service) => (
              <label key={service} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service)}
                  onChange={() => toggleService(service)}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">{service}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-actions">
          <button className="btn-clear" onClick={handleClear}>
            Clear All
          </button>
          <button className="btn-apply" onClick={handleApply}>
            Apply Filters
          </button>
        </div>

        {(selectedAmenities.length > 0 || selectedServices.length > 0 || openNow) && (
          <div className="active-filters">
            <h3>Active Filters ({selectedAmenities.length + selectedServices.length + (openNow ? 1 : 0)})</h3>
            <div className="filter-tags">
              {openNow && (
                <span className="filter-tag">
                  Open Now
                  <button onClick={() => setOpenNow(false)}><span className="close-icon"></span></button>
                </span>
              )}
              {selectedAmenities.map((amenity) => (
                <span key={amenity} className="filter-tag">
                  {amenity}
                  <button onClick={() => toggleAmenity(amenity)}><span className="close-icon"></span></button>
                </span>
              ))}
              {selectedServices.map((service) => (
                <span key={service} className="filter-tag">
                  {service}
                  <button onClick={() => toggleService(service)}><span className="close-icon"></span></button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

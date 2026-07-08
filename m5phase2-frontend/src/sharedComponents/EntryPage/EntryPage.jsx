import { useState, useEffect } from "react";
import "./EntryPage.css";
import SearchIcon from "../../assets/Search.png";
import SearchIconInverted from "../../assets/Search-inverted.png";
import RouteIcon from "../../assets/Route.png";
import RouteIconInverted from "../../assets/Route-inverted.png";
import SliderIcon from "../../assets/Slider.png";
import SliderIconInverted from "../../assets/Slider-inverted.png";
import NearbyStation from "../../pages/NearbyStation/NearbyStation";

export default function EntryPage({ onAllow, onDeny, onSearch, onPlanRoute, onFilter }) {
  const [showConsent, setShowConsent] = useState(true);
  const [showActionOverlay, setShowActionOverlay] = useState(false);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [startPoint, setStartPoint] = useState("");
  const [destination, setDestination] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNearbyStation, setShowNearbyStation] = useState(false);

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

  const handleConsentAllow = () => {
    setShowConsent(false);
    setShowActionOverlay(true);
    if (onAllow) onAllow();
  };

  const handleConsentDeny = () => {
    setShowConsent(false);
    setShowActionOverlay(true);
    if (onDeny) onDeny();
  };

  const handlePlanRouteClick = () => {
    setShowRouteForm(true);
  };

  const handleBackFromRoute = () => {
    setShowRouteForm(false);
    setStartPoint("");
    setDestination("");
  };

  const handleConfigureRoute = () => {
    if (onPlanRoute) {
      onPlanRoute({ startPoint, destination });
    }
  };

  const handleSearch = () => {
    setShowNearbyStation(true);
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleFilterClick = () => {
    if (onFilter) {
      onFilter();
    }
  };

  if (showNearbyStation) {
    return <NearbyStation onBack={() => setShowNearbyStation(false)} />;
  }

  return (
    <div className="entry-page">
      {/* Consent Modal */}
      {showConsent && (
        <div className="consent-modal-overlay">
          <div className="consent-modal">
            <h2>Find Z stations near you?</h2>
            <p>We'd like to use your location to show you the nearest Z Energy stations.</p>
            <div className="consent-modal-actions">
              <button className="btn-primary" onClick={handleConsentAllow}>
                Allow
              </button>
              <button className="btn-secondary" onClick={handleConsentDeny}>
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Overlay */}
      {showActionOverlay && (
        <div className="action-overlay">
          {showRouteForm ? (
            <div className="action-card route-form">
              <button className="back-button" onClick={handleBackFromRoute}>
                <span className="back-arrow"></span> Back
              </button>

              <div className="route-inputs">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Choose a starting point"
                    value={startPoint}
                    onChange={(e) => setStartPoint(e.target.value)}
                    className="route-input"
                  />
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Enter Destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="route-input"
                  />
                </div>
              </div>

              <div className="route-actions">
                <button className="btn-filter" onClick={handleFilterClick}>
                  <span className="filter-icon"></span> Filter
                </button>
                <button className="btn-configure" onClick={handleConfigureRoute}>
                  Configure route
                </button>
              </div>
            </div>
          ) : (
            <div className="action-card">
              <h2 className="action-title">Where are you heading?</h2>

              <div className="action-options">
                <button className="action-option" onClick={handleSearch}>
                  <div className="option-content">
                    <img src={searchIcon} alt="Search" className="option-icon-img" />
                    <input
                      type="text"
                      placeholder="Search for a nearby station"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="option-input"
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                </button>

                <button className="action-option" onClick={handlePlanRouteClick}>
                  <div className="option-content">
                    <img src={routeIcon} alt="Route" className="option-icon-img" />
                    <span className="option-text">Plan your route</span>
                  </div>
                  <span className="option-arrow"></span>
                </button>

                <button className="action-option" onClick={handleFilterClick}>
                  <div className="option-content">
                    <img src={sliderIcon} alt="Filter" className="option-icon-img" />
                    <span className="option-text">Filter your preferences</span>
                  </div>
                  <span className="option-arrow"></span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

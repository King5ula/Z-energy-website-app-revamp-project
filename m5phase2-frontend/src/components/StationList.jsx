import { useState, useEffect } from 'react';
import '../styles/StationList.css';

function StationList({
  viewLevel,
  selectedRegion,
  selectedSuburb,
  searchQuery,
  onRegionClick,
  onSuburbClick,
  onStationClick
}) {
  const [regions, setRegions] = useState([]);
  const [suburbs, setSuburbs] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (viewLevel === 'country') {
      fetchRegions();
    } else if (viewLevel === 'region' && selectedRegion) {
      fetchSuburbs(selectedRegion);
    } else if (viewLevel === 'suburb' && selectedSuburb) {
      fetchStations(selectedSuburb, selectedRegion);
    }
  }, [viewLevel, selectedRegion, selectedSuburb]);

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/regions');
      const result = await response.json();
      const data = result.success ? result.data : result;
      setRegions(data);
    } catch (error) {
      console.error('Failed to fetch regions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuburbs = async (region) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/regions/${encodeURIComponent(region)}/suburbs`);
      const result = await response.json();
      const data = result.success ? result.data : result;
      setSuburbs(data);
    } catch (error) {
      console.error('Failed to fetch suburbs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async (suburb, region) => {
    setLoading(true);
    try {
      const url = `/api/suburbs/${encodeURIComponent(suburb)}/stations${region ? `?region=${encodeURIComponent(region)}` : ''}`;
      const response = await fetch(url);
      const result = await response.json();
      const data = result.success ? result.data : result;
      setStations(data);
    } catch (error) {
      console.error('Failed to fetch stations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = (items, field) => {
    if (!searchQuery) return items;
    return items.filter(item =>
      item[field]?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="station-list">
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  return (
    <div className="station-list">
      {viewLevel === 'country' && (
        <div className="list-section">
          <h3 className="list-title">Regions ({regions.length})</h3>
          <div className="list-items">
            {filterItems(regions, 'region').map((region) => (
              <button
                key={region.region}
                className="list-item"
                onClick={() => onRegionClick(region.region)}
              >
                <span className="item-name">{region.region}</span>
                <span className="item-count">{region.count} stations</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {viewLevel === 'region' && (
        <div className="list-section">
          <h3 className="list-title">Suburbs in {selectedRegion} ({suburbs.length})</h3>
          <div className="list-items">
            {filterItems(suburbs, 'suburb').map((suburb) => (
              <button
                key={suburb.suburb}
                className="list-item"
                onClick={() => onSuburbClick(suburb.suburb)}
              >
                <span className="item-name">{suburb.suburb}</span>
                <span className="item-count">{suburb.count} stations</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {viewLevel === 'suburb' && (
        <div className="list-section">
          <h3 className="list-title">Stations in {selectedSuburb} ({stations.length})</h3>
          <div className="list-items">
            {filterItems(stations, 'name').map((station) => (
              <button
                key={station._id}
                className="list-item station-item"
                onClick={() => onStationClick(station)}
              >
                <div className="station-info">
                  <span className="station-name">{station.name}</span>
                  <span className="station-address">{station.address.line1}</span>
                </div>
                <span className="item-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {((viewLevel === 'country' && filterItems(regions, 'region').length === 0) ||
        (viewLevel === 'region' && filterItems(suburbs, 'suburb').length === 0) ||
        (viewLevel === 'suburb' && filterItems(stations, 'name').length === 0)) && (
        <div className="no-results">No results found for "{searchQuery}"</div>
      )}
    </div>
  );
}

export default StationList;

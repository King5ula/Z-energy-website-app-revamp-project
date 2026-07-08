import React, { useReducer, useEffect, useState, useMemo, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import Navbar from '../../components/Navbar.jsx';
import StationSearchForm from '../../components/StationSearchForm.jsx';
import StationCard from '../../components/StationCard.jsx';
import Comparisons from '../../components/Comparisons.jsx';
import HoverPopup from '../../components/HoverPopup.jsx';
import searchIcon from '../../assets/icons/search.svg';
import sliderIcon from '../../assets/icons/slider.svg';
import crossroadIcon from '../../assets/icons/crossroad.svg';
import styles from './NearbyStation.module.css';
import customPinImg from '../../assets/icons/property-1-variant-2.svg';


function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

function MobileTopSearchBar({ searchWord, onEdit, onBack, showBack }) {
  return (
    <div className={styles.mobileTopBar}>
      {showBack && (
        <button
          type="button"
          className={styles.mobileTopBackBtnSide}
          onClick={onBack}
          aria-label="Go back to station list"
        >
          <span aria-hidden="true">←</span>
          <span>Back</span>
        </button>
      )}
      <div
        className={styles.mobileTopSearchFrame}
        onClick={onEdit}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onEdit();
          }
        }}
      >
        <span className={styles.mobileTopSearchText}>{searchWord || 'Search location'}</span>
        <img src={searchIcon} alt="" className={styles.mobileTopSearchIcon} />
      </div>
      <button type="button" className={styles.mobileTopIconBtn} aria-label="Filters">
        <img src={sliderIcon} alt="" />
      </button>
      <button type="button" className={styles.mobileTopIconBtn} aria-label="Map layers">
        <img src={crossroadIcon} alt="" />
      </button>
    </div>
  );
}

const extractBranchName = (station) => {
    if (!station) return "Z Station";
    const websiteUrl = station.website;
    const physicalAddress = station.address;

    if (websiteUrl && typeof websiteUrl === 'string' && websiteUrl.trim() !== '') {
        try {
            const cleanUrl = websiteUrl.replace(/\/$/, "");
            const segments = cleanUrl.split('/');
            const lastSegment = segments[segments.length - 1] || "";
            const cleanSlug = lastSegment.replace(/^z-/, "").replace(/-/g, " ").trim();
            if (cleanSlug && cleanSlug.toLowerCase() !== "station") {
                return cleanSlug.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            }
        } catch (error) {
      }
  }
    if (physicalAddress && typeof physicalAddress === 'string' && physicalAddress.trim() !== '') {
        try {
            const segments = physicalAddress.split(',');
            if (segments.length >= 2) {
                const cleanSuburb = segments[1].replace(/\d+/g, '').trim();
                if (cleanSuburb) return cleanSuburb;
            }
        } catch (error) {
          console.log('Address segment fallback bypass', error);
    }
  }
    return station.name && station.name.trim() !== '' ? station.name.trim() : "Station";
};

const haversineMeters = (from, to) => {
  if (!from || !to) return Infinity;
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};

// Rank a station against the typed query: 3 = prefix match, 1 = contains, 0 = no match.
const scoreSuggestion = (station, query) => {
  const fields = [station.officialName, station.name, station.address, station.website];
  let best = 0;
  for (const field of fields) {
    if (!field || typeof field !== 'string') continue;
    const value = field.toLowerCase();
    if (value.startsWith(query)) best = Math.max(best, 3);
    else if (value.includes(query)) best = Math.max(best, 1);
  }
  return best;
};

const STORAGE_KEY = 'nearby-station-workflow-v1';

const initialState = {
  currentStep: 1,
  searchWord: '',
  stations: [],
  selectedStation: null,
  mapCenter: { lat: -40.9006, lng: 174.8860 },
  mapZoom: 5.5,
  radius: 15000,
  suggestions: []
};

const readStoredWorkflow = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Unable to read nearby station workflow from session storage', error);
    return null;
  }
};

const buildWorkflowSnapshot = (state, expandedMobileStationId) => ({
  state,
  expandedMobileStationId
});

function stationReducer(state, action) {
  switch (action.type) {
    case 'CHANGE_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchWord: action.payload };
    case 'SET_STATIONS':
      return { ...state, stations: Array.isArray(action.payload) ? action.payload : [] };
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: Array.isArray(action.payload) ? action.payload : [] };
    case 'SELECT_STATION':
      return { ...state, selectedStation: action.payload };
    case 'SET_RADIUS':
      return { ...state, radius: action.payload };
    case 'SELECT_SUGGESTION':
      const coords = action.payload.location?.coordinates;
      return {
        ...state,
        searchWord: action.payload.officialName || action.payload.address || '',
        currentStep: 2,
        suggestions: [],
        mapCenter: coords && coords.length === 2 ? { lat: Number(coords[1]), lng: Number(coords[0]) } : state.mapCenter,
        mapZoom: 13
      };
    case 'RESTORE_WORKFLOW':
      return action.payload?.state || state;
    default:
      return state;
  }
}

function MapCameraController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !center) return;
    map.panTo(center);
    map.setZoom(zoom);
  }, [center, zoom, map]);
  return null;
}

export default function NearbyStation({ onBack }) {
  const initialWorkflow = useMemo(() => {
    const stored = readStoredWorkflow();
    if (!stored) return initialState;
    return {
      ...initialState,
      ...stored.state,
      mapCenter: stored.state?.mapCenter || initialState.mapCenter,
      mapZoom: stored.state?.mapZoom || initialState.mapZoom,
      radius: stored.state?.radius || initialState.radius,
      suggestions: Array.isArray(stored.state?.suggestions) ? stored.state.suggestions : []
    };
  }, []);
  const [state, dispatch] = useReducer(stationReducer, initialWorkflow);
  const [hoveredStationId, setHoveredStationId] = useState(null);
  // When a facility icon is hovered on a comparison card, every station that
  // offers that facility shows a chip on the map. Shape: { key, label } | null.
  const [hoveredFacility, setHoveredFacility] = useState(null);
  // Mobile-only: which station's accordion is taking over the list panel.
  const [expandedMobileStationId, setExpandedMobileStationId] = useState(() => {
    if (typeof window === 'undefined') return null;
    const stored = readStoredWorkflow();
    return stored?.expandedMobileStationId || null;
  });
  const isMobile = useIsMobile();
  const lastStepRef = useRef(state.currentStep);
  const hasInitializedHistoryRef = useRef(false);

  const handleMobileBack = () => {
    if (expandedMobileStationId) {
      setExpandedMobileStationId(null);
      return;
    }

    if (state.currentStep > 1) {
      dispatch({ type: 'CHANGE_STEP', payload: Math.max(1, state.currentStep - 1) });
    } else if (onBack) {
      onBack();
    }
  };

  useEffect(() => {
    const loadNationalStationsIndex = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/stations`);
        const data = await response.json();
        dispatch({ type: 'SET_STATIONS', payload: data });
      } catch (err) {
        console.error("National fuel mapping database loading error:", err);
      }
    };
    loadNationalStationsIndex();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(buildWorkflowSnapshot(state, expandedMobileStationId)));
    }
  }, [state, expandedMobileStationId]);

  useEffect(() => {
    if (state.currentStep < 3) {
      setExpandedMobileStationId(null);
    }
  }, [state.currentStep]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hasInitializedHistoryRef.current) {
      hasInitializedHistoryRef.current = true;
      const initialEntry = { workflow: buildWorkflowSnapshot(state, expandedMobileStationId) };
      window.history.replaceState(initialEntry, '', window.location.pathname + window.location.search);
      lastStepRef.current = state.currentStep;
      return;
    }

    if (lastStepRef.current === state.currentStep) return;

    const nextEntry = { workflow: buildWorkflowSnapshot(state, expandedMobileStationId) };
    window.history.pushState(nextEntry, '', window.location.pathname + window.location.search);
    lastStepRef.current = state.currentStep;
  }, [state.currentStep, state.searchWord, state.selectedStation, expandedMobileStationId]);

  useEffect(() => {
    const handlePopState = (event) => {
      const snapshot = event.state?.workflow;
      if (snapshot) {
        dispatch({ type: 'RESTORE_WORKFLOW', payload: snapshot });
        setExpandedMobileStationId(snapshot.expandedMobileStationId || null);
        return;
      }

      if (state.currentStep > 1) {
        dispatch({ type: 'CHANGE_STEP', payload: Math.max(1, state.currentStep - 1) });
      } else if (onBack) {
        onBack();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onBack, state.currentStep]);

  useEffect(() => {
    if (state.currentStep !== 1) return;
    const query = state.searchWord.trim().toLowerCase();
    if (!query) {
      dispatch({ type: 'SET_SUGGESTIONS', payload: [] });
      return;
    }
    const topFive = state.stations
      .map((station) => ({ station, score: scoreSuggestion(station, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((entry) => entry.station);
    dispatch({ type: 'SET_SUGGESTIONS', payload: topFive });
  }, [state.searchWord, state.stations, state.currentStep]);

  const origin = state.mapCenter;
  const stationsWithDistance = useMemo(() => {
    return state.stations.map((station) => {
      const coords = station.location?.coordinates;
      const distanceInMeters = coords && coords.length === 2
        ? haversineMeters(origin, { lat: Number(coords[1]), lng: Number(coords[0]) })
        : Infinity;
      return { ...station, distanceInMeters };
    });
  }, [state.stations, origin.lat, origin.lng]);

  const nearbyStations = useMemo(() => {
    const withinRadius = state.radius === 999999
      ? stationsWithDistance
      : stationsWithDistance.filter((station) => station.distanceInMeters <= state.radius);
    return [...withinRadius]
      .sort((a, b) => a.distanceInMeters - b.distanceInMeters)
      .slice(0, 5);
  }, [stationsWithDistance, state.radius]);

  const lowestLocalPrice = useMemo(() => {
    const prices = nearbyStations
      .map((st) => st.priceZ91Unleaded)
      .filter((p) => p !== undefined && p > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  }, [nearbyStations]);

  const comparisonOptions = useMemo(() => {
    if (nearbyStations.length === 0) return [];
    const closest = nearbyStations[0];
    const cheapest = [...nearbyStations]
      .filter((st) => st.priceZ91Unleaded > 0)
      .sort((a, b) => a.priceZ91Unleaded - b.priceZ91Unleaded)[0];
    if (cheapest && cheapest._id !== closest._id) {
      return [closest, cheapest];
    }
    return nearbyStations.slice(0, 2);
  }, [nearbyStations]);

  // On mobile, expanding a station card takes over the panel (hides the list).
  const expandedMobileStation = expandedMobileStationId
    ? nearbyStations.find((st) => st._id === expandedMobileStationId) || null
    : null;

  return (
    <div className={styles.pageWithNav}>
      <Navbar />
      {isMobile && (
        <h1 className={styles.mobileHeading}>Find your nearest Z Energy station</h1>
      )}
      <div className={styles.zDesktopWorkflowContainer}>
      <div className={styles.zMapWrapper}>
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <Map
            style={{ width: '100%', height: '100%' }}
            defaultCenter={state.mapCenter}
            defaultZoom={state.mapZoom}
            gestureHandling={'greedy'}
            options={{ scrollwheel: true, disableDoubleClickZoom: false }}
            disableDefaultUI={true}
            mapId="DEMO_MAP_ID"
          >
            <MapCameraController center={state.mapCenter} zoom={state.mapZoom} />

            {stationsWithDistance.map((st, index) => {
              const isBargain = st.priceZ91Unleaded > 0 && st.priceZ91Unleaded === lowestLocalPrice;
              const markerCoords = st.location?.coordinates;
              if (!markerCoords || markerCoords.length !== 2) return null;
              const isHovered = hoveredStationId === st._id;

              return (
                <AdvancedMarker
                  key={`${st._id || index}-${index}`}
                  position={{ lat: Number(markerCoords[1]), lng: Number(markerCoords[0]) }}
                  onClick={() => dispatch({ type: 'SELECT_STATION', payload: st })}
                >
                  <div
                    style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    onMouseEnter={() => setHoveredStationId(st._id)}
                    onMouseLeave={() => setHoveredStationId(null)}
                  >
                    {isHovered && (
                      <HoverPopup
                        station={st}
                        isBargain={isBargain}
                        extractBranchName={() => extractBranchName(st)}
                      />
                    )}
                    {hoveredFacility && st[hoveredFacility.key] && (
                      <div className={styles.facilityMapChip}>
                        {hoveredFacility.label}
                        <span className={styles.facilityMapChipTail}></span>
                      </div>
                    )}
                    <img src={customPinImg} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain', cursor: 'pointer' }} />
                  </div>
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>
      </div>

      {state.currentStep === 1 && (
        <StationSearchForm
          state={state}
          dispatch={dispatch}
          suggestions={state.suggestions || []}
          extractBranchName={extractBranchName}
          onSelectSuggestion={(item) => dispatch({ type: 'SELECT_SUGGESTION', payload: item })}
          onBack={onBack}
        />
      )}

      {isMobile && state.currentStep >= 2 && (
        <MobileTopSearchBar
          searchWord={state.searchWord}
          onEdit={() => dispatch({ type: 'CHANGE_STEP', payload: 1 })}
          onBack={handleMobileBack}
          showBack={true}
        />
      )}

      {isMobile && state.currentStep === 2 && (
        <button
          type="button"
          className={`${styles.mobileBottomActionBtn} panel-fade`}
          onClick={() => dispatch({ type: 'CHANGE_STEP', payload: 3 })}
        >
          List Stations
        </button>
      )}

      {isMobile && state.currentStep === 3 && (
        <>
          {expandedMobileStation ? (
            <div className={`${styles.mobileCardsPanel} ${styles.mobileCardsPanelExpanded} panel-fade`}>
              <StationCard
                station={expandedMobileStation}
                isSelected={state.selectedStation?._id === expandedMobileStation._id}
                lowestLocalPrice={lowestLocalPrice}
                expanded={true}
                onToggleExpand={() => setExpandedMobileStationId(null)}
                onSelect={() => dispatch({ type: 'SELECT_STATION', payload: expandedMobileStation })}
              />
              <button
                type="button"
                className={styles.backToTopBtn}
                onClick={() => setExpandedMobileStationId(null)}
              >
                Back to Top
              </button>
            </div>
          ) : (
            <>
              <div className={`${styles.mobileCardsPanel} panel-fade`}>
                {nearbyStations.map((st) => (
                  <StationCard
                    key={st._id}
                    station={st}
                    isSelected={state.selectedStation?._id === st._id}
                    lowestLocalPrice={lowestLocalPrice}
                    expanded={false}
                    onToggleExpand={() => setExpandedMobileStationId(st._id)}
                    onSelect={() => dispatch({ type: 'SELECT_STATION', payload: st })}
                  />
                ))}
              </div>
              <button
                type="button"
                className={styles.mobileBottomActionBtn}
                onClick={() => dispatch({ type: 'CHANGE_STEP', payload: 4 })}
              >
                Compare Stations
              </button>
            </>
          )}
        </>
      )}

      {isMobile && state.currentStep === 4 && (
        <Comparisons
          isMobile
          options={comparisonOptions}
          onBack={() => dispatch({ type: 'CHANGE_STEP', payload: 3 })}
        />
      )}


      {!isMobile && state.currentStep === 2 && (
        <div className={styles.zDesktopModalOverlay}>
          <div className={`${styles.zDesktopSearchCard} panel-fade`}>

            <div className={styles.listHeaderRow}>
              <button
                onClick={() => dispatch({ type: 'CHANGE_STEP', payload: 1 })}
                className={styles.desktopBackBtn}
              >
                &lt; Back
              </button>

              <div className={styles.zDropdownWrapper}>
                <select
                  value={state.radius || '15000'}
                  onChange={(e) => dispatch({ type: 'SET_RADIUS', payload: Number(e.target.value) })}
                  className={styles.zRadiusSelectNative}
                >
                  <option value="5000">5 km</option>
                  <option value="10000">10 km</option>
                  <option value="15000">15 km (Default)</option>
                  <option value="25000">25 km</option>
                  <option value="50000">50 km</option>

                  <option value="999999">Whole NZ</option>
                </select>
                <span className={styles.zCustomChevronArrow}>▼</span>
              </div>
            </div>


            <div
              className={styles.desktopSearchInput}
              style={{ cursor: 'pointer', padding: '10px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}
              onClick={() => dispatch({ type: 'CHANGE_STEP', payload: 1 })}
            >
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--z-orange-primary)', fontFamily: 'DM Sans' }}>
                {state.searchWord || 'Howick'}
              </span>
              <span style={{ fontSize: '12px' }}>
                <img src={searchIcon} alt="" />
              </span>
            </div>

            <button
              onClick={() => dispatch({ type: 'CHANGE_STEP', payload: 3 })}
              className={styles.actionCompareBtn}
            >
              Compare stations now
            </button>

            <div className={styles.verticalCardsScroller}>

              {nearbyStations.map((st) => (
                <StationCard
                  key={st._id}
                  station={st}
                  isSelected={state.selectedStation?._id === st._id}
                  lowestLocalPrice={lowestLocalPrice}
                  onSelect={() => dispatch({ type: 'SELECT_STATION', payload: st })}
                />
              ))}
            </div>

          </div>
        </div>
      )}

      {!isMobile && state.currentStep === 3 && (
        <Comparisons
          options={comparisonOptions}
          onBack={() => dispatch({ type: 'CHANGE_STEP', payload: 2 })}
          onFacilityHover={setHoveredFacility}
        />
      )}
      </div>
    </div>
  );
}

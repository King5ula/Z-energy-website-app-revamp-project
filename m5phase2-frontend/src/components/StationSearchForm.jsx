import React, { useState } from 'react';
import styles from './StationSearchForm.module.css'; 
import searchIcon from '../assets/icons/search.svg';
import locator from '../assets/icons/navigation.svg';
import pin from '../assets/icons/vector.svg';

export default function StationSearchForm({ state, dispatch, onSelectSuggestion, suggestions, extractBranchName, onBack }) {

  const [activeIndex, setActiveIndex] = useState(-1);

  const activeSuggestions = Array.isArray(suggestions) ? suggestions : (Array.isArray(state.suggestions) ? state.suggestions : []);


  const handleKeyDown = (e) => {
    if (!activeSuggestions || activeSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % activeSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + activeSuggestions.length) % activeSuggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < activeSuggestions.length) {
        onSelectSuggestion(activeSuggestions[activeIndex]);
        setActiveIndex(-1);
      }
    } else if (e.key === 'Escape') {
      dispatch({ type: 'SET_SUGGESTIONS', payload: [] });
      setActiveIndex(-1);
    }
  };

  return (
    <div className={styles.desktopModalOverlay}>
      <div className={`${styles.desktopSearchCard} panel-fade`}>
        
        <button
          onClick={() => (onBack ? onBack() : dispatch({ type: 'CHANGE_STEP', payload: 1 }))}
          className={styles.desktopBackBtn}
        >
          <span className="back-arrow-bracket">&lt;</span> Back
        </button>

        <h2 className={styles.desktopSectionTitle}>Type address</h2>

        <div className={styles.desktopSearchInputFrame}>
          <input 
            type="text" 
            placeholder="Type location name (e.g. Howick)..."
            value={state.searchWord || ''} 
            onChange={(e) => {
              dispatch({ type: 'SET_SEARCH', payload: e.target.value });
              setActiveIndex(-1); 
            }}
            onKeyDown={handleKeyDown} 
            className={styles.desktopInputClean}
          />
          <img src={searchIcon} alt="search" className={styles.desktopInputMagnifier} />
        </div>

        <button 
          className={styles.desktopUseLocationBtn}
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                dispatch({
                  type: 'SELECT_SUGGESTION',
                  payload: { 
                    officialName: 'Current Location', 
                    location: { coordinates: [longitude, latitude] } 
                  }
                });
              });
            }
          }}
        >
          <img src={locator} alt="" className={styles.desktopLocationBtn} />
          Use my location
        </button>


        {activeSuggestions.length > 0 && (
          <ul className={styles.desktopSuggestionsDropdownList}>
            {activeSuggestions.map((item, index) => (
              <li 
                key={item._id || index} 
                onMouseDown={() => {
                  onSelectSuggestion(item);
                }}
                className={`${styles.desktopSuggestionRow} ${activeIndex === index ? styles.activeRowHighlight : ''}`}
              >
                <div className={styles.suggestionTextBlock}>
                  <span className={styles.mainAddressLine}>
                    <img src={pin} alt="" className={styles.suggestionPinIconImg} />
                    Z {extractBranchName ? extractBranchName(item) : (item.officialName || item.name)}
                  </span>
                  {item.address && <small className={styles.subAddressLine}>{item.address}</small>}
                </div>
                {index === 0 && <div className={styles.horizontalAnchorPointerLine}></div>}
              </li>
            ))}
          </ul>
        )}

      </div>
    </div>
  );
}

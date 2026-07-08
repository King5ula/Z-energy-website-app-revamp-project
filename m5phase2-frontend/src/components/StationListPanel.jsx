import React from "react";
import StationCard from "./StationCard";
import styles from '../styles/StationListPanel.module.css';
import crossroadIcon from '../../assets/icons/crossroad.svg';
import filterIcon from '../../assets/icons/slider.svg';
import searchIcon from '../../assets/icons/search.svg';

export default function StationListPanel({ state, dispatch }) {
  
  const stationsList = Array.isArray(state.stations) ? state.stations : [];

  const pricesArray = stationsList
    .map(st => st.priceZ91Unleaded)
    .filter(p => p !== undefined && p > 0);
    
  const lowestLocalPrice = pricesArray.length > 0 ? Math.min(...pricesArray) : 0;

  return (
    <div className={styles.desktopModalOverlay}>
        <div className={`${styles.desktopSearchCard} panel-fade`}>

            <div className={styles.listHeaderRow}>
                <button
                  onClick={() => dispatch({ type: 'CHANGE_STEP', payload: 1 })}
                  className={styles.desktopBackBtn}
                >
                    <span className={styles.backArrowBracket}>&lt;</span> Back
                </button>

                 <div className={styles.dropdownWrapper}>
                    <select 
                      value={state.radius || '15000'}
                      onChange={(e) => dispatch({ type: 'SET_RADIUS', payload: Number(e.target.value) })} 
                      className={styles.radiusSelector}
                    >
                        <option value="5000">5 km</option>
                        <option value="10000">10 km</option>
                        <option value="15000">15 km (Default)</option>
                        <option value="25000">25 km</option>
                        <option value="50000">50 km</option>
                    </select>
                    <span className={styles.customChevronArrow}>▼</span>
                 </div>
            </div>

            <div className={styles.unifiedUtilityBar}>
                <div
                  className={styles.inlineSummarySearchBar}
                  onClick={() => dispatch({ type: 'CHANGE_STEP', payload: 1 })}
                >
                    <span className={styles.activeSearchKeyword}>{state.searchWord || 'Avondale'}</span>
                    <img src={searchIcon} alt="Edit" className={styles.innerSearchIcon}/>
                </div>

                <button className={styles.utilityActionBtn} title="Crossroads View">
                    <img src={crossroadIcon} alt="crossroads" />
                </button>

                <button className={styles.utilityActionBtn} title="Filter Capabilities">
                    <img src={filterIcon} alt="Filter" />
                </button>
            </div>

            <button
              onClick={() => dispatch({ type: 'CHANGE_STEP', payload: 3 })}
              className={styles.actionCompareBtn}
            >
                Compare Stations Now
            </button>

            <div className={styles.verticalCardScoller}>
                {stationsList.length === 0 ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', fontSize: '13px', color: '#718096', fontFamily: 'DM Sans' }}>
                        Searching for local stations...
                    </div>
                ) : (
                    stationsList.map((st) => (
                        <StationCard
                          key={st._id || Math.random()}
                          station={st}
                          isSelected={state.selectedStation?._id === st._id}
                          lowestLocalPrice={lowestLocalPrice}
                          onSelect={() => dispatch({ type: 'SELECT_STATION', payload: st })}
                        />
                    ))
                )}
            </div>

        </div>
    </div>
  );
}

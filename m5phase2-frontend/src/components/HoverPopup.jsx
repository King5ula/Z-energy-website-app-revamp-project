import React from 'react';
import styles from '../styles/HoverPopup.module.css';

const POPUP_FACILITIES = [
  { label: 'Bathrooms', key: 'hasBathrooms' },
  { label: 'ATM', key: 'hasAtm' },
  { label: 'Car Wash', key: 'hasZ2oCarwash' },
  { label: 'Cafe', key: 'hasZEspressCoffeeFood' },
];

export default function HoverPopup({ station, isBargain, extractBranchName }) {
  const availableFacilities = POPUP_FACILITIES.filter((f) => station[f.key]);

  return (
    <div className={styles.popupCardAnchor}>
      <div className={styles.popupCardBody}>

        <h4 className={styles.branchTitle}>
          {extractBranchName(station.website)}
        </h4>

        <p className={styles.addressLine}>
          {station.address || '1 Hudson Rd, Warkworth'}
        </p>

        <div className={`${styles.priceDisplay} ${isBargain ? styles.bargainGreen : styles.standardBlack}`}>
          ${station.priceZ91Unleaded?.toFixed(2) || '2.09'}
        </div>

        <div className={styles.openingHoursText}>
          Opening hours: {station.openingHours || '24/7'}
        </div>

        {availableFacilities.length > 0 && (
          <div className={styles.facilitiesRow}>
            {availableFacilities.map((f) => (
              <span key={f.key} className={styles.facilityChip}>
                {f.label}
                <span className={styles.facilityChipTail}></span>
              </span>
            ))}
          </div>
        )}

      </div>

      <div className={styles.pointerTriangle}></div>
    </div>
  );
}

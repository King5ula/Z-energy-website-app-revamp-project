import React from 'react';
import styles from './HoverPopup.module.css';

export default function HoverPopup({ station, isBargain, extractBranchName }) {
  return (
    <div className={styles.popupCardAnchor}>
      <div className={styles.popupCardBody}>
        
        <div className={styles.topLeftBlueBadge}>
        </div>

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

      </div>

      <div className={styles.pointerTriangle}></div>
    </div>
  );
}

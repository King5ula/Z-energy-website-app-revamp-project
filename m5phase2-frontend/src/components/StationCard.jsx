import React, { useState } from 'react';
import styles from '../styles/StationCard.module.css';
import StationAccordion from './StationAccordion';
import zBrandLogo from '../assets/icons/zCardIcon.svg';
import openNowIcon from '../assets/icons/enter.svg';
import fuelIcon from '../assets/icons/pump.svg';
import toiletIcon from '../assets/icons/toilet.svg';
import cafeIcon from '../assets/icons/cafe-icon.svg';

const extractBranchName = (websiteUrl) => {
    if (!websiteUrl || typeof websiteUrl !== 'string' || websiteUrl.trim() === '') {
        return "Z Station";
    }
    try {
        const cleanUrl = websiteUrl.replace(/\/$/, ""); 
        const segments = cleanUrl.split('/');
        const lastSegment = segments[segments.length - 1] || "";
        const cleanSlug = lastSegment.replace(/^z-/, "").replace(/-/g, " ");
        if (!cleanSlug) return "Z Station";
        return cleanSlug.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    } catch (error) {
        return "Z Station";
    }
};

export default function StationCard({ station, isSelected, onSelect, lowestLocalPrice, onAddToRoute, expanded: expandedProp, onToggleExpand }) {
    const [internalExpanded, setInternalExpanded] = useState(false);
    
    const isControlled = onToggleExpand !== undefined;
    const expanded = isControlled ? expandedProp : internalExpanded;
    const toggleExpanded = (e) => {
        e.stopPropagation();
        if (isControlled) {
            onToggleExpand(station);
        } else {
            setInternalExpanded((v) => !v);
        }
    };
    const isBargainPrice = station.priceZ91Unleaded> 0 && station.priceZ91Unleaded === lowestLocalPrice;

    return (
        <div className={`${styles.desktopListCard} ${isSelected ? styles.cardActiveSelection : ''}`}>
            <div className={styles.cardRow}>
                <div className={styles.cardMain} onClick={onSelect}>
                    <div className={styles.cardHeaderRow}>
                        <img src={zBrandLogo} alt="Z" className={styles.companyMainLogo} />
                        <h3 className={styles.branchHeadingTitle}>
                            {extractBranchName(station.website)}
                        </h3>

                        <div className={`${styles.priceBadgeContainer} ${isBargainPrice ? styles.badgeLowestPrice : styles.badgeStandardPrice}`}>
                            ${station.priceZ91Unleaded?.toFixed(2) || '2.09'}
                        </div>
                    </div>

                    <div className={styles.metaBadgesRow}>
                        <div className={`${styles.utilityBadge} ${styles.badgeOpenNow}`}>
                            <img src={openNowIcon} alt="" className={styles.badges} /> Open now
                        </div>

                        {station.hasZxPremium && (
                            <div className={`${styles.utilityBadge} ${styles.badgeFuel}`}>
                                <img src={fuelIcon} alt="" className={styles.badges} /> Fuel 95
                            </div>
                        )}

                        {station.hasBathrooms && (
                            <div className={`${styles.utilityBadge} ${styles.badgeToilets}`}>
                                <img src={toiletIcon} alt="" className={styles.badges} /> Toilets available
                            </div>
                        )}

                        {station.hasZEspressCoffeeFood && (
                            <div className={`${styles.utilityBadge} ${styles.badgeCafe}`}>
                                <img src={cafeIcon} alt="" className={styles.badges} /> Cafe
                            </div>
                        )}
                    </div>

                    <div className={styles.addressDetails}>
                        <p className={styles.physicalAddress}>
                            {station.address || '550 Te Irirangi Drive, Botany Downs, Auckland 2013'}
                        </p>
                        <p className={styles.contactNumber}>
                            {station.phone || '09-2722105'}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className={styles.accordionBar}
                    onClick={toggleExpanded}
                    aria-expanded={expanded}
                    aria-label={expanded ? 'Hide services' : 'Show services'}
                >
                    <span className={`${styles.accordionChevron} ${expanded ? styles.accordionChevronOpen : ''}`}>▾</span>
                </button>
            </div>

            {expanded && (
                <div className={styles.accordionWrap}>
                    <StationAccordion station={station} onAddToRoute={onAddToRoute} />
                </div>
            )}
        </div>
    );
}

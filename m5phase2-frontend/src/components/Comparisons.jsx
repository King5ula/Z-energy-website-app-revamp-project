import React from 'react';
import styles from './Comparisons.module.css';
import zBrandLogo from '../assets/icons/zCardIcon.svg'; 
import toiletIcon from '../assets/icons/hover-popup-bathroom-icon.svg';
import atmIcon from '../assets/icons/hover-popup-group.svg';
import carWashIcon from '../assets/icons/hover-popup-car-wash-icon.svg'; 
import foodIcon from '../assets/icons/hover-popup-cafe-icon.svg';
import directions from '../assets/icons/property-1-directions-button.svg';

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

export default function Comparisons({ options, onBack }) {
    const priceA = options[0]?.priceZ91Unleaded || 0;
    const priceB = options[1]?.priceZ91Unleaded || 0;
    const globalLowestPrice = Math.min(priceA, priceB);

    return (
        <div className={styles.compOverlay}>
            

            <button onClick={onBack} className={styles.standaloneBackBtn}>
                <span className={styles.backBracket}>&lt;</span> Back
            </button>

            <div className={styles.comparisonCardsFlexTrack}>
                {options.map((st, index) => {
                    const isLowestPrice = st.priceZ91Unleaded > 0 && st.priceZ91Unleaded === globalLowestPrice;
                    const isNoDiesel = !st.priceZDiesel || st.priceZDiesel === 0;
                    const distanceKm = st.distanceInMeters 
                        ? (st.distanceInMeters / 1000).toFixed(1) 
                        : '1.4';

                    return (
                        <div key={`${st._id || index}-${index}`} className={styles.comparisonCard}>

                            <div className={styles.cardTopHeaderRow}>
                                <div className={styles.zBrandingLeftBlock}>
                                    <img src={zBrandLogo} alt="Z" className={styles.mainLogo} />
                                    <h3 className={styles.branchHeading}>
                                         {extractBranchName(st.website)}
                                    </h3>
                                </div>

                                <div className={`${styles.priceBadgeContainer} ${isLowestPrice ? styles.badgeLowestPrice : styles.badgeStandardPrice}`}>
                                    ${st.priceZ91Unleaded?.toFixed(2) || '2.09'}                               
                                </div>
                            </div>

                            <div className={styles.addressDetails}>
                                <p className={styles.physicalAddress}>
                                    {st.address || '550 Te Irirangi Drive, Botany Downs, Auckland 2013'}
                                </p>
                                <p className={styles.contactNumber}>
                                    {st.phone || '09-2722105'}
                                </p>
                            </div>

                            <div className={styles.pricingTable}>
                                <div className={styles.tableRow}>
                                    <span className={styles.labelField}>UNLEADED 91</span>
                                    <span className={styles.valueFieldColorGreen}>${st.priceZ91Unleaded?.toFixed(2) || '2.09'}</span>
                                </div>
                                <div className={styles.tableRow}>
                                    <span className={styles.labelField}>PREMIUM 95</span>
                                    <span className={styles.valueFieldColorGreen}>${st.priceZxPremium?.toFixed(2) || '2.95'}</span>
                                </div>
                                <div className={styles.tableRow}>
                                    <span className={styles.labelField}>ULTIMATE DIESEL</span>
                                    <span className={`${styles.valueField} ${isNoDiesel ? styles.unavailableText : styles.valueFieldColorGreen}`}>
                                        {isNoDiesel ? 'UNAVAILABLE' : `$${st.priceZDiesel?.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className={styles.tableRow}>
                                    <span className={styles.labelField}>DISTANCE</span>
                                    <span className={`${styles.valueField} ${index === 0 ? styles.greenTxtColor : styles.redTxtColor}`}>
                                        {distanceKm}KM
                                    </span>
                                </div>
                            </div>

                            <div className={styles.facilitiesRow}>
                                <span className={styles.facilitiesHeading}>FACILITIES</span>
                                <div className={styles.facilitiesIconsTrack}>
                                    {st.hasBathrooms && (
                                        <img src={toiletIcon} alt="Toilets" className={styles.facilityIconImg} />
                                    )}                                    
                                    {st.hasATM && (
                                        <img src={atmIcon} alt="ATM" className={styles.facilityIconImg} />
                                    )} 
                                    {st.hasCarWash && (
                                        <img src={carWashIcon} alt="Car Wash" className={styles.facilityIconImg} />
                                    )}
                                    {st.hasZEspressCoffeeFood && (
                                        <img src={foodIcon} alt="Cafe" className={styles.facilityIconImg} />
                                    )}
                                </div>
                            </div>

                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${st.location?.coordinates?.[1] ?? 0},${st.location?.coordinates?.[0] ?? 0}&travelmode=driving`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.imageDirectionsLinkBtn}
                                title="Get Directions"
                            >
                                <img 
                                    src={directions} 
                                    alt="Get Directions" 
                                    className={styles.directionsCapsuleBtn} 
                                />
                            </a>

                        </div>
                    );
                })}
            </div>

        </div>
    );
}

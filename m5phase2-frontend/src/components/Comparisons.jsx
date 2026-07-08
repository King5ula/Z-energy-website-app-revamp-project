import React from 'react';
import styles from '../styles/Comparisons.module.css';
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

// Mobile comparison table: two stations side by side, row per attribute.
function MobileComparisonTable({ options, onBack }) {
    const a = options[0] || {};
    const b = options[1] || {};
    const nameA = extractBranchName(a.website);
    const nameB = extractBranchName(b.website);

    const priceCell = (value, isCheaper) => {
        if (!value || value <= 0) {
            return { text: 'N/A', className: styles.tblCross };
        }
        return { text: `$${value.toFixed(2)}`, className: isCheaper ? styles.tblGreen : styles.tblDark };
    };

    const priceRows = [
        { label: 'Unleaded 91', a: a.priceZ91Unleaded, b: b.priceZ91Unleaded },
        { label: 'Premium 95', a: a.priceZxPremium, b: b.priceZxPremium },
        { label: 'Diesel', a: a.priceZDiesel, b: b.priceZDiesel },
    ];

    const facilityRows = [
        { label: 'EV charging', a: a.hasEvCharging, b: b.hasEvCharging },
        { label: 'Bathrooms', a: a.hasBathrooms, b: b.hasBathrooms },
        { label: 'Car Wash', a: a.hasZ2oCarwash, b: b.hasZ2oCarwash },
        { label: 'Cafe', a: a.hasZEspressCoffeeFood, b: b.hasZEspressCoffeeFood },
        { label: 'Truck Stop', a: a.isTruckStop, b: b.isTruckStop },
        { label: 'Pay in App', a: a.hasPayInApp, b: b.hasPayInApp },
        { label: 'Trailer Hire', a: a.hasTrailerHire, b: b.hasTrailerHire },
        { label: 'ATM', a: a.hasAtm, b: b.hasAtm },
        { label: 'Pay by Plate', a: a.hasPayByPlate, b: b.hasPayByPlate },
        { label: "LPG Swap'n'Go", a: a.hasLpgSwapNGo, b: b.hasLpgSwapNGo },
        { label: '24/7 Pay at Pump', a: a.has247PayAtPump, b: b.has247PayAtPump },
    ];

    const directionsUrl = (st) =>
        `https://www.google.com/maps/dir/?api=1&destination=${st.location?.coordinates?.[1] ?? 0},${st.location?.coordinates?.[0] ?? 0}&travelmode=driving`;

    const distA = a.distanceInMeters && isFinite(a.distanceInMeters) ? a.distanceInMeters : null;
    const distB = b.distanceInMeters && isFinite(b.distanceInMeters) ? b.distanceInMeters : null;

    const tick = (val) =>
        val ? <span className={styles.tblTick}>✓</span> : <span className={styles.tblXmark}>✗</span>;

    return (
        <div className={styles.compTableOverlay}>
            <div className={styles.tblScroll}>
                <table className={styles.compTable}>
                    <thead>
                        <tr>
                            <th className={styles.tblCorner}></th>
                            <th className={styles.tblHeadCell}>{nameA}</th>
                            <th className={styles.tblHeadCell}>{nameB}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {priceRows.map((row) => {
                            const aHas = row.a > 0;
                            const bHas = row.b > 0;
                            const aCheaper = aHas && (!bHas || row.a <= row.b);
                            const bCheaper = bHas && (!aHas || row.b <= row.a);
                            const cellA = priceCell(row.a, aCheaper);
                            const cellB = priceCell(row.b, bCheaper);
                            return (
                                <tr key={row.label}>
                                    <td className={styles.tblRowLabel}>{row.label}</td>
                                    <td className={`${styles.tblValue} ${cellA.className}`}>{cellA.text}</td>
                                    <td className={`${styles.tblValue} ${cellB.className}`}>{cellB.text}</td>
                                </tr>
                            );
                        })}

                        <tr>
                            <td className={styles.tblRowLabel}>Distance</td>
                            <td className={`${styles.tblValue} ${distA !== null && (distB === null || distA <= distB) ? styles.tblGreen : styles.tblOrange}`}>
                                {distA !== null ? `${Math.round(distA / 1000)}KM` : '—'}
                            </td>
                            <td className={`${styles.tblValue} ${distB !== null && (distA === null || distB <= distA) ? styles.tblGreen : styles.tblOrange}`}>
                                {distB !== null ? `${Math.round(distB / 1000)}KM` : '—'}
                            </td>
                        </tr>

                        {facilityRows.map((row) => (
                            <tr key={row.label}>
                                <td className={styles.tblRowLabel}>{row.label}</td>
                                <td className={styles.tblValue}>{tick(row.a)}</td>
                                <td className={styles.tblValue}>{tick(row.b)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className={styles.tblDirectionsRow}>
                    <span />
                    {a.location ? (
                        <a href={directionsUrl(a)} target="_blank" rel="noopener noreferrer" className={styles.tblDirectionsBtn}>
                            Directions
                        </a>
                    ) : <span />}
                    {b.location ? (
                        <a href={directionsUrl(b)} target="_blank" rel="noopener noreferrer" className={styles.tblDirectionsBtn}>
                            Directions
                        </a>
                    ) : <span />}
                </div>
            </div>
        </div>
    );
}

export default function Comparisons({ options, onBack, isMobile, onFacilityHover }) {
    if (isMobile) {
        return <MobileComparisonTable options={options} onBack={onBack} />;
    }

    const facilityHoverProps = (key, label) => ({
        onMouseEnter: () => onFacilityHover?.({ key, label }),
        onMouseLeave: () => onFacilityHover?.(null),
    });

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
                                        <img src={toiletIcon} alt="Toilets" className={styles.facilityIconImg}
                                            {...facilityHoverProps('hasBathrooms', 'Bathrooms')} />
                                    )}
                                    {st.hasAtm && (
                                        <img src={atmIcon} alt="ATM" className={styles.facilityIconImg}
                                            {...facilityHoverProps('hasAtm', 'ATM')} />
                                    )}
                                    {st.hasZ2oCarwash && (
                                        <img src={carWashIcon} alt="Car Wash" className={styles.facilityIconImg}
                                            {...facilityHoverProps('hasZ2oCarwash', 'Car Wash')} />
                                    )}
                                    {st.hasZEspressCoffeeFood && (
                                        <img src={foodIcon} alt="Cafe" className={styles.facilityIconImg}
                                            {...facilityHoverProps('hasZEspressCoffeeFood', 'Cafe')} />
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

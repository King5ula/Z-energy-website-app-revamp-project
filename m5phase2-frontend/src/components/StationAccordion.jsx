import React from 'react';
import styles from '../styles/StationAccordion.module.css';

const SERVICE_GROUPS = [
  {
    title: 'Fuel',
    items: [
      { label: 'Regular 91', key: 'hasZ91Unleaded' },
      { label: 'Premium 95', key: 'hasZxPremium' },
      { label: 'Diesel', key: 'hasZDiesel' },
      { label: 'Fast Fill Diesel', key: 'hasFastFillDiesel' },
      { label: 'AdBlue Diesel Fluid', key: 'hasAdBlueDieselFluid' },
    ],
  },
  {
    title: 'EV Charging',
    items: [
      { label: 'EV Charging', key: 'hasEvCharging' },
      { label: 'EV Charging (Coming Soon)', key: 'hasEvChargingComingSoon' },
    ],
  },
  {
    title: 'Food & Drink',
    items: [
      { label: 'Z Espresso Coffee & Food', key: 'hasZEspressCoffeeFood' },
      { label: "F'real Milkshakes", key: 'hasFreal' },
      { label: 'Pre-order Coffee', key: 'hasPreOrderCoffee' },
      { label: 'Compostable Cups', key: 'hasCompostableCups' },
    ],
  },
  {
    title: 'Services',
    items: [
      { label: 'Bathrooms', key: 'hasBathrooms' },
      { label: 'ATM', key: 'hasAtm' },
      { label: "LPG Swap'n'Go", key: 'hasLpgSwapNGo' },
      { label: 'Z Club Plus', key: 'hasClubPlus' },
    ],
  },
  {
    title: 'Car Care + Support',
    items: [
      { label: 'Z2o Car Wash', key: 'hasZ2oCarwash' },
      { label: 'Trailer Hire', key: 'hasTrailerHire' },
      { label: 'Superlong Hoses', key: 'hasSuperlongHoses' },
    ],
  },
  {
    title: 'Payment & Convenience',
    items: [
      { label: 'Pay in App', key: 'hasPayInApp' },
      { label: 'Pay by Plate', key: 'hasPayByPlate' },
      { label: '24/7 Pay at Pump', key: 'has247PayAtPump' },
    ],
  },
  {
    title: 'Station Type',
    items: [
      { label: 'Service Station', key: 'isServiceStation' },
      { label: 'Truck Stop', key: 'isTruckStop' },
      { label: 'EV Charging Station', key: 'isEvChargingStation' },
    ],
  },
];

export default function StationAccordion({ station, onAddToRoute }) {
  if (!station) return null;

  return (
    <div className={styles.accordion}>
      <section className={styles.group}>
        <h4 className={styles.groupTitle}>Opening Hours</h4>
        <div className={styles.hoursRow}>
          <span>Mon &ndash; Sun</span>
          <span className={styles.hoursValue}>{station.openingHours || 'Hours not listed'}</span>
        </div>
      </section>

      {SERVICE_GROUPS.map((group) => (
        <section key={group.title} className={styles.group}>
          <h4 className={styles.groupTitle}>{group.title}</h4>
          <ul className={styles.list}>
            {group.items.map((item) => {
              const available = Boolean(station[item.key]);
              return (
                <li
                  key={item.key}
                  className={`${styles.item} ${available ? styles.available : styles.unavailable}`}
                >
                  <span className={styles.mark} aria-hidden="true">{available ? '✓' : '✕'}</span>
                  {item.label}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {onAddToRoute && (
        <button
          type="button"
          className={styles.addToRouteBtn}
          onClick={(e) => {
            e.stopPropagation();
            onAddToRoute(station);
          }}
        >
          Add to Route
        </button>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import styles from "./FilterPreferences.module.css";

export default function FilterPreferences({ onClose, onFiltersChange }) {
  const [selectedFilters, setSelectedFilters] = useState([]);

  function toggleFilter(filterKey) {
    setSelectedFilters((current) =>
      current.includes(filterKey)
        ? current.filter((key) => key !== filterKey)
        : [...current, filterKey],
    );
  }

  useEffect(() => {
    onFiltersChange?.(selectedFilters);
  }, [selectedFilters, onFiltersChange]);

  return (
    <aside className={styles.filterCard}>
      <button className={styles.closeButton} onClick={onClose}>
        x
      </button>
      <h2>Filters</h2>
      <section>
        <h3>Popular Filters</h3>
        <button
          className={selectedFilters.includes("payAtPump") ? styles.active : ""}
          onClick={() => toggleFilter("payAtPump")}
        >
          24/7 Pay at Pump
        </button>
        <button
          className={
            selectedFilters.includes("evCharging") ? styles.active : ""
          }
          onClick={() => toggleFilter("evCharging")}
        >
          EV Charging
        </button>
      </section>
      <section>
        <h3>Station Type</h3>
        <button
          className={selectedFilters.includes("truckStop") ? styles.active : ""}
          onClick={() => toggleFilter("truckStop")}
        >
          Truck Stop
        </button>
        <button
          className={selectedFilters.includes("carWash") ? styles.active : ""}
          onClick={() => toggleFilter("carWash")}
        >
          Car Wash
        </button>
      </section>
      <section>
        <h3>Fuel Type</h3>
        <button
          className={selectedFilters.includes("diesel") ? styles.active : ""}
          onClick={() => toggleFilter("diesel")}
        >
          Diesel
        </button>
      </section>
    </aside>
  );
}

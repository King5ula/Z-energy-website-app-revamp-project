import { useState, useEffect, useRef } from 'react';
import './AddressAutocomplete.css';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelected,
  placeholder = "Enter address",
  className = "",
  icon = null
}) {
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!inputRef.current) return;
    if (!window.google || !window.google.maps || !window.google.maps.places) return;

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'nz' },
        fields: ['formatted_address', 'geometry', 'name', 'place_id']
      });

      autocompleteRef.current = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
          console.error('No geometry found for place');
          return;
        }

        const address = place.formatted_address;
        setInputValue(address);
        onChange(address);

        if (onPlaceSelected) {
          onPlaceSelected({
            address: address,
            name: place.name,
            location: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            },
            placeId: place.place_id
          });
        }
      });
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange, onPlaceSelected]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="address-autocomplete-wrapper">
      <div className="address-autocomplete-input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`address-autocomplete-input ${className}`}
          autoComplete="off"
        />
        {icon && <div className="address-autocomplete-icon">{icon}</div>}
      </div>
    </div>
  );
}

export default AddressAutocomplete;

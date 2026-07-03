//Mongoose Schema
import mongoose from 'mongoose';

// this basically defines the structure and validation rules for station documents
const StationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  officialName: { type: String },
  address: { type: String, default: 'Unknown Address' },
  city: { type: String, default: 'Unknown City' },
  phone: { type: String },
  openingHours: { type: String },
  website: { type: String },

  // --- STATION TYPE ---
  isTruckStop: { type: Boolean, default: false },
  isServiceStation: { type: Boolean, default: true },
  isEvChargingStation: { type: Boolean, default: false },

  // --- SERVICES (FROM DESIGN LIST) ---
  hasEvCharging: { type: Boolean, default: false },
  hasEvChargingComingSoon: { type: Boolean, default: false },
  hasFreal: { type: Boolean, default: false },
  hasPreOrderCoffee: { type: Boolean, default: false },
  hasPayInApp: { type: Boolean, default: false },
  hasZEspressCoffeeFood: { type: Boolean, default: false },
  hasZ2oCarwash: { type: Boolean, default: false },
  hasTrailerHire: { type: Boolean, default: false },
  hasLpgSwapNGo: { type: Boolean, default: false },
  has247PayAtPump: { type: Boolean, default: false },
  hasSuperlongHoses: { type: Boolean, default: false },
  hasBathrooms: { type: Boolean, default: false },
  hasPayByPlate: { type: Boolean, default: false },
  hasCompostableCups: { type: Boolean, default: false },
  hasAdBlueDieselFluid: { type: Boolean, default: false },
  hasFastFillDiesel: { type: Boolean, default: false },
  hasAtm: { type: Boolean, default: false },
  hasClubPlus: { type: Boolean, default: false },

  // --- FUEL TYPES AVAILABILITY SWITCHES---
  hasZxPremium: { type: Boolean, default: true },
  hasZ91Unleaded: { type: Boolean, default: true },
  hasZDiesel: { type: Boolean, default: false },

  // --- FUEL PRICES ---
  priceZ91Unleaded: { type: Number, default: 0.00 },
  priceZxPremium: { type: Number, default: 0.00 },
  priceZDiesel: { type: Number, default: 0.00 },

  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  }
});

StationSchema.index({ location: '2dsphere' });

const Station = mongoose.model('Station', StationSchema);
export default Station;

// ponytail: Mongoose schema for route planning and history (Rung 2: ORM)
// Why: Schema validation, indexing for user queries, geospatial route data storage
// Ceiling: Can't store complex route geometries efficiently (use GeoJSON LineString if needed)
// Upgrade: Consider separate RouteGeometry collection if routes become very large

import mongoose from 'mongoose';

// this basically defines the structure for storing planned routes
const RouteSchema = new mongoose.Schema({
  // Route identification
  userId: {
    type: String,
    default: 'anonymous',
    index: true
  },

  // Route endpoints
  startPoint: {
    address: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },

  destination: {
    address: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },

  // Route preferences
  preferences: {
    travelMode: {
      type: String,
      enum: ['DRIVING', 'WALKING', 'BICYCLING', 'TRANSIT'],
      default: 'DRIVING'
    },
    avoidTolls: { type: Boolean, default: false },
    avoidHighways: { type: Boolean, default: false },
    avoidFerries: { type: Boolean, default: false }
  },

  // Route calculation results from Google Maps
  routeData: {
    distance: { type: String },
    duration: { type: String },
    distanceMeters: { type: Number },
    durationSeconds: { type: Number },
    startAddress: { type: String },
    endAddress: { type: String },
    steps: [{
      instruction: { type: String },
      distance: { type: String },
      duration: { type: String }
    }]
  },

  // Z Energy stations found along the route
  stationsAlongRoute: [{
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
    name: { type: String },
    address: { type: String },
    distanceFromRoute: { type: Number },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    }
  }],

  // Metadata
  createdAt: { type: Date, default: Date.now, index: true },
  lastAccessedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// ponytail: Compound index for user route history queries
RouteSchema.index({ userId: 1, createdAt: -1 });

// ponytail: TTL index to auto-delete old anonymous routes after 30 days
RouteSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: { userId: 'anonymous' }
  }
);

const Route = mongoose.model('Route', RouteSchema);
export default Route;

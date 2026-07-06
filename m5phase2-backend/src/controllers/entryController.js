import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/responseHandlers.js';

// handles entry page requests
export const getEntryData = asyncHandler(async (req, res) => {
  // Return basic entry page data
  const entryData = {
    message: 'Welcome to Z Energy Station Finder',
    features: [
      'Find nearby stations',
      'Plan your route',
      'Filter preferences'
    ]
  };

  sendSuccess(res, entryData, 'Entry data fetched successfully');
});

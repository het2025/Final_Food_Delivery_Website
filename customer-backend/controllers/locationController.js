import axios from 'axios';

const MAPPLS_API_KEY = process.env.MAPPLS_API_KEY;


// Search addresses
export const searchAddress = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }

    console.log(`🔍 Searching: "${query}" with key: ${MAPPLS_API_KEY?.substring(0, 10)}...`);

    const response = await axios.get(
      `https://atlas.mappls.com/api/places/search/json`,
      {
        params: {
          query: query,
          region: 'vadodara',
          access_token: MAPPLS_API_KEY
        }
      }
    );

    console.log('✅ Search successful, results:', response.data.suggestedLocations?.length || 0);

    res.status(200).json({
      success: true,
      data: response.data.suggestedLocations || []
    });

  } catch (error) {
    console.error('❌ Search error:', {
      status: error.response?.status,
      message: error.response?.statusText,
      details: error.response?.data,
      error: error.message
    });

    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error searching address',
      error: error.message,
      hint: error.response?.status === 401 ? 'Invalid or expired API key' : 'Unknown error'
    });
  }
};

// Get coordinates from address (Geocoding)
export const getCoordinates = async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address parameter is required'
      });
    }

    console.log(`📍 Geocoding: "${address}"`);

    const response = await axios.get(
      `https://atlas.mappls.com/api/places/geocode`,
      {
        params: {
          address: address,
          access_token: MAPPLS_API_KEY
        }
      }
    );

    if (response.data.copResults && response.data.copResults.length > 0) {
      console.log('✅ Geocoding successful');
      res.status(200).json({
        success: true,
        data: {
          lat: response.data.copResults[0].latitude,
          lng: response.data.copResults[0].longitude
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Coordinates not found'
      });
    }

  } catch (error) {
    console.error('❌ Geocode error:', {
      status: error.response?.status,
      message: error.response?.statusText,
      details: error.response?.data,
      error: error.message
    });

    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error getting coordinates',
      error: error.message,
      hint: error.response?.status === 401 ? 'Invalid or expired API key' : 'Unknown error'
    });
  }
};

// Reverse geocoding (coordinates to address)
export const reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    console.log(`🔄 Reverse geocoding: ${lat}, ${lng}`);

    const response = await axios.get(
      `https://apis.mappls.com/advancedmaps/v1/${MAPPLS_API_KEY}/rev_geocode`,
      {
        params: {
          lat: lat,
          lng: lng
        }
      }
    );

    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      console.log('✅ Reverse geocoding successful');
      res.status(200).json({
        success: true,
        data: {
          street: result.formatted_address || result.house_number + ' ' + result.street || '',
          city: result.city || result.district || 'Vadodara',
          state: result.state || 'Gujarat',
          pincode: result.pincode || '',
          landmark: result.poi || ''
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

  } catch (error) {
    console.error('❌ Reverse geocode error:', {
      status: error.response?.status,
      message: error.response?.statusText,
      details: error.response?.data,
      error: error.message
    });

    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error getting address',
      error: error.message,
      hint: error.response?.status === 401 ? 'Invalid or expired API key' : 'Unknown error'
    });
  }
};

// Calculate distance
export const calculateDistance = async (req, res) => {
  try {
    const { fromLat, fromLng, toLat, toLng } = req.query;

    if (!fromLat || !fromLng || !toLat || !toLng) {
      return res.status(400).json({
        success: false,
        message: 'All coordinates are required'
      });
    }

    console.log(`📏 Distance: From (${fromLat}, ${fromLng}) to (${toLat}, ${toLng})`);

    const response = await axios.get(
      `https://apis.mappls.com/advancedmaps/v1/${MAPPLS_API_KEY}/distance_matrix/driving/${fromLng},${fromLat};${toLng},${toLat}`
    );

    if (response.data.results && response.data.results.distances) {
      const distanceInMeters = response.data.results.distances[0][1];
      const distanceInKm = (distanceInMeters / 1000).toFixed(2);
      const timeInSeconds = response.data.results.durations[0][1];
      const timeInMinutes = Math.round(timeInSeconds / 60);

      console.log(`✅ Distance calculated: ${distanceInKm} km, ${timeInMinutes} mins`);

      res.status(200).json({
        success: true,
        data: {
          distance: distanceInKm,
          time: timeInMinutes
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Distance calculation failed'
      });
    }

  } catch (error) {
    console.error('❌ Distance error:', {
      status: error.response?.status,
      message: error.response?.statusText,
      details: error.response?.data,
      error: error.message
    });

    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error calculating distance',
      error: error.message,
      hint: error.response?.status === 401 ? 'Invalid or expired API key' : 'Unknown error'
    });
  }
};

// Location Service - Backend Proxy for OpenStreetMap

const API_BASE_URL = 'http://localhost:5000/api';

// Get GPS location
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    console.log('🔍 Getting GPS location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ GPS detected:', position.coords);
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        let msg = 'Location error';
        if (error.code === 1) msg = 'Location permission denied';
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};

// Get address from coordinates (via backend)
export const getAddressFromCoords = async (lat, lng) => {
  try {
    console.log('🌍 Getting address via backend...');
    
    const response = await fetch(
      `${API_BASE_URL}/geocode/reverse?lat=${lat}&lng=${lng}`
    );
    
    const result = await response.json();
    console.log('Backend response:', result);
    
    if (result.success && result.data) {
      console.log('✅ Address received:', result.data);
      return result.data;
    }
    
    console.warn('⚠️ No address data');
    return null;
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
};

// Search addresses
export const searchAddress = async (query) => {
  try {
    if (!query || query.length < 3) return [];
    
    const response = await fetch(
      `${API_BASE_URL}/geocode/search?query=${encodeURIComponent(query)}`
    );
    
    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

// Other functions
export const calculateDeliveryFee = () => 30;
export const isDeliveryAvailable = () => true;

export const getCoordinates = async (address) => {
  const results = await searchAddress(address);
  return results[0] ? { lat: results[0].latitude, lng: results[0].longitude } : null;
};

export const calculateDistance = async (fromLat, fromLng, toLat, toLng) => {
  const R = 6371;
  const dLat = (toLat - fromLat) * Math.PI / 180;
  const dLng = (toLng - fromLng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(fromLat * Math.PI/180) * Math.cos(toLat * Math.PI/180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return { distance: (R * c).toFixed(2), time: 30 };
};

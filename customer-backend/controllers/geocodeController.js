const axios = require('axios');

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

const VADODARA_PINCODES = {
  'alkapuri': '390007', 'sayajigunj': '390005', 'gotri': '390021',
  'akota': '390020', 'manjalpur': '390011', 'tandalja': '390012',
  'subhanpura': '390023', 'makarpura': '390014', 'vasna': '390015'
};

const getPincodeFromArea = (text) => {
  const lower = text.toLowerCase();
  for (const [area, pin] of Object.entries(VADODARA_PINCODES)) {
    if (lower.includes(area)) return pin;
  }
  return null;
};

exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Lat/lng required'
      });
    }

    console.log(`🌍 Geocoding: ${lat}, ${lng}`);

    const response = await axios.get(`${NOMINATIM_URL}/reverse`, {
      params: {
        format: 'json',
        lat: lat,
        lon: lng,
        addressdetails: 1,
        zoom: 18
      },
      headers: { 'User-Agent': 'QuickBite' },
      timeout: 10000
    });

    if (response.data && response.data.address) {
      const data = response.data;
      const addr = data.address;

      const parts = [];
      if (addr.house_number) parts.push(addr.house_number);
      if (addr.road) parts.push(addr.road);
      if (addr.neighbourhood) parts.push(addr.neighbourhood);
      if (addr.suburb) parts.push(addr.suburb);
      
      const street = parts.length ? parts.join(', ') : data.display_name.split(',')[0];
      const pincode = getPincodeFromArea(data.display_name) || addr.postcode || '';

      const result = {
        street: street,
        city: addr.city || addr.town || 'Vadodara',
        state: addr.state || 'Gujarat',
        pincode: pincode,
        landmark: addr.amenity || '',
        fullAddress: data.display_name
      };

      console.log('✅ Address:', result);
      return res.json({ success: true, data: result });
    }

    res.status(404).json({ success: false, message: 'Address not found' });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, message: 'Geocoding failed' });
  }
};

exports.searchAddress = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 3) {
      return res.json({ success: true, data: [] });
    }

    const response = await axios.get(`${NOMINATIM_URL}/search`, {
      params: {
        format: 'json',
        q: `${query}, Vadodara, Gujarat`,
        limit: 10,
        addressdetails: 1
      },
      headers: { 'User-Agent': 'QuickBite' }
    });

    const results = (response.data || []).map(item => ({
      placeName: item.name || item.display_name.split(',')[0],
      placeAddress: item.display_name,
      street: item.address?.road || item.display_name.split(',')[0],
      city: 'Vadodara',
      state: 'Gujarat',
      pincode: getPincodeFromArea(item.display_name) || item.address?.postcode || ''
    }));

    res.json({ success: true, data: results });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

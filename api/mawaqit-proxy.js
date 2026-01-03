export default async function handler(req, res) {
  const { slug, q, lat, lng, action } = req.query;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    let url = '';
    
    // Check if we are fetching specific mosque times
    if (slug || action === 'times') {
      const targetSlug = slug || req.query.slug;
      url = `https://mawaqit.net/en/${targetSlug}/json`;
    } 
    // Check if we are doing a geocode search (Nominatim)
    else if (action === 'geocode') {
      url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
    }
    // Check if we are searching for mosques via Mawaqit API
    else if (q || action === 'search') {
      if (lat && lng) {
        url = `https://mawaqit.net/api/2.0/mosque/search?lat=${lat}&lng=${lng}`;
      } else {
        const query = q || req.query.q;
        url = `https://mawaqit.net/api/2.0/mosque/search?q=${encodeURIComponent(query)}`;
      }
    }

    if (!url) return res.status(400).json({ error: 'Geen geldige actie of parameters' });

    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 
        'Accept': 'application/json' 
      }
    });

    if (!response.ok) throw new Error(`Mawaqit error: ${response.status}`);
    
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
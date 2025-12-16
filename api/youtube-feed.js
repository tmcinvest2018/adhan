
export default async function handler(req, res) {
  // 1. CORS Headers (Essential for usage from your frontend)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request (Preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. Channel List (The "Approved" Scholars)
  // Mapping Internal ID -> YouTube Channel ID (UC...)
  const CHANNELS = [
    { id: 'menk', ytId: 'UCTSLKqAm-S_jZk42Wd-z_DQ' },         // Mufti Menk
    { id: 'yasir_qadhi', ytId: 'UC37o9G5k650f9f3XjN_V24A' },  // EPIC (Yasir Qadhi)
    { id: 'bayyinah', ytId: 'UCeM7c1D2C6pC5zQ7k1z1u_g' },     // Bayyinah (Nouman Ali Khan)
    { id: 'yaqeen', ytId: 'UC3vPWjJ7wA4p_1c7K_3qE1g' },       // Yaqeen Institute
    { id: 'muslim_lantern', ytId: 'UC38_4_5_6_7_8_9' },       // Muslim Lantern (Placeholder ID in service, update if known)
    { id: 'mercifulservant', ytId: 'UCHGA_5_4_3_2_1' },       // Merciful Servant
  ];

  const { channelId, query } = req.query;

  try {
    let feedItems = [];

    // Function to fetch and parse a single RSS feed
    const fetchFeed = async (ytId) => {
      try {
        const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${ytId}`);
        if (!response.ok) return [];
        const text = await response.text();
        
        // Manual XML Parsing using Regex (Lightweight, no dependencies needed)
        const items = [];
        // Regex to match <entry> blocks
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        let match;
        
        while ((match = entryRegex.exec(text)) !== null) {
            const content = match[1];
            
            // Extract fields
            const idMatch = content.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
            const titleMatch = content.match(/<title>(.*?)<\/title>/);
            const authorMatch = content.match(/<name>(.*?)<\/name>/); // Author is inside <author><name>...</name></author>
            const publishedMatch = content.match(/<published>(.*?)<\/published>/);

            if (idMatch && titleMatch) {
                items.push({
                    id: idMatch[1],
                    title: titleMatch[1],
                    author: authorMatch ? authorMatch[1] : 'Unknown Scholar',
                    published: publishedMatch ? publishedMatch[1] : new Date().toISOString(),
                    // Construct URL and Thumbnail manually since RSS gives standard logic
                    url: `https://www.youtube.com/watch?v=${idMatch[1]}`,
                    thumbnail: `https://img.youtube.com/vi/${idMatch[1]}/hqdefault.jpg`,
                    type: 'video'
                });
            }
        }
        return items;
      } catch (e) {
        console.error(`Error fetching ${ytId}`, e);
        return [];
      }
    };

    // 3. Logic: Fetch One or Fetch All
    if (channelId) {
        // Fetch specific channel
        feedItems = await fetchFeed(channelId);
    } else {
        // Fetch ALL channels in parallel (Aggregator Mode)
        // We limit to first 4 channels to keep response fast (Vercel has 10s timeout on free tier)
        const promises = CHANNELS.slice(0, 4).map(c => fetchFeed(c.ytId));
        const results = await Promise.all(promises);
        feedItems = results.flat();
    }

    // 4. Filtering (Simulated Search)
    if (query) {
        const qLower = query.toLowerCase();
        feedItems = feedItems.filter(item => 
            item.title.toLowerCase().includes(qLower) || 
            item.author.toLowerCase().includes(qLower)
        );
    }

    // 5. Sorting (Newest First)
    feedItems.sort((a, b) => new Date(b.published) - new Date(a.published));

    // 6. Return JSON
    // Cache for 1 hour (3600 seconds) to save YouTube quota
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(feedItems);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch feeds' });
  }
}

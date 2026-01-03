
import { MediaItem } from './types';

export default async function handler(req: any, res: any) {
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
  const CHANNELS = [
    { id: 'menk', ytId: 'UCTSLKqAm-S_jZk42Wd-z_DQ' },         // Mufti Menk
    { id: 'yasir_qadhi', ytId: 'UC37o9G5k650f9f3XjN_V24A' },  // EPIC (Yasir Qadhi)
    { id: 'bayyinah', ytId: 'UCeM7c1D2C6pC5zQ7k1z1u_g' },     // Bayyinah (Nouman Ali Khan)
    { id: 'yaqeen', ytId: 'UC3vPWjJ7wA4p_1c7K_3qE1g' },       // Yaqeen Institute
  ];

  const { channelId, query } = req.query;

  try {
    let feedItems: MediaItem[] = [];

    const fetchFeed = async (ytId: string): Promise<MediaItem[]> => {
      try {
        const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${ytId}`);
        if (!response.ok) return [];
        const text = await response.text();
        
        const items: MediaItem[] = [];
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        let match;
        
        while ((match = entryRegex.exec(text)) !== null) {
            const content = match[1];
            
            const idMatch = content.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
            const titleMatch = content.match(/<title>(.*?)<\/title>/);
            const authorMatch = content.match(/<name>(.*?)<\/name>/);
            const publishedMatch = content.match(/<published>(.*?)<\/published>/);

            if (idMatch && titleMatch) {
                items.push({
                    id: idMatch[1],
                    title: titleMatch[1],
                    author: authorMatch ? authorMatch[1] : 'Unknown Scholar',
                    published: publishedMatch ? publishedMatch[1] : new Date().toISOString(),
                    url: `https://www.youtube.com/watch?v=${idMatch[1]}`,
                    thumbnail: `https://img.youtube.com/vi/${idMatch[1]}/hqdefault.jpg`,
                    type: 'video',
                    category: 'lecture', // Default category
                    duration: 'Nieuw'
                });
            }
        }
        return items;
      } catch (e) {
        console.error(`Error fetching ${ytId}`, e);
        return [];
      }
    };

    if (channelId) {
        feedItems = await fetchFeed(channelId);
    } else {
        const promises = CHANNELS.map(c => fetchFeed(c.ytId));
        const results = await Promise.all(promises);
        feedItems = results.flat();
    }

    if (query) {
        const qLower = (query as string).toLowerCase();
        feedItems = feedItems.filter(item => 
            item.title.toLowerCase().includes(qLower) || 
            item.author.toLowerCase().includes(qLower)
        );
    }

    feedItems.sort((a, b) => new Date(b.published!).getTime() - new Date(a.published!).getTime());

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(feedItems);

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch feeds' });
  }
}

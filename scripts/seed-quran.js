
import { supabase, sleep } from './utils.js';

const API_BASE = 'https://api.alquran.cloud/v1';

async function seedQuran() {
  console.log("📖 Starting Quran Seeding...");

  // 1. SURAHS
  console.log("   Fetching Surah List...");
  const surahRes = await fetch(`${API_BASE}/surah`);
  const surahData = await surahRes.json();
  
  if (surahData.code === 200) {
    const rows = surahData.data.map(s => ({
      number: s.number,
      name_ar: s.name,
      name_en: s.englishName,
      name_transliteration: s.englishName, // API duplicates englishName often, can be refined later
      revelation_type: s.revelationType,
      ayah_count: s.numberOfAyahs
    }));

    const { error } = await supabase.from('quran_surahs').upsert(rows);
    if (error) console.error("❌ Error inserting Surahs:", error);
    else console.log(`✅ ${rows.length} Surahs inserted.`);
  }

  // 2. AYAHS & TRANSLATION (Batch by Surah to be safe)
  // We use the 'editions' endpoint to get Uthmani text + English Translation in one go
  for (let i = 1; i <= 114; i++) {
    console.log(`   Processing Surah ${i}...`);
    
    try {
      const res = await fetch(`${API_BASE}/surah/${i}/editions/quran-uthmani,en.sahih`);
      const data = await res.json();
      
      if (data.code === 200) {
        const arabicAyahs = data.data[0].ayahs;
        const englishAyahs = data.data[1].ayahs;

        const ayahRows = [];
        const transRows = [];

        for (let j = 0; j < arabicAyahs.length; j++) {
          const ar = arabicAyahs[j];
          const en = englishAyahs[j];

          // Prepare Ayah Row
          ayahRows.push({
            surah_number: i,
            ayah_number: ar.numberInSurah,
            text_uthmani: ar.text,
            text_imlaei: ar.text, // Simply using same text for now, cleaning diacritics is complex in simple JS
            juz_number: ar.juz,
            page_number: ar.page,
            hizb_quarter: ar.hizbQuarter,
            sajda: typeof ar.sajda === 'object' ? true : ar.sajda
          });

          // Prepare Translation Row
          transRows.push({
            surah_number: i,
            ayah_number: ar.numberInSurah,
            edition_slug: 'en-sahih',
            text_content: en.text
          });
        }

        // Insert Ayahs
        const { error: ayahError } = await supabase.from('quran_ayahs').upsert(ayahRows, { onConflict: 'surah_number,ayah_number' });
        if (ayahError) console.error(`❌ Error inserting Ayahs for Surah ${i}:`, ayahError);

        // Insert Translations
        // We need the Ayah IDs theoretically, but our schema uses composite key (surah, ayah) for relation or ID.
        // My SQL schema used FK on (surah, ayah), so this works.
        const { error: transError } = await supabase.from('quran_translations').upsert(transRows, { onConflict: 'surah_number,ayah_number,edition_slug' });
        if (transError) console.error(`❌ Error inserting Translation for Surah ${i}:`, transError);

      }
    } catch (e) {
      console.error(`❌ Failed to fetch Surah ${i}`, e);
    }

    await sleep(500); // Respect API limits
  }

  console.log("🎉 Quran Seeding Complete!");
}

seedQuran();


import { supabase, generateEmbedding, sleep } from './utils.js';

// Using FawazAhmed API
const BASE_URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

const BOOKS = [
  { id: 'bukhari', title: 'Sahih al-Bukhari', cat: 'hadith' },
  { id: 'muslim', title: 'Sahih Muslim', cat: 'hadith' },
  { id: 'nawawi40', title: '40 Hadith Nawawi', cat: 'hadith' },
  { id: 'riyadussalihin', title: 'Riyad as-Salihin', cat: 'hadith' }
];

async function seedHadith() {
  console.log("📚 Starting Hadith Seeding (with AI Embeddings)...");

  for (const book of BOOKS) {
    console.log(`\n📘 Processing Book: ${book.title}...`);

    // 1. Insert Book
    await supabase.from('library_books').upsert({
      id: book.id,
      title_en: book.title,
      category: book.cat,
      is_available_offline: true
    });

    // 2. Fetch Sections (Chapters)
    const sectionsRes = await fetch(`${BASE_URL}/editions/eng-${book.id}/sections.json`);
    const sectionsData = await sectionsRes.json();
    
    // Normalize sections format (API varies)
    let sections = [];
    if (sectionsData.sections && !Array.isArray(sectionsData.sections)) {
       sections = Object.entries(sectionsData.sections).map(([k, v]) => ({ id: k, title: v }));
    }

    // Insert Chapters
    for (const sec of sections) {
        if (sec.id === '0' || sec.id === '') continue; // Skip metadata
        
        const { data: insertedChapter, error } = await supabase.from('library_chapters').upsert({
            book_id: book.id,
            chapter_number: parseInt(sec.id) || 0,
            title_en: sec.title
        }, { onConflict: 'book_id, chapter_number' }).select().single();

        if (error || !insertedChapter) {
            console.error(`   ❌ Failed chapter ${sec.id}`, error);
            continue;
        }

        // 3. Fetch Hadiths for this Section
        try {
            const hadithRes = await fetch(`${BASE_URL}/editions/eng-${book.id}/sections/${sec.id}.json`);
            const hadithJson = await hadithRes.json();
            const hadiths = hadithJson.hadiths;

            if (hadiths && hadiths.length > 0) {
                console.log(`   Processing Section ${sec.id}: ${hadiths.length} Hadiths...`);
                
                // Batch process hadiths
                const batchSize = 10;
                for (let i = 0; i < hadiths.length; i += batchSize) {
                    const chunk = hadiths.slice(i, i + batchSize);
                    const rows = [];

                    for (const h of chunk) {
                        const content = h.text;
                        // Generate Embedding (Costly operation, be careful)
                        const vector = await generateEmbedding(content);
                        
                        rows.push({
                            book_id: book.id,
                            chapter_id: insertedChapter.id,
                            hadith_number: String(h.hadithnumber),
                            content_text: content,
                            embedding: vector // Vector data for AI search
                        });
                        
                        await sleep(200); // Rate limit for AI API
                    }

                    const { error: hError } = await supabase.from('library_content').upsert(rows, { onConflict: 'book_id, hadith_number' });
                    if (hError) console.error("   ❌ Insert Error", hError);
                }
            }
        } catch (e) {
            console.warn(`   ⚠️ Could not fetch hadiths for section ${sec.id}`);
        }
    }
  }

  console.log("🎉 Hadith Seeding Complete!");
}

seedHadith();


import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// 1. Initialize Supabase (Use SERVICE_ROLE_KEY for writing data)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST use Service Role to bypass RLS for inserts

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Initialize AI for Embeddings
const aiApiKey = process.env.AI_API_KEY;
let aiClient = null;
if (aiApiKey) {
  aiClient = new GoogleGenAI({ apiKey: aiApiKey });
}

// 3. Helper: Generate Embedding
export async function generateEmbedding(text) {
  if (!aiClient || !text) return null;
  try {
    // Clean text to save tokens
    const cleanText = text.replace(/\n/g, ' ').substring(0, 2000); 
    
    const result = await aiClient.models.embedContent({
      model: 'text-embedding-004',
      content: { parts: [{ text: cleanText }] },
    });
    
    return result.embedding.values;
  } catch (error) {
    console.warn(`⚠️ Embedding failed (skipping vector): ${error.message}`);
    return null;
  }
}

// 4. Helper: Sleep to respect API rate limits
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

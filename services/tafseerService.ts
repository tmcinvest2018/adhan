
import { TafsirEdition } from '../types';

// Map Key: "{surahNumber}:{ayahNumber}" -> Value: Tafseer Text
export type AyahTafseerMap = Record<string, string>;

const STORAGE_KEY_PREFIX = 'nurprayer_tafseer_map_';

// MOCK RAW DATA (Unsegmented Blob to prove segmentation logic)
const MOCK_RAW_IBN_KATHIR_FATIHA = `
[Ayah 1] In the Name of Allah, the Most Gracious, the Most Merciful. The Basmalah is the beginning of the Surah. Scholars agree it is a verse in An-Naml, but differ if it is a verse of Al-Fatiha.
[Ayah 2] All Praise is due to Allah, Lord of the worlds. The word 'Rabb' (Lord) denotes the One who nurtures and sustains. 'Al-Alamin' (worlds) refers to everything except Allah.
[Ayah 3] The Entirely Merciful, the Especially Merciful. These are two names derived from Ar-Rahman. Ar-Rahman is more exclusive to Allah.
[Ayah 4] Sovereign of the Day of Recompense. Maliki Yawm ad-Din means the Owner of the Day of Judgment. No one will claim sovereignty on that day except Him.
[Ayah 5] It is You we worship and You we ask for help. This signifies that we worship none but You and rely on none but You. This is the essence of Monotheism.
[Ayah 6] Guide us to the straight path. Meaning, show us, direct us, and grant us success in traversing the path that has no crookedness.
[Ayah 7] The path of those upon whom You have bestowed favor, not of those who have earned Your anger or of those who are astray. The Jews earned anger, and the Christians went astray.
`;

const MOCK_RAW_JALALAYN_FATIHA = `
[Ayah 1] Bismillah. Starts with the name of Allah for blessings.
[Ayah 2] Hamd belongs to Allah alone. He is the Creator of all beings.
[Ayah 3] Ar-Rahman, Ar-Rahim. Possessor of vast mercy.
[Ayah 4] Owner of the Day of Judgment. The day when deeds are calculated.
[Ayah 5] We dedicate our worship only to You.
[Ayah 6] Keep us firm on the Straight Path of Islam.
[Ayah 7] The path of Prophets and Truthful ones, distinct from the path of disbelievers.
`;

const MOCK_RAW_TABARI_FATIHA = `
[Ayah 1] The Imam of Mufassirin, Ibn Jarir al-Tabari, states regarding 'Bismillah': It is a name from the names of Allah, and every Surah begins with it to seek blessing.
[Ayah 2] 'Al-Hamdu Lillah': Gratitude is due to Allah alone, not any of his creation. He is the Lord of all the worlds, encompassing jinn and mankind.
[Ayah 3] 'Ar-Rahman Ar-Rahim': Two names indicating His vast mercy. Rahman is generally for all, Rahim is specifically for believers.
[Ayah 4] 'Maliki Yawm ad-Din': He is the sole Judge on the Day of Recompense, where no soul shall have power for another.
[Ayah 5] 'Iyyaka Na'budu': We humble ourselves before You alone, obeying Your commands and shunning Your prohibitions.
[Ayah 6] 'Ihdina': Guide us, grant us success, and keep us firm upon the Straight Path.
[Ayah 7] The path of those You favored (Prophets and Truthful), distinct from those who earned anger (Jews) and those who went astray (Christians).
`;

const MOCK_RAW_QURTUBI_FATIHA = `
[Ayah 1] Al-Qurtubi says: There is consensus that the Basmalah is a verse of the Quran in Surah An-Naml, but scholars differ on its status in Al-Fatiha. Malik did not recite it aloud in prayer.
[Ayah 2] 'Rabb' implies the Master and Reformer. The Worlds (Al-Alamin) refers to every existing thing other than Allah.
[Ayah 3] These names describe the essence of Allah's mercy. Ar-Rahman is a proper name unique to Him.
[Ayah 4] Reading it as 'Maliki' (Owner) or 'Maliki' (King) both indicate His absolute sovereignty on the Day of Judgment.
[Ayah 5] This verse affirms that power and assistance are sought only from Him, rejecting any partners.
[Ayah 6] The Straight Path is Islam, according to Ibn Abbas. It is the clear road leading to Allah's pleasure.
[Ayah 7] Those bestowed with favor are the Prophets, the Truthful, the Martyrs, and the Righteous.
`;

export const TafseerService = {
  
  /**
   * FIX B1 CORE LOGIC:
   * Takes an ID (and implicitly loads raw content), segments it per Ayah, 
   * and maps it to specific Ayah IDs.
   */
  prepareTafseerMap: async (tafseerId: string, surahNumber: number): Promise<AyahTafseerMap> => {
    const cacheKey = `${STORAGE_KEY_PREFIX}${tafseerId}_${surahNumber}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
        return JSON.parse(cached);
    }

    // SIMULATE LOADING RAW CONTENT
    // In production, this comes from LibraryService.getContent(bookId)
    let rawText = "";
    if (tafseerId.includes('ibnkathir')) rawText = MOCK_RAW_IBN_KATHIR_FATIHA;
    else if (tafseerId.includes('jalalayn')) rawText = MOCK_RAW_JALALAYN_FATIHA;
    else if (tafseerId.includes('tabari')) rawText = MOCK_RAW_TABARI_FATIHA;
    else if (tafseerId.includes('qurtubi')) rawText = MOCK_RAW_QURTUBI_FATIHA;
    else rawText = "Tafseer content not available for this edition.";

    // SEGMENTATION LOGIC
    // Parses the "[Ayah X]" markers to split the blob into a synchronized map.
    const map: AyahTafseerMap = {};
    
    // Regex to find [Ayah Number] markers
    const parts = rawText.split(/\[Ayah (\d+)\]/g);
    
    // Split result looks like: ["", "1", "Text...", "2", "Text..."]
    for (let i = 1; i < parts.length; i += 2) {
        const ayahNum = parts[i];
        const text = parts[i + 1]?.trim();
        if (ayahNum && text) {
            map[`${surahNumber}:${ayahNum}`] = text;
        }
    }

    // If segmentation failed (no markers), map whole text to Ayah 1 as fallback
    if (Object.keys(map).length === 0 && rawText.trim().length > 0) {
        map[`${surahNumber}:1`] = rawText;
    }

    // CACHE THE MAP (Simulating MMKV)
    localStorage.setItem(cacheKey, JSON.stringify(map));
    
    return map;
  },

  /**
   * Fast lookup for specific Ayah Tafseer
   */
  getTafseerByAyahId: (tafseerId: string, surahNumber: number, ayahNumber: number): string => {
    const cacheKey = `${STORAGE_KEY_PREFIX}${tafseerId}_${surahNumber}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
        const map = JSON.parse(cached);
        return map[`${surahNumber}:${ayahNumber}`] || "No commentary available for this specific Ayah.";
    }

    return "Loading commentary...";
  },

  getAvailableTafseers: (): TafsirEdition[] => {
      return [
          { id: 'en.ibnkathir', name: 'Tafsir Ibn Kathir', author: 'Ibn Kathir', language: 'en' },
          { id: 'ar.jalalayn', name: 'Tafsir Al-Jalalayn', author: 'Jalal al-Din', language: 'ar' },
          { id: 'ar.tabari', name: 'Tafsir Al-Tabari', author: 'Ibn Jarir al-Tabari', language: 'ar' },
          { id: 'ar.qurtubi', name: 'Tafsir Al-Qurtubi', author: 'Al-Qurtubi', language: 'ar' }
      ];
  }
};

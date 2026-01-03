import { Surah, Ayah, SearchResult, TafsirEdition } from '../types';

const BASE_URL = 'https://api.alquran.cloud/v1';

// Cache for Surah List
let surahListCache: Surah[] | null = null;

// --- FALLBACK DATA (FULL 114 SURAHS) ---
const FALLBACK_SURAHS: Surah[] = [
  { number: 1, name: "سورة الفاتحة", englishName: "Al-Fatiha", englishNameTranslation: "The Opening", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 2, name: "سورة البقرة", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", numberOfAyahs: 286, revelationType: "Medinan" },
  { number: 3, name: "سورة آل عمران", englishName: "Aal-i-Imraan", englishNameTranslation: "The Family of Imran", numberOfAyahs: 200, revelationType: "Medinan" },
  { number: 4, name: "سورة النساء", englishName: "An-Nisa", englishNameTranslation: "The Women", numberOfAyahs: 176, revelationType: "Medinan" },
  { number: 5, name: "سورة المائدة", englishName: "Al-Ma'idah", englishNameTranslation: "The Table Spread", numberOfAyahs: 120, revelationType: "Medinan" },
  { number: 6, name: "سورة الأنعام", englishName: "Al-An'am", englishNameTranslation: "The Cattle", numberOfAyahs: 165, revelationType: "Meccan" },
  { number: 7, name: "سورة الأعراف", englishName: "Al-A'raf", englishNameTranslation: "The Heights", numberOfAyahs: 206, revelationType: "Meccan" },
  { number: 8, name: "سورة الأنفال", englishName: "Al-Anfal", englishNameTranslation: "The Spoils of War", numberOfAyahs: 75, revelationType: "Medinan" },
  { number: 9, name: "سورة التوبة", englishName: "At-Tawbah", englishNameTranslation: "The Repentance", numberOfAyahs: 129, revelationType: "Medinan" },
  { number: 10, name: "سورة يونس", englishName: "Yunus", englishNameTranslation: "Jonah", numberOfAyahs: 109, revelationType: "Meccan" },
  { number: 11, name: "سورة هود", englishName: "Hud", englishNameTranslation: "Hud", numberOfAyahs: 123, revelationType: "Meccan" },
  { number: 12, name: "سورة يوسف", englishName: "Yusuf", englishNameTranslation: "Joseph", numberOfAyahs: 111, revelationType: "Meccan" },
  { number: 13, name: "سورة الرعد", englishName: "Ar-Ra'd", englishNameTranslation: "The Thunder", numberOfAyahs: 43, revelationType: "Medinan" },
  { number: 14, name: "سورة إبراهيم", englishName: "Ibrahim", englishNameTranslation: "Abraham", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 15, name: "سورة الحجر", englishName: "Al-Hijr", englishNameTranslation: "The Rocky Tract", numberOfAyahs: 99, revelationType: "Meccan" },
  { number: 16, name: "سورة النحل", englishName: "An-Nahl", englishNameTranslation: "The Bee", numberOfAyahs: 128, revelationType: "Meccan" },
  { number: 17, name: "سورة الإسراء", englishName: "Al-Isra", englishNameTranslation: "The Night Journey", numberOfAyahs: 111, revelationType: "Meccan" },
  { number: 18, name: "سورة الكهف", englishName: "Al-Kahf", englishNameTranslation: "The Cave", numberOfAyahs: 110, revelationType: "Meccan" },
  { number: 19, name: "سورة مريم", englishName: "Maryam", englishNameTranslation: "Mary", numberOfAyahs: 98, revelationType: "Meccan" },
  { number: 20, name: "سورة طه", englishName: "Ta-Ha", englishNameTranslation: "Ta-Ha", numberOfAyahs: 135, revelationType: "Meccan" },
  { number: 21, name: "سورة الأنبياء", englishName: "Al-Anbya", englishNameTranslation: "The Prophets", numberOfAyahs: 112, revelationType: "Meccan" },
  { number: 22, name: "سورة الحج", englishName: "Al-Hajj", englishNameTranslation: "The Pilgrimage", numberOfAyahs: 78, revelationType: "Medinan" },
  { number: 23, name: "سورة المؤمنون", englishName: "Al-Mu'minun", englishNameTranslation: "The Believers", numberOfAyahs: 118, revelationType: "Meccan" },
  { number: 24, name: "سورة النور", englishName: "An-Nur", englishNameTranslation: "The Light", numberOfAyahs: 64, revelationType: "Medinan" },
  { number: 25, name: "سورة الفرقان", englishName: "Al-Furqan", englishNameTranslation: "The Criterion", numberOfAyahs: 77, revelationType: "Meccan" },
  { number: 26, name: "سورة الشعراء", englishName: "Ash-Shu'ara", englishNameTranslation: "The Poets", numberOfAyahs: 227, revelationType: "Meccan" },
  { number: 27, name: "سورة النمل", englishName: "An-Naml", englishNameTranslation: "The Ant", numberOfAyahs: 93, revelationType: "Meccan" },
  { number: 28, name: "سورة القصص", englishName: "Al-Qasas", englishNameTranslation: "The Stories", numberOfAyahs: 88, revelationType: "Meccan" },
  { number: 29, name: "سورة العنكبوت", englishName: "Al-Ankabut", englishNameTranslation: "The Spider", numberOfAyahs: 69, revelationType: "Meccan" },
  { number: 30, name: "سورة الروم", englishName: "Ar-Rum", englishNameTranslation: "The Romans", numberOfAyahs: 60, revelationType: "Meccan" },
  { number: 31, name: "سورة لقمان", englishName: "Luqman", englishNameTranslation: "Luqman", numberOfAyahs: 34, revelationType: "Meccan" },
  { number: 32, name: "سورة السجدة", englishName: "As-Sajdah", englishNameTranslation: "The Prostration", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 33, name: "سورة الأحزاب", englishName: "Al-Ahzab", englishNameTranslation: "The Combined Forces", numberOfAyahs: 73, revelationType: "Medinan" },
  { number: 34, name: "سورة سبأ", englishName: "Saba", englishNameTranslation: "Sheba", numberOfAyahs: 54, revelationType: "Meccan" },
  { number: 35, name: "سورة فاطر", englishName: "Fatir", englishNameTranslation: "Originator", numberOfAyahs: 45, revelationType: "Meccan" },
  { number: 36, name: "سورة يس", englishName: "Ya-Sin", englishNameTranslation: "Ya Sin", numberOfAyahs: 83, revelationType: "Meccan" },
  { number: 37, name: "سورة الصافات", englishName: "As-Saffat", englishNameTranslation: "Those who set the Ranks", numberOfAyahs: 182, revelationType: "Meccan" },
  { number: 38, name: "سورة ص", englishName: "Sad", englishNameTranslation: "The Letter 'Sad'", numberOfAyahs: 88, revelationType: "Meccan" },
  { number: 39, name: "سورة الزمر", englishName: "Az-Zumar", englishNameTranslation: "The Troops", numberOfAyahs: 75, revelationType: "Meccan" },
  { number: 40, name: "سورة غافر", englishName: "Ghafir", englishNameTranslation: "The Forgiver", numberOfAyahs: 85, revelationType: "Meccan" },
  { number: 41, name: "سورة فصلت", englishName: "Fussilat", englishNameTranslation: "Explained in Detail", numberOfAyahs: 54, revelationType: "Meccan" },
  { number: 42, name: "سورة الشورى", englishName: "Ash-Shura", englishNameTranslation: "The Consultation", numberOfAyahs: 53, revelationType: "Meccan" },
  { number: 43, name: "سورة الزخرف", englishName: "Az-Zukhruf", englishNameTranslation: "The Ornaments of Gold", numberOfAyahs: 89, revelationType: "Meccan" },
  { number: 44, name: "سورة الدخان", englishName: "Ad-Dukhan", englishNameTranslation: "The Smoke", numberOfAyahs: 59, revelationType: "Meccan" },
  { number: 45, name: "سورة الجاثية", englishName: "Al-Jathiyah", englishNameTranslation: "The Crouching", numberOfAyahs: 37, revelationType: "Meccan" },
  { number: 46, name: "سورة الأحقاف", englishName: "Al-Ahqaf", englishNameTranslation: "The Wind-Curved Sandhills", numberOfAyahs: 35, revelationType: "Meccan" },
  { number: 47, name: "سورة محمد", englishName: "Muhammad", englishNameTranslation: "Muhammad", numberOfAyahs: 38, revelationType: "Medinan" },
  { number: 48, name: "سورة الفتح", englishName: "Al-Fath", englishNameTranslation: "The Victory", numberOfAyahs: 29, revelationType: "Medinan" },
  { number: 49, name: "سورة الحجرات", englishName: "Al-Hujurat", englishNameTranslation: "The Rooms", numberOfAyahs: 18, revelationType: "Medinan" },
  { number: 50, name: "سورة ق", englishName: "Qaf", englishNameTranslation: "The Letter 'Qaf'", numberOfAyahs: 45, revelationType: "Meccan" },
  { number: 51, name: "سورة الذاريات", englishName: "Ad-Dhariyat", englishNameTranslation: "The Winnowing Winds", numberOfAyahs: 60, revelationType: "Meccan" },
  { number: 52, name: "سورة الطور", englishName: "At-Tur", englishNameTranslation: "The Mount", numberOfAyahs: 49, revelationType: "Meccan" },
  { number: 53, name: "سورة النجم", englishName: "An-Najm", englishNameTranslation: "The Star", numberOfAyahs: 62, revelationType: "Meccan" },
  { number: 54, name: "سورة القمر", englishName: "Al-Qamar", englishNameTranslation: "The Moon", numberOfAyahs: 55, revelationType: "Meccan" },
  { number: 55, name: "سورة الرحمن", englishName: "Ar-Rahman", englishNameTranslation: "The Beneficent", numberOfAyahs: 78, revelationType: "Medinan" },
  { number: 56, name: "سورة الواقعة", englishName: "Al-Waqi'a", englishNameTranslation: "The Inevitable", numberOfAyahs: 96, revelationType: "Meccan" },
  { number: 57, name: "سورة الحديد", englishName: "Al-Hadid", englishNameTranslation: "The Iron", numberOfAyahs: 29, revelationType: "Medinan" },
  { number: 58, name: "سورة المجادلة", englishName: "Al-Mujadila", englishNameTranslation: "The Pleading Woman", numberOfAyahs: 22, revelationType: "Medinan" },
  { number: 59, name: "سورة الحشر", englishName: "Al-Hashr", englishNameTranslation: "The Exile", numberOfAyahs: 24, revelationType: "Medinan" },
  { number: 60, name: "سورة الممتحنة", englishName: "Al-Mumtahanah", englishNameTranslation: "She that is to be examined", numberOfAyahs: 13, revelationType: "Medinan" },
  { number: 61, name: "سورة الصف", englishName: "As-Saff", englishNameTranslation: "The Ranks", numberOfAyahs: 14, revelationType: "Medinan" },
  { number: 62, name: "سورة الجمعة", englishName: "Al-Jumu'ah", englishNameTranslation: "The Congregation, Friday", numberOfAyahs: 11, revelationType: "Medinan" },
  { number: 63, name: "سورة المنافقون", englishName: "Al-Munafiqun", englishNameTranslation: "The Hypocrites", numberOfAyahs: 11, revelationType: "Medinan" },
  { number: 64, name: "سورة التغابن", englishName: "At-Taghabun", englishNameTranslation: "The Mutual Disillusion", numberOfAyahs: 18, revelationType: "Medinan" },
  { number: 65, name: "سورة الطلاق", englishName: "At-Talaq", englishNameTranslation: "The Divorce", numberOfAyahs: 12, revelationType: "Medinan" },
  { number: 66, name: "سورة التحريم", englishName: "At-Tahrim", englishNameTranslation: "The Prohibition", numberOfAyahs: 12, revelationType: "Medinan" },
  { number: 67, name: "سورة الملك", englishName: "Al-Mulk", englishNameTranslation: "The Sovereignty", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 68, name: "سورة القلم", englishName: "Al-Qalam", englishNameTranslation: "The Pen", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 69, name: "سورة الحاقة", englishName: "Al-Haqqah", englishNameTranslation: "The Reality", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 70, name: "سورة المعارج", englishName: "Al-Ma'arij", englishNameTranslation: "The Ascending Stairways", numberOfAyahs: 44, revelationType: "Meccan" },
  { number: 71, name: "سورة نوح", englishName: "Nuh", englishNameTranslation: "Noah", numberOfAyahs: 28, revelationType: "Meccan" },
  { number: 72, name: "سورة الجن", englishName: "Al-Jinn", englishNameTranslation: "The Jinn", numberOfAyahs: 28, revelationType: "Meccan" },
  { number: 73, name: "سورة المزمل", englishName: "Al-Muzzammil", englishNameTranslation: "The Enshrouded One", numberOfAyahs: 20, revelationType: "Meccan" },
  { number: 74, name: "سورة المدثر", englishName: "Al-Muddaththir", englishNameTranslation: "The Cloaked One", numberOfAyahs: 56, revelationType: "Meccan" },
  { number: 75, name: "سورة القيامة", englishName: "Al-Qiyamah", englishNameTranslation: "The Resurrection", numberOfAyahs: 40, revelationType: "Meccan" },
  { number: 76, name: "سورة الإنسان", englishName: "Al-Insan", englishNameTranslation: "The Man", numberOfAyahs: 31, revelationType: "Medinan" },
  { number: 77, name: "سورة المرسلات", englishName: "Al-Mursalat", englishNameTranslation: "The Emissaries", numberOfAyahs: 50, revelationType: "Meccan" },
  { number: 78, name: "سورة النبأ", englishName: "An-Naba", englishNameTranslation: "The Tidings", numberOfAyahs: 40, revelationType: "Meccan" },
  { number: 79, name: "سورة النازعات", englishName: "An-Nazi'at", englishNameTranslation: "Those who drag forth", numberOfAyahs: 46, revelationType: "Meccan" },
  { number: 80, name: "سورة عبس", englishName: "Abasa", englishNameTranslation: "He Frowned", numberOfAyahs: 42, revelationType: "Meccan" },
  { number: 81, name: "سورة التكوير", englishName: "At-Takwir", englishNameTranslation: "The Overthrowing", numberOfAyahs: 29, revelationType: "Meccan" },
  { number: 82, name: "سورة الانفطار", englishName: "Al-Infitar", englishNameTranslation: "The Cleaving", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 83, name: "سورة المطففين", englishName: "Al-Mutaffifin", englishNameTranslation: "The Defrauding", numberOfAyahs: 36, revelationType: "Meccan" },
  { number: 84, name: "سورة الانشقاق", englishName: "Al-Inshiqaq", englishNameTranslation: "The Sundering", numberOfAyahs: 25, revelationType: "Meccan" },
  { number: 85, name: "سورة البروج", englishName: "Al-Buruj", englishNameTranslation: "The Mansions of the Stars", numberOfAyahs: 22, revelationType: "Meccan" },
  { number: 86, name: "سورة الطارق", englishName: "At-Tariq", englishNameTranslation: "The Morning Star", numberOfAyahs: 17, revelationType: "Meccan" },
  { number: 87, name: "سورة الأعلى", englishName: "Al-A'la", englishNameTranslation: "The Most High", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 88, name: "سورة الغاشية", englishName: "Al-Ghashiyah", englishNameTranslation: "The Overwhelming", numberOfAyahs: 26, revelationType: "Meccan" },
  { number: 89, name: "سورة الفجر", englishName: "Al-Fajr", englishNameTranslation: "The Dawn", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 90, name: "سورة البلد", englishName: "Al-Balad", englishNameTranslation: "The City", numberOfAyahs: 20, revelationType: "Meccan" },
  { number: 91, name: "سورة الشمس", englishName: "Ash-Shams", englishNameTranslation: "The Sun", numberOfAyahs: 15, revelationType: "Meccan" },
  { number: 92, name: "سورة الليل", englishName: "Al-Layl", englishNameTranslation: "The Night", numberOfAyahs: 21, revelationType: "Meccan" },
  { number: 93, name: "سورة الضحى", englishName: "Ad-Duhaa", englishNameTranslation: "The Morning Hours", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 94, name: "سورة الشرح", englishName: "Ash-Sharh", englishNameTranslation: "The Relief", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 95, name: "سورة التين", englishName: "At-Tin", englishNameTranslation: "The Fig", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 96, name: "سورة العلق", englishName: "Al-Alaq", englishNameTranslation: "The Clot", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 97, name: "سورة القدر", englishName: "Al-Qadr", englishNameTranslation: "The Power", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 98, name: "سورة البينة", englishName: "Al-Bayyinah", englishNameTranslation: "The Clear Proof", numberOfAyahs: 8, revelationType: "Medinan" },
  { number: 99, name: "سورة الزلزلة", englishName: "Az-Zalzalah", englishNameTranslation: "The Earthquake", numberOfAyahs: 8, revelationType: "Medinan" },
  { number: 100, name: "سورة العاديات", englishName: "Al-Adiyat", englishNameTranslation: "The Courser", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 101, name: "سورة القارعة", englishName: "Al-Qari'ah", englishNameTranslation: "The Calamity", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 102, name: "سورة التكاثر", englishName: "At-Takathur", englishNameTranslation: "The Rivalry in world increase", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 103, name: "سورة العصر", englishName: "Al-Asr", englishNameTranslation: "The Declining Day", numberOfAyahs: 3, revelationType: "Meccan" },
  { number: 104, name: "سورة الهمزة", englishName: "Al-Humazah", englishNameTranslation: "The Traducer", numberOfAyahs: 9, revelationType: "Meccan" },
  { number: 105, name: "سورة الفيل", englishName: "Al-Fil", englishNameTranslation: "The Elephant", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 106, name: "سورة قريش", englishName: "Quraysh", englishNameTranslation: "Quraysh", numberOfAyahs: 4, revelationType: "Meccan" },
  { number: 107, name: "سورة الماعون", englishName: "Al-Ma'un", englishNameTranslation: "The Small Kindnesses", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 108, name: "سورة الكوثر", englishName: "Al-Kawthar", englishNameTranslation: "The Abundance", numberOfAyahs: 3, revelationType: "Meccan" },
  { number: 109, name: "سورة الكافرون", englishName: "Al-Kafirun", englishNameTranslation: "The Disbelievers", numberOfAyahs: 6, revelationType: "Meccan" },
  { number: 110, name: "سورة النصر", englishName: "An-Nasr", englishNameTranslation: "The Divine Support", numberOfAyahs: 3, revelationType: "Medinan" },
  { number: 111, name: "سورة المسد", englishName: "Al-Masad", englishNameTranslation: "The Palm Fiber", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 112, name: "سورة الإخلاص", englishName: "Al-Ikhlas", englishNameTranslation: "The Sincerity", numberOfAyahs: 4, revelationType: "Meccan" },
  { number: 113, name: "سورة الفلق", englishName: "Al-Falaq", englishNameTranslation: "The Daybreak", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 114, name: "سورة الناس", englishName: "An-Naas", englishNameTranslation: "Mankind", numberOfAyahs: 6, revelationType: "Meccan" }
];

const FALLBACK_FATIHA_AYAHS: Ayah[] = [
    {
        number: 1,
        text: "بِسْم. ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
        translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        numberInSurah: 1,
        juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false,
        audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3",
        audioSecondary: []
    },
    {
        number: 2,
        text: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
        translation: "[All] praise is [due] to Allah, Lord of the worlds -",
        numberInSurah: 2,
        juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false,
        audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3",
        audioSecondary: []
    },
    {
        number: 3,
        text: "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
        translation: "The Entirely Merciful, the Especially Merciful,",
        numberInSurah: 3,
        juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false,
        audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/3.mp3",
        audioSecondary: []
    },
    {
        number: 4,
        text: "مَـٰلِكِ يَوْمِ ٱلدِّينِ",
        translation: "Sovereign of the Day of Recompense.",
        numberInSurah: 4,
        juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false,
        audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/4.mp3",
        audioSecondary: []
    },
    {
        number: 5,
        text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        translation: "It is You we worship and You we ask for help.",
        numberInSurah: 5,
        juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false,
        audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/5.mp3",
        audioSecondary: []
    },
    {
        number: 6,
        text: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
        translation: "Guide us to the straight path -",
        numberInSurah: 6,
        juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false,
        audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6.mp3",
        audioSecondary: []
    },
    {
        number: 7,
        text: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
        translation: "The path of those upon whom You have bestowed favor, not of those who have earned [Your] anger or of those who are astray.",
        numberInSurah: 7,
        juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false,
        audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/7.mp3",
        audioSecondary: []
    }
];

export const fetchSurahList = async (): Promise<Surah[]> => {
  if (surahListCache) return surahListCache;
  
  try {
    const response = await fetch(`${BASE_URL}/surah`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    if (data.code === 200) {
      surahListCache = data.data;
      return data.data;
    }
    throw new Error('API Error');
  } catch (error) {
    console.warn('Error fetching surah list, using fallback:', error);
    surahListCache = FALLBACK_SURAHS;
    return FALLBACK_SURAHS;
  }
};

export const fetchAvailableTafsirEditions = async (language: string): Promise<TafsirEdition[]> => {
    return [
        { id: 'en.ibnkathir', name: 'Tafsir Ibn Kathir', author: 'Hafiz Ibn Kathir', language: 'en' },
        { id: 'ar.jalalayn', name: 'Tafsir al-Jalalayn', author: 'Jalal al-Din', language: 'ar' },
        { id: 'ar.tabari', name: 'Tafsir al-Tabari', author: 'Ibn Jarir al-Tabari', language: 'ar' },
        { id: 'ar.qurtubi', name: 'Tafsir al-Qurtubi', author: 'Al-Qurtubi', language: 'ar' }
    ];
};

export const fetchSurahContent = async (
    surahNumber: number, 
    reciterId: string = 'ar.alafasy',
    translationId: string = 'en.sahih',
    tafsirId: string | null = null 
): Promise<Ayah[]> => {
  try {
    const editions = [reciterId, translationId];
    const response = await fetch(`${BASE_URL}/surah/${surahNumber}/editions/${editions.join(',')}`);
    if (!response.ok) throw new Error("Network error");
    const data = await response.json();
    
    if (data.code === 200 && data.data.length >= 2) {
      const audioData = data.data[0].ayahs;
      const translationData = data.data[1].ayahs;

      return audioData.map((ayah: any, index: number) => {
        // Force HTTPS to prevent 'Source not supported' due to Mixed Content
        let audioUrl = ayah.audio;
        if (audioUrl && audioUrl.startsWith('http://')) {
            audioUrl = audioUrl.replace('http://', 'https://');
        }
        return {
            ...ayah,
            translation: translationData[index].text,
            audio: audioUrl,
        };
      });
    }
    throw new Error('Failed to load Surah');
  } catch (error) {
    console.error("Quran API Error, using fallback content", error);
    
    if (surahNumber === 1) {
        return FALLBACK_FATIHA_AYAHS;
    }
    
    // Minimal Fallback with a valid dummy silent/info audio to prevent 'Source not supported'
    return [{
        number: 1,
        text: "Inhoud tijdelijk niet beschikbaar.",
        audio: "https://www.islamcan.com/audio/adhan/azan1.mp3", // Use a known valid URL instead of empty string
        translation: "Controleer uw internetverbinding om dit hoofdstuk te laden.",
        numberInSurah: 1,
        juz: 0, manzil: 0, page: 0, ruku: 0, hizbQuarter: 0, sajda: false, audioSecondary: []
    }];
  }
};

export const fetchAyahTafsir = async (surahNumber: number, ayahNumber: number, editionId: string = 'en.ibnkathir'): Promise<string> => {
    const fetchFromApi = async (id: string) => {
        try {
            const response = await fetch(`${BASE_URL}/ayah/${surahNumber}:${ayahNumber}/${id}`);
            const data = await response.json();
            if (data.code === 200 && data.data?.text) {
                return data.data.text;
            }
        } catch (e) { console.warn(e); }
        return null;
    }

    let content = await fetchFromApi(editionId);
    if (content) return content;

    if (editionId !== 'en.ibnkathir') {
        content = await fetchFromApi('en.ibnkathir');
        if (content) return `[English Fallback]\n\n${content}`;
    }

    if (editionId !== 'ar.jalalayn') {
        content = await fetchFromApi('ar.jalalayn');
        if (content) return `[Arabic Fallback]\n\n${content}`;
    }

    return "Tafsir unavailable for this Ayah.";
}

export const searchAyahs = async (query: string, language: string): Promise<SearchResult[]> => {
    if (!query || query.length < 3) return [];

    try {
        let edition = 'en.sahih';
        if (language === 'nl') edition = 'nl.siregar';
        else if (language === 'fr') edition = 'fr.hamidullah';
        else if (language === 'id') edition = 'id.indonesian';
        if (/[\u0600-\u06FF]/.test(query)) edition = 'quran-simple-clean';

        const response = await fetch(`${BASE_URL}/search/${encodeURIComponent(query)}/all/${edition}`);
        const data = await response.json();

        if (data.code === 200 && data.data && data.data.matches) {
            return data.data.matches.slice(0, 10).map((match: any) => ({
                id: `quran_${match.surah.number}_${match.numberInSurah}`,
                category: 'quran',
                title: `Surah ${match.surah.englishName} ${match.surah.number}:${match.numberInSurah}`,
                subtitle: match.text, 
                data: {
                    surah: match.surah.number,
                    ayah: match.numberInSurah
                }
            }));
        }
        return [];
    } catch (e) {
        const results: SearchResult[] = [];
        const lowerQ = query.toLowerCase();

        FALLBACK_SURAHS.forEach(s => {
            if (s.englishName.toLowerCase().includes(lowerQ) || s.englishNameTranslation.toLowerCase().includes(lowerQ)) {
                 results.push({
                    id: `quran_surah_${s.number}`,
                    category: 'quran',
                    title: `Surah ${s.englishName}`,
                    subtitle: s.englishNameTranslation,
                    data: { surah: s.number, ayah: 1 }
                });
            }
        });

        FALLBACK_FATIHA_AYAHS.forEach(a => {
            if (a.translation?.toLowerCase().includes(lowerQ) || a.text.includes(query)) {
                results.push({
                    id: `quran_1_${a.numberInSurah}`,
                    category: 'quran',
                    title: `Surah Al-Fatiha 1:${a.numberInSurah}`,
                    subtitle: a.translation || a.text,
                    data: { surah: 1, ayah: a.numberInSurah }
                });
            }
        });
        
        return results;
    }
};

export const RECITERS = [
    { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
    { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit (Murattal)' },
    { id: 'ar.abdulrahmansudais', name: 'Abdur-Rahman as-Sudais' },
    { id: 'ar.saudshuraim', name: 'Saud Al-Shuraim' },
    { id: 'ar.saadalkhamdi', name: 'Saad Al-Ghamdi' },
    { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary' },
    { id: 'ar.minshawi', name: 'Mohamed Siddiq Al-Minshawi' },
    { id: 'ar.mahermuaiqly', name: 'Maher Al-Muaiqly' }
];

export const TRANSLATIONS = [
    { id: 'en.sahih', name: 'English (Sahih International)' },
    { id: 'nl.siregar', name: 'Dutch (Sofian S. Siregar)' },
    { id: 'fr.hamidullah', name: 'French (Hamidullah)' },
    { id: 'tr.diyanet', name: 'Turkish (Diyanet Isleri)' },
    { id: 'id.indonesian', name: 'Indonesian' },
    { id: 'ur.jalandhry', name: 'Urdu (Jalandhry)' },
    { id: 'ru.kuliev', name: 'Russian (Kuliev)' },
];
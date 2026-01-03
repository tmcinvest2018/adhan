

export const translations: Record<string, any> = {
  en: {
    appTitle: "NurPrayer",
    prayers: { fajr: "Fajr", sunrise: "Sunrise", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha" },
    status: { next: "Next", current: "Now", done: "Done for today", nextPrayer: "Next Prayer", timeLeft: "Left" },
    tabs: { prayers: "Prayers", qibla: "Qibla", quran: "Quran", tracker: "Tracker", ilmhub: "Knowledge", ukhuwwah: "Ukhuwwah" },
    ilmhub: {
      title: "Al-Noor Knowledge",
      tabs: { feed: "Feed", hisn: "Hisn Muslim", library: "Library", media: "Media", ai: "Ask AI" },
      feed: { daily: "Daily Wisdom", reminder: "Reminder", featured: "Featured Text" },
      library: { search: "Search library...", categories: "Categories", read: "Read", download: "Download", downloading: "Downloading...", open: "Open Book" },
      media: { title: "Audio & Video", watch: "Watch", listen: "Listen", cat_quran: "Quran", cat_lecture: "Lectures", cat_history: "History", cat_fiqh: "Fiqh & Rules" },
      ai: { placeholder: "Ask a question about Islam...", disclaimer: "AI-generated summary. Consult scholars for Fatwas.", sources: "Sources used:", send: "Send" }
    },
    ukhuwwah: {
        title: "Ukhuwwah",
        subtitle: "Brotherhood & Community",
        feed: "Community Feed",
        connect: "Connect",
        scan: "Scan QR",
        verify: "Verify",
        login: "Join Community",
        role_select: "Select your Role",
        gender_select: "Select your Gender",
        roles: { wakeel: "Wakeel (Admin)", nasir: "Nasir (Helper)", muakhi: "Mu'akhi (Newcomer)" },
        brother: "Brother",
        sister: "Sister",
        dashboard: "Dashboard",
        pending_requests: "Pending Requests",
        no_requests: "No pending requests.",
        my_qr: "My Mosque QR",
        scan_instruction: "Scan Wakeel QR to join Mosque",
        verified: "Verified",
        unverified: "Unverified",
        welcome: "Welcome back",
        guest_banner: "Join the community to connect with mentors and mosques."
    },
    settings: {
      title: "Settings", notifications: "Notifications", enableNotif: "Enable Notifications", sound: "Adhan Sound", testSound: "Test",
      method: "Calculation Method", madhab: "Asr Method (Madhab)", location: "Location", gps: "Use GPS", language: "Language", save: "Save",
      standard: "Standard", hanafi: "Hanafi", quranSettings: "Quran Settings", mushafType: "Mushaf Style", mushafUthmani: "Uthmani",
      mushafIndoPak: "IndoPak", fontSize: "Arabic Font Size", tajweed: "Tajweed Rules", tajweedInfo: "Color-coded letters for pronunciation.", preview: "Preview"
    },
    qibla: { calibrate: "Calibrate Compass", permission: "Need sensor access for Qibla.", start: "Start Compass", direction: "Qibla Direction", distance: "km to Mecca", aligned: "Facing Qibla!", instruction: "Rotate until Kaaba aligns." },
    quran: { surah: "Surah", juz: "Juz", ayah: "Ayah", search: "Search Surah...", lastRead: "Last Read", continue: "Continue Reading", reciter: "Reciter", translation: "Translation", tafsir: "Tafsir", close: "Close", loading: "Loading...", play: "Play", pause: "Pause", stop: "Stop", nextAyah: "Next", prevAyah: "Prev", goto: "Go to", showTafsir: "Tafsir & Translation", changeReciterHint: "Change reciter in Settings" },
    dhikr: { search: "Search Dhikr...", morning: "Morning", evening: "Evening", afterPrayer: "After Prayer", hadith: "Hadith", source: "Source", repeat: "Repeat", times: "times", contextTitle: "Information", fiqh: "Fiqh", rakahs: "Rakahs", recitation: "Recitation", loud: "Loud", silent: "Silent", none: "N/A", mixed: "Mixed", sunnah: "Sunnah", recommendedDhikr: "Recommended" },
    tracker: { title: "Tracker", weekly: "Weekly Progress", habits: "Habits", streak: "Streak", days: "days", complete: "Done", incomplete: "Progress" },
    onboarding: { welcome: "Welcome to NurPrayer", bismillah: "In the name of Allah", step1: "Select Language", step2: "Select Reciter", step3: "Enable Location", allowLocation: "Allow Access", getStarted: "Get Started" },
    errors: { location: "Location denied. Enable GPS.", fetchQuran: "Data error. Check internet." }
  },
  nl: {
    appTitle: "NurPrayer",
    prayers: { fajr: "Fajr", sunrise: "Zonsopkomst", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha" },
    status: { next: "Volgende", current: "Nu", done: "Klaar voor vandaag", nextPrayer: "Volgend Gebed", timeLeft: "Nog" },
    tabs: { prayers: "Gebed", qibla: "Qibla", quran: "Koran", tracker: "Tracker", ilmhub: "Kennis", ukhuwwah: "Ukhuwwah" },
    ilmhub: {
      title: "Al-Noor Kenniscentrum",
      tabs: { feed: "Tijdlijn", hisn: "Hisn Muslim", library: "Bibliotheek", media: "Media", ai: "Vraag AI" },
      feed: { daily: "Dagelijkse Wijsheid", reminder: "Herinnering", featured: "Uitgelicht" },
      library: { search: "Zoek in bibliotheek...", categories: "Categorieën", read: "Lezen", download: "Download", downloading: "Downloaden...", open: "Open Boek" },
      media: { title: "Audio & Video", watch: "Kijken", listen: "Luisteren", cat_quran: "Koran", cat_lecture: "Lezingen", cat_history: "Geschiedenis", cat_fiqh: "Fiqh & Regels" },
      ai: { placeholder: "Stel een vraag over de Islam...", disclaimer: "AI samenvatting. Raadpleeg geleerden voor Fatwa's.", sources: "Bronnen gebruikt:", send: "Verstuur" }
    },
    ukhuwwah: {
        title: "Ukhuwwah",
        subtitle: "Broederschap & Gemeenschap",
        feed: "Gemeenschap",
        connect: "Verbinden",
        scan: "Scan QR",
        verify: "Verifiëren",
        login: "Word Lid",
        role_select: "Kies uw Rol",
        gender_select: "Kies uw Geslacht",
        roles: { wakeel: "Wakeel (Beheerder)", nasir: "Nasir (Helper)", muakhi: "Mu'akhi (Nieuwkomer)" },
        brother: "Broeder",
        sister: "Zuster",
        dashboard: "Dashboard",
        pending_requests: "Openstaande Verzoeken",
        no_requests: "Geen verzoeken.",
        my_qr: "Mijn Moskee QR",
        scan_instruction: "Scan Wakeel QR om lid te worden",
        verified: "Geverifieerd",
        unverified: "Niet geverifieerd",
        welcome: "Welkom terug",
        guest_banner: "Word lid om te verbinden met mentors en moskeeën."
    },
    settings: {
      title: "Instellingen", notifications: "Meldingen", enableNotif: "Meldingen inschakelen", sound: "Adhan Geluid", testSound: "Test",
      method: "Berekeningsmethode", madhab: "Asr Methode", location: "Locatie", gps: "Gebruik GPS", language: "Taal", save: "Opslaan",
      standard: "Standaard", hanafi: "Hanafi", quranSettings: "Koran Instellingen", mushafType: "Mushaf Stijl", mushafUthmani: "Uthmani",
      mushafIndoPak: "IndoPak", fontSize: "Lettergrootte Arabisch", tajweed: "Tajweed Regels", tajweedInfo: "Gekleurde letters voor uitspraak.", preview: "Voorbeeld"
    },
    qibla: { calibrate: "Kalibreer Kompas", permission: "Toegang nodig tot sensors.", start: "Start Kompas", direction: "Qibla Richting", distance: "km naar Mekka", aligned: "Naar Qibla gericht!", instruction: "Draai tot Kaaba uitgelijnd is." },
    quran: { surah: "Soera", juz: "Juz", ayah: "Ayah", search: "Zoek Soera...", lastRead: "Laatst gelezen", continue: "Verder lezen", reciter: "Reciteur", translation: "Vertaling", tafsir: "Tefsir", close: "Sluiten", loading: "Laden...", play: "Afspelen", pause: "Pauze", stop: "Stop", nextAyah: "Volgende", prevAyah: "Vorige", goto: "Ga naar", showTafsir: "Tefsir & Vertaling", changeReciterHint: "Wijzig reciteur in Instellingen" },
    dhikr: { search: "Zoek Dhikr...", morning: "Ochtend", evening: "Avond", afterPrayer: "Na Gebed", hadith: "Hadith", source: "Bron", repeat: "Herhaal", times: "keer", contextTitle: "Informatie", fiqh: "Fiqh", rakahs: "Rakahs", recitation: "Recitatie", loud: "Hardop", silent: "Stil", none: "N.v.t.", mixed: "Gemengd", sunnah: "Sunnah", recommendedDhikr: "Aanbevolen" },
    tracker: { title: "Tracker", weekly: "Wekelijkse Voortgang", habits: "Gewoontes", streak: "Streak", days: "dagen", complete: "Voltooid", incomplete: "Bezig" },
    onboarding: { welcome: "Welkom bij NurPrayer", bismillah: "In de naam van Allah", step1: "Kies Taal", step2: "Kies Reciteur", step3: "Locatie Aanzetten", allowLocation: "Toegang Toestaan", getStarted: "Aan de slag" },
    errors: { location: "Locatie geweigerd. Zet GPS aan.", fetchQuran: "Data fout. Check internet." }
  },
  // ... other languages would follow pattern
};

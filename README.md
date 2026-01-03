# NurPrayer (Ibadawah)

**NurPrayer** (branded as *Ibadawah*) is a premium, privacy-centric Islamic companion application designed with a "Divine Minimalism" aesthetic. It integrates high-precision astronomical calculations with a rich library of classical Islamic texts and modern AI-driven research tools to assist Muslims in their daily worship.

## 🌙 Mission Statement
Our mission is to provide a serene, ad-free, and distraction-less digital environment for spiritual growth. By combining sophisticated hardware sensor logic for the Qibla and robust API integrations for the Quran and Hadith, NurPrayer ensures that technology serves as a bridge, not a barrier, to devotion.

## 🚀 Core Functionalities

### 1. Accurate Prayer Times
- **Geo-Located Calculations:** Uses the `adhan` library for precise timings based on multiple calculation methods (MWL, ISNA, Makkah, etc.).
- **Smart Notifications:** Customizable Adhan alerts with high-quality audio from Makkah, Madina, and Al-Aqsa.
- **Next Prayer Ticker:** A live countdown to the next prayer time, keeping you mindful of your schedule.

### 2. Advanced Qibla Compass
- **Spherical Geometry:** Uses the Haversine bearing formula to calculate the exact direction to the Kaaba.
- **Hardware Integration:** Real-time sensor smoothing via vector averaging of sin/cos components to eliminate jitter.
- **Bubble Leveler:** Integrated pitch and roll detection ensures the compass is only active when held flat, guaranteeing maximum accuracy.
- **Haptic Feedback:** Vibrates and glows when perfectly aligned (within 3 degrees).

### 3. Comprehensive Quran Module
- **High-Quality Recitations:** Integration with leading reciters like Alafasy, Sudais, and Al-Husary.
- **Study Mode:** Segmented Tafsir (Ibn Kathir, Jalalayn) mapped per Ayah for deep contemplation.
- **Tajweed Support:** Optional color-coded text for pronunciation rules.
- **Last Read Tracking:** Automatically remembers your position across sessions.

### 4. IlmHub (The Knowledge Center)
- **Library & Hadith:** Access to the "Six Books" (Bukhari, Muslim, etc.) and classical texts like *The Sealed Nectar* and *Ihya Ulum al-Din*.
- **Hisnul Muslim:** A complete, searchable database of authentic Duas (Fortress of the Muslim).
- **Multimedia:** Context-aware search for lectures and Quranic videos from verified scholars.
- **AI Al-Noor:** A dedicated AI researcher (powered by Gemini 3 Flash) that provides context-aware answers to Islamic questions using the app's internal library.

### 5. Spiritual Tracker
- **Habit Tracking:** Monitor your daily 5 prayers, Sunnahs, and Quran reading progress.
- **Consistency Streaks:** Gamified progress to encourage daily spiritual discipline.

## 🛠 Technical Highlights
- **Framework:** React 19 + TypeScript.
- **Styling:** Tailwind CSS with a "Divine Minimalism" design system (Emerald and soft mint tones).
- **AI Engine:** Google Gemini 3 Flash for intelligent Islamic research.
- **Hardware APIs:** Geolocation, DeviceOrientation, and Haptic Feedback.
- **Offline First:** Local caching of library structures and PWA capabilities for use without an active connection.

---

*This application is built for the sake of Allah (SWT) and is intended to be a free tool for the Ummah.*
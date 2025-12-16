
import { PrayerTimeDisplay } from '../types';

export const ContextService = {
    /**
     * Analyzes the current environment to generate context tags for the feed.
     * Order of tags implies priority (First tag = Highest Priority).
     */
    getRelevantTags: (date: Date, nextPrayer: PrayerTimeDisplay | null): string[] => {
        const tags: string[] = [];
        const hour = date.getHours();
        const day = date.getDay(); // 0 = Sunday, 5 = Friday

        // 1. PRAYER TIME CONTEXT (Highest Priority)
        // Determines specific states like "Before Maghrib" or "Morning Adhkar time"
        if (nextPrayer) {
            const timeDiff = nextPrayer.time.getTime() - date.getTime();
            const minutesToPrayer = Math.floor(timeDiff / 60000);

            if (nextPrayer.originalKey === 'maghrib' && minutesToPrayer <= 60) {
                tags.push('PRE_MAGHRIB'); // Golden hour for Dua
                tags.push('EVENING_ADHKAAR');
            } else if (nextPrayer.originalKey === 'fajr') {
                tags.push('PRE_FAJR'); // Tahajjud / Suhoor time
            } else if (nextPrayer.originalKey === 'sunrise') {
                tags.push('POST_FAJR');
                tags.push('MORNING_ADHKAAR');
            } else if (nextPrayer.originalKey === 'dhuhr' && hour < 12) {
                tags.push('MORNING_ADHKAAR');
            }
        } else {
            // Fallback if no next prayer (e.g., after Isha)
            if (hour >= 21 || hour < 4) {
                tags.push('PRE_SLEEP');
                tags.push('NIGHT_IBADAH');
            }
        }

        // 2. DAILY CONTEXT
        if (day === 5) { // Friday
            tags.push('FRIDAY_JUMUAH');
            tags.push('SURAH_KAHF');
        }
        if (day === 1 || day === 4) { // Monday or Thursday
            tags.push('SUNNAH_FASTING');
        }

        // 3. HIJRI CONTEXT (Special Days & Months)
        try {
            // Get Hijri parts: [month, day, year]
            const uFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
                day: 'numeric',
                month: 'numeric'
            });
            const parts = uFormatter.formatToParts(date);
            const hMonth = parts.find(p => p.type === 'month')?.value;
            const hDay = parts.find(p => p.type === 'day')?.value;

            if (hMonth && hDay) {
                const month = parseInt(hMonth);
                const dayNum = parseInt(hDay);

                // RAMADAN (Month 9)
                if (month === 9) {
                    tags.push('RAMADAN');
                    if (dayNum >= 21) tags.push('LAYLATUL_QADR');
                    else if (dayNum <= 10) tags.push('RAMADAN_MERCY');
                }

                // SHAWWAL (Month 10)
                if (month === 10) {
                    if (dayNum === 1) tags.push('EID_AL_FITR');
                    else tags.push('SHAWWAL_FASTING');
                }

                // DHUL HIJJAH (Month 12)
                if (month === 12) {
                    tags.push('DHUL_HIJJAH');
                    if (dayNum <= 10) tags.push('BEST_10_DAYS');
                    if (dayNum === 9) tags.push('DAY_OF_ARAFAH');
                    if (dayNum === 10) tags.push('EID_AL_ADHA');
                }

                // MUHARRAM (Month 1)
                if (month === 1) {
                    tags.push('MUHARRAM');
                    if (dayNum === 10) tags.push('ASHURA');
                }
            }
        } catch (e) {
            console.warn("Hijri context calc failed", e);
        }

        // 4. GENERAL CONTEXT (Lowest Priority)
        tags.push('GENERAL_REMINDER');
        tags.push('KNOWLEDGE');

        return tags;
    }
};

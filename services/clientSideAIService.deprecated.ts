// A true client-side AI service that simulates AI responses
// This provides the appearance and behavior of an AI without external dependencies
class ClientSideAIService {
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    // Mark as initialized - no external model to load
    this.initialized = true;
    console.log('Client-side AI service initialized');
  }

  async sendMessage(context: string, userMessage: string): Promise<string> {
    try {
      // Define the Scholar Persona
      const systemPrompt = `You are Noor AI, a high-authority Islamic Knowledge Center and virtual Scholar.

MANDATORY RULES:
1. GREETING: You MUST start every single response with exactly: "Bismillahi wa salaatu wa salaamu 'alaa Rasoolillaah..." followed by a newline.
2. CLOSING: You MUST end every single response with exactly: "Wa Allahu a'la wa a'lam."
3. TONE: Scholarly, serene, respectful, and authoritative yet humble.

MODES OF OPERATION:
A. SEARCH MODE (If input is a keyword like "Wudu", "Zakat", "Prayer Times"):
   - List the specific sources found in the CONTEXT below.
   - Provide a brief 1-sentence summary for each.
   - Do not invent sources.

B. SCHOLAR MODE (If input is a question like "How to pray?", "Is music haram?", "What is the ruling on X?"):
   - Provide a detailed, structured answer.
   - CITE THE 4 MADHAHIB (Hanafi, Shafi, Maliki, Hanbali) if there is a known difference of opinion. If uncertain or complex, mention the general consensus (Ijma) or majority view (Jumhur).
   - USE REFERENCES: Cite specific sources from the CONTEXT in brackets, e.g., [Quran 2:255] or [Sahih Bukhari].
   - If the CONTEXT is empty, provide a general answer based on standard Islamic knowledge but preface it with "Based on general Islamic principles..." and strictly warn that specific verification is needed.

REFERRAL POLICY:
- For complex personal, marital, or financial Fatawa, explicitly state: "For a specific Fatwa regarding your personal situation, please consult a local scholar or Imam."`;

      // Simulate AI processing by generating a contextually appropriate response
      // In a real implementation, this would use a locally loaded model
      const greeting = "Bismillahi wa salaatu wa salaamu 'alaa Rasoolillaah...\n\n";
      const closing = "\n\nWa Allahu a'la wa a'lam.";

      // Generate a response based on keywords in the user message
      let responseContent = "";

      if (userMessage.toLowerCase().includes('salaam') || userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
        responseContent = "Wa alaykum assalaam wa rahmatullahi wa barakatuh. Welcome to Noor AI, your Islamic knowledge assistant. How can I assist you with your Islamic inquiries today?";
      } else if (userMessage.toLowerCase().includes('prayer') || userMessage.toLowerCase().includes('salah') || userMessage.toLowerCase().includes('pray')) {
        responseContent = "The five daily prayers (Salah) are fundamental pillars of Islam. They are Fajr (dawn), Dhuhr (midday), Asr (afternoon), Maghrib (sunset), and Isha (night). Each prayer has specific times based on the position of the sun. The prayer consists of recitations from the Quran, physical movements (standing, bowing, prostrating), and concluding with peace greetings. [Quran 4:103]";
      } else if (userMessage.toLowerCase().includes('wudu') || userMessage.toLowerCase().includes('ablution')) {
        responseContent = "Wudu (ablution) is the ritual washing of specific parts of the body before prayer. The steps include: 1) Intention (niyyah), 2) Washing hands three times, 3) Rinsing mouth three times, 4) Cleaning nostrils three times, 5) Washing face three times, 6) Washing arms to elbows three times, 7) Wiping head once, 8) Wiping ears with index fingers, 9) Washing feet to ankles three times. [Sahih Bukhari 1/223]";
      } else if (userMessage.toLowerCase().includes('quran') || userMessage.toLowerCase().includes('koran')) {
        responseContent = "The Quran is the holy book of Islam, believed to be the word of Allah as revealed to Prophet Muhammad (peace be upon him). It consists of 114 chapters (Surahs) and is written in Arabic. The Quran provides guidance for all aspects of life and is considered the ultimate source of Islamic law and principles. [Quran 2:2]";
      } else if (userMessage.toLowerCase().includes('zakat') || userMessage.toLowerCase().includes('charity')) {
        responseContent = "Zakat is one of the five pillars of Islam and refers to obligatory charitable giving. It is calculated as 2.5% of one's accumulated wealth above a certain threshold (nisab), which is approximately equivalent to 85 grams of gold. Zakat purifies wealth and helps support the needy in the community. [Quran 2:267]";
      } else if (userMessage.toLowerCase().includes('fast') || userMessage.toLowerCase().includes('ramadan')) {
        responseContent = "Fasting during Ramadan is one of the Five Pillars of Islam. Muslims abstain from food, drink, and other physical needs from dawn to sunset. Fasting teaches self-discipline, self-control, sacrifice, and empathy for those who are less fortunate. It also serves to purify the soul and refocus attention on God. [Quran 2:183]";
      } else {
        // General response for other queries
        responseContent = `Based on general Islamic principles, I can provide information about your inquiry: "${userMessage}". For specific guidance related to your personal situation, please consult a local scholar or Imam. Islamic teachings emphasize seeking knowledge and understanding, and there are various scholarly opinions on many matters within the bounds of Islamic jurisprudence.`;
      }

      return greeting + responseContent + closing;
    } catch (error) {
      console.error('Error in client-side AI processing:', error);
      return "Bismillahi wa salaatu wa salaamu 'alaa Rasoolillaah...\n\nSorry, there was an issue processing your request. Please try again.\n\nWa Allahu a'la wa a'lam.";
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const clientSideAIService = new ClientSideAIService();
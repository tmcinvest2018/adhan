import { ChatMessage } from '../types';

interface LocalAIConfig {
  baseUrl: string;
  model: string;
}

class LocalAIService {
  private config: LocalAIConfig;

  constructor() {
    this.config = {
      baseUrl: 'http://localhost:11434/api',
      model: 'qwen2.5:0.5b'
    };
  }

  async sendMessage(messages: ChatMessage[], contextString: string): Promise<string> {
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

      const requestBody = {
        model: this.config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${contextString}\n\nUSER QUESTION: ${messages[messages.length - 1].text}` }
        ],
        stream: false,
        options: {
          temperature: 0.3
        }
      };

      const response = await fetch(`${this.config.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Local AI Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data?.message?.content || data?.response || "Sorry, I couldn't process that request.";
    } catch (error) {
      console.error('Local AI Service Error:', error);
      return "Sorry, there was an issue processing your request. Please try again.";
    }
  }
}

export const localAIService = new LocalAIService();
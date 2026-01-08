// Local AI Service using Transformers.js for client-side inference
class LocalAIService {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
    this.initializationPromise = null;
  }
  
  async initialize() {
    // Prevent multiple initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    this.initializationPromise = new Promise((resolve, reject) => {
      try {
        // Create worker instance - using relative path for local model
        this.worker = new Worker('./worker/AIWorker.js');
        
        // Set up message handling
        this.worker.onmessage = (event) => {
          const { message_id, status, result, error } = event.data;
          
          if (status === 'ready') {
            this.isInitialized = true;
            resolve();
          } else if (status === 'error') {
            reject(new Error(error));
          }
        };
        
        // Send initialization message
        const messageId = 'init_' + Date.now();
        this.worker.postMessage({
          message_id: messageId,
          function_call: 'init',
          args: {}
        });
      } catch (error) {
        reject(error);
      }
    });
    
    return this.initializationPromise;
  }
  
  async sendMessage(context, userMessage) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return new Promise((resolve, reject) => {
      const messageId = 'generate_' + Date.now();
      
      // Set up response handler
      const messageHandler = (event) => {
        const { message_id, status, result, error } = event.data;
        
        if (message_id === messageId) {
          if (status === 'complete') {
            resolve(result);
          } else if (status === 'error') {
            reject(new Error(error));
          }
          
          // Remove listener after handling
          this.worker.removeEventListener('message', messageHandler);
        }
      };
      
      this.worker.addEventListener('message', messageHandler);
      
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

      // Create the full prompt
      const fullPrompt = `<|system|>
${systemPrompt}
<|user|>
${context}

USER QUESTION: ${userMessage}
<|assistant|>`;

      // Send generation request
      this.worker.postMessage({
        message_id: messageId,
        function_call: 'generate',
        args: {
          text: fullPrompt,
          options: {
            max_new_tokens: 300,
            temperature: 0.3,
            repetition_penalty: 1.1
          }
        }
      });
    });
  }
}

export const localAIService = new LocalAIService();
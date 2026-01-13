// Simple API utility for AI requests
export const aiAPI = {
  async sendMessage(message: string): Promise<string> {
    try {
      const response = await fetch('/api/hf-inference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('AI API Error:', error);
      return "Sorry, I couldn't process your request at the moment.";
    }
  }
};
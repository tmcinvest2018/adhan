// Minimal AI Service interface
export interface AIService {
  sendMessage(context: string, query: string): Promise<any>;
  initialize(): Promise<void>;
  isInitialized(): boolean;
}
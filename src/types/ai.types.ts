// Simple AI Response type for compatibility
export interface AIResponse {
  id: string;
  role: string;
  content: string;
  sources: any[];
  timestamp: Date;
  references: any[];
}
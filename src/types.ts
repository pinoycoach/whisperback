
export interface WhisperGift {
  id: string;
  recipientName?: string;
  occasion: string;
  message: string;
  quote: string;
  imagePrompt: string;
  audioBase64?: string;
  imageUrl?: string;
}

export interface GenerationStep {
  label: string;
  status: 'pending' | 'active' | 'complete';
}

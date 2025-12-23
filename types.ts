
export interface MorphState {
  originalImage: string | null;
  morphedImage: string | null;
  prompt: string;
  seed: number;
  isProcessing: boolean;
  error: string | null;
}

export interface MorphHistoryItem {
  id: string;
  originalImage: string;
  morphedImage: string;
  prompt: string;
  seed: number;
  timestamp: number;
}

export enum GeneratorType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export interface PromptState {
  subject: string;
  action: string;
  style: string;
  composition: string;
  lighting: string;
  details: string;
  weather: string;
  camera: string;
  depthOfField: string;
  motion?: string; // Optional for video
}

export interface SavedPrompt {
  id: string;
  timestamp: number;
  prompt: PromptState;
  type: GeneratorType;
}

export enum ApiStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}
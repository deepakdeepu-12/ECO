// ─── Shared API Types ─────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// ─── Classify ─────────────────────────────────────────────────────────────────

export interface ClassificationResult {
  wasteType?: string;
  category?: string;
  recyclable?: boolean;
  confidence?: number;
  color?: string;
  instructions?: string[];
  tips?: string;
  binColor?: string;
  points?: number;
  error?: string;
}

// ─── Support ──────────────────────────────────────────────────────────────────

export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

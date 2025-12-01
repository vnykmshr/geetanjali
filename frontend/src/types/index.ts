// API Response Types based on project-description.md

export interface Case {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  role: string;
  stakeholders: string[];
  constraints: string[];
  horizon: 'short' | 'medium' | 'long';
  sensitivity?: 'low' | 'medium' | 'high';
  created_at?: string;
}

export interface Verse {
  id: string;
  canonical_id: string; // e.g., BG_2_47
  chapter: number;
  shloka: number;
  sanskrit_text: string;
  transliteration: string;
  source: string;
}

export interface Option {
  title: string;
  pros: string[];
  cons: string[];
  verses?: string[]; // canonical_ids (optional - may be missing in fallback responses)
}

export interface Output {
  id: string;
  case_id: string;
  result_json: {
    executive_summary: string;
    options: Option[];
    recommended_action: string | {
      option?: number;
      steps?: string[];
      sources?: string[];
    };
    reflection_prompts: string[];
    sources: {
      canonical_id: string;
      paraphrase: string;
      school?: string;
    }[];
    confidence: number;
  };
  confidence: number;
  scholar_flag: boolean;
  created_at: string;
}

export interface ScholarReviewRequest {
  approved: boolean;
}

export interface Message {
  id: string;
  case_id: string;
  role: 'user' | 'assistant';
  content: string;
  output_id?: string;
  created_at: string;
}

export interface MessageCreate {
  content: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  environment: string;
}

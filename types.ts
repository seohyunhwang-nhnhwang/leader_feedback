
export interface Persona {
  job: string;
  title: string;
  selfEvaluation: string;
  disposition: string;
  currentIssue: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface EvaluationReport {
  summary: string;
  firn_score: {
    F: number;
    I: number;
    R: number;
    N: number;
    Manner: number;
  };
  good_points: string[];
  improvement_points: string[];
  overall_comment: string;
  totalScore: number;
}

export enum AppPhase {
  SETUP,
  CHAT,
  REPORT
}

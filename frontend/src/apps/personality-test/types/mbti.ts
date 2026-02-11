export interface Question {
  id: string;
  text: string;
  optionA: string; // First displayed option
  optionB: string; // Second displayed option
  functionType?: 'Ni/Ne' | 'Si/Se' | 'Ti/Te' | 'Fi/Fe'; // Omitted for attention checks
  category: 'function-preference' | 'function-order' | 'attention-check' | 'ei-orientation';
  reversed?: boolean; // When true, A=introverted side, B=extroverted side; scoring is inverted
  discriminationTier?: number; // 1=high, 2=medium, 3=low - adaptive question ordering
  consistencyPairId?: string; // Links semantically similar questions for consistency checking
  attentionCheckExpectedValue?: number; // Expected Likert value for attention check items
}

export interface Response {
  questionId: string;
  value: number; // Likert scale: -2 (strongly B), -1 (slightly B), 0 (neutral), 1 (slightly A), 2 (strongly A)
}

export interface CognitiveFunction {
  introverted: string;
  extroverted: string;
  isExtroverted: boolean;
  isAnimating?: boolean;
}

export interface MBTITypeInfo {
  functions: string[];
  description: string;
}

export interface TypeResult {
  type: string;
  score: number;
  match: string;
}

export interface FunctionScores {
  'Ni/Ne': number;
  'Si/Se': number;
  'Ti/Te': number;
  'Fi/Fe': number;
}

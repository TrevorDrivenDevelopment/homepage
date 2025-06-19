export interface Question {
  id: string;
  text: string;
  optionA: string; // Extroverted version
  optionB: string; // Introverted version
  functionType: 'Ni/Ne' | 'Si/Se' | 'Ti/Te' | 'Fi/Fe';
  category: 'function-preference' | 'function-order';
}

export interface Response {
  questionId: string;
  value: boolean | null; // true = option A (extroverted), false = option B (introverted), null = unsure
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

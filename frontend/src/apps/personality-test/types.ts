export enum CognitiveFunctionType {
  INTUITION = 'intuition',
  SENSING = 'sensing', 
  THINKING = 'thinking',
  FEELING = 'feeling',
  EXTROVERSION_INTROVERSION = 'extroversion-introversion',
  JUDGING_PERCEIVING = 'judging-perceiving'
}

export enum CognitiveFunctionName {
  // Intuition functions
  NI = 'Ni',
  NE = 'Ne',
  // Sensing functions
  SI = 'Si', 
  SE = 'Se',
  // Thinking functions
  TI = 'Ti',
  TE = 'Te',
  // Feeling functions
  FI = 'Fi',
  FE = 'Fe'
}

export enum QuestionCategory {
  FUNCTION_PREFERENCE = 'function-preference',
  FUNCTION_ORDER = 'function-order',
  TRADITIONAL_DICHOTOMY = 'traditional-dichotomy'
}

export enum MBTIType {
  INTJ = 'INTJ',
  INTP = 'INTP', 
  ENTJ = 'ENTJ',
  ENTP = 'ENTP',
  INFJ = 'INFJ',
  INFP = 'INFP',
  ENFJ = 'ENFJ',
  ENFP = 'ENFP',
  ISTJ = 'ISTJ',
  ISFJ = 'ISFJ',
  ESTJ = 'ESTJ',
  ESFJ = 'ESFJ',
  ISTP = 'ISTP',
  ISFP = 'ISFP',
  ESTP = 'ESTP',
  ESFP = 'ESFP'
}

export enum MBTILetter {
  E = 'E',
  I = 'I',
  S = 'S', 
  N = 'N',
  T = 'T',
  F = 'F',
  J = 'J',
  P = 'P',
  UNKNOWN = 'X'
}

export interface Question {
  text: string;
  extroverted: string; // Extroverted version
  introverted: string; // Introverted version
  functionType: CognitiveFunctionType;
  category: QuestionCategory;
}

export interface Response {
  questionIndex: number; // Index of the question in the array
  value: boolean | null; // true = extroverted, false = introverted, null = unsure
}

export interface CognitiveFunction {
  introverted: CognitiveFunctionName;
  extroverted: CognitiveFunctionName;
  isExtroverted: boolean;
  isAnimating?: boolean;
}

export interface MBTITypeInfo {
  functions: [CognitiveFunctionName, CognitiveFunctionName, CognitiveFunctionName, CognitiveFunctionName];
  description: string;
}

export interface TypeResult {
  type: MBTIType;
  score: number;
  match: string;
}

export interface FunctionScores {
  [CognitiveFunctionType.INTUITION]: number;
  [CognitiveFunctionType.SENSING]: number;
  [CognitiveFunctionType.THINKING]: number;
  [CognitiveFunctionType.FEELING]: number;
}

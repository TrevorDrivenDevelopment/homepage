// Re-export types from mbti.ts and add strategy-specific types
import { QuestionCategory } from '../types';

export type { 
  Question,
  Response,
  MBTITypeInfo,
  TypeResult,
  FunctionScores,
  CognitiveFunction
} from '../types';

export { 
  CognitiveFunctionType,
  CognitiveFunctionName,
  QuestionCategory,
  MBTIType,
  MBTILetter
} from '../types';

// Additional types for strategies
export type QuestionType = QuestionCategory;

// Function scores using cognitive function names
export interface DetailedFunctionScores {
  Ne: number;
  Ni: number;
  Se: number;
  Si: number;
  Te: number;
  Ti: number;
  Fe: number;
  Fi: number;
}

import { mbtiTypes, questions } from './data/mbtiData';
import { CognitiveFunction, CognitiveFunctionName, CognitiveFunctionType, FunctionScores, MBTILetter, MBTIType, QuestionCategory, Response, TypeResult } from './mbti';

// Constants for scoring weights
const SCORING_WEIGHTS = {
  DOMINANT_MATCH: 40,
  AUXILIARY_MATCH: 30,
  TERTIARY_MATCH: 20,
  INFERIOR_MATCH: 10,
  EXACT_TYPE_BONUS: 50,
  FUNCTION_PREFERENCE_MULTIPLIER: 2
};

const MATCH_THRESHOLDS = {
  EXCELLENT: 90,
  VERY_GOOD: 70,
  GOOD: 50,
  PARTIAL: 30
};

// Mapping between function types and their individual functions
const FUNCTION_PAIRS = {
  [CognitiveFunctionType.INTUITION]: { extroverted: CognitiveFunctionName.NE, introverted: CognitiveFunctionName.NI },
  [CognitiveFunctionType.SENSING]: { extroverted: CognitiveFunctionName.SE, introverted: CognitiveFunctionName.SI },
  [CognitiveFunctionType.THINKING]: { extroverted: CognitiveFunctionName.TE, introverted: CognitiveFunctionName.TI },
  [CognitiveFunctionType.FEELING]: { extroverted: CognitiveFunctionName.FE, introverted: CognitiveFunctionName.FI }
};

export const calculateFunctionScores = (responses: Response[]): FunctionScores => {
  const functionScores: FunctionScores = {
    [CognitiveFunctionType.INTUITION]: 0,
    [CognitiveFunctionType.SENSING]: 0,
    [CognitiveFunctionType.THINKING]: 0,
    [CognitiveFunctionType.FEELING]: 0
  };
  
  responses.forEach(response => {
    const question = questions[response.questionIndex];
    if (!question || response.value === null) return;
    
    if (response.value) {
      functionScores[question.functionType] += 1; // Extroverted version
    } else {
      functionScores[question.functionType] -= 1; // Introverted version
    }
  });
  
  return functionScores;
};

// Enhanced function scoring that weighs order questions more heavily
export const calculateEnhancedFunctionScores = (responses: Response[]): FunctionScores => {
  return responses.reduce((scores, response) => {
    const question = questions[response.questionIndex];
    if (!question || response.value === null) return scores;
    const weight = question.category === QuestionCategory.FUNCTION_ORDER ? 2 : 1;
    scores[question.functionType] += response.value ? weight : -weight;
    return scores;
  }, {
    [CognitiveFunctionType.INTUITION]: 0,
    [CognitiveFunctionType.SENSING]: 0,
    [CognitiveFunctionType.THINKING]: 0,
    [CognitiveFunctionType.FEELING]: 0
  } as FunctionScores);
};

// Helper functions for type determination
const determineExtroversion = (functionStack: CognitiveFunction[]): MBTILetter => {
  return functionStack[0].isExtroverted ? MBTILetter.E : MBTILetter.I;
};

const determineSensingIntuition = (functionStack: CognitiveFunction[]): MBTILetter => {
  const scores = [0, 0]; // [sensing, intuition]
  
  functionStack.forEach((func, index) => {
    const activeFunction = func.isExtroverted ? func.extroverted : func.introverted;
    const weight = 4 - index; // Earlier functions have more weight
    
    if ([CognitiveFunctionName.SI, CognitiveFunctionName.SE].includes(activeFunction)) {
      scores[0] += weight;
    } else if ([CognitiveFunctionName.NI, CognitiveFunctionName.NE].includes(activeFunction)) {
      scores[1] += weight;
    }
  });
  
  if (scores[0] === 0 && scores[1] === 0) return MBTILetter.UNKNOWN;
  return scores[1] > scores[0] ? MBTILetter.N : MBTILetter.S;
};

const determineThinkingFeeling = (functionStack: CognitiveFunction[]): MBTILetter => {
  const scores = [0, 0]; // [thinking, feeling]
  
  functionStack.forEach((func, index) => {
    const activeFunction = func.isExtroverted ? func.extroverted : func.introverted;
    const weight = 4 - index; // Earlier functions have more weight
    
    if ([CognitiveFunctionName.TI, CognitiveFunctionName.TE].includes(activeFunction)) {
      scores[0] += weight;
    } else if ([CognitiveFunctionName.FI, CognitiveFunctionName.FE].includes(activeFunction)) {
      scores[1] += weight;
    }
  });
  
  if (scores[0] === 0 && scores[1] === 0) return MBTILetter.UNKNOWN;
  return scores[0] > scores[1] ? MBTILetter.T : MBTILetter.F;
};

const determineJudgingPerceiving = (functionStack: CognitiveFunction[]): MBTILetter => {
  if (functionStack.length < 2) return MBTILetter.UNKNOWN;
  
  const auxiliaryFunction = functionStack[1];
  const activeFunction = auxiliaryFunction.isExtroverted ? auxiliaryFunction.extroverted : auxiliaryFunction.introverted;
  const isJudgingFunction = [CognitiveFunctionName.TI, CognitiveFunctionName.TE, CognitiveFunctionName.FI, CognitiveFunctionName.FE].includes(activeFunction);
  
  if (functionStack[0].isExtroverted) {
    return isJudgingFunction ? MBTILetter.J : MBTILetter.P;
  } else {
    return isJudgingFunction ? MBTILetter.P : MBTILetter.J;
  }
};

const validateFunctionStack = (functionStack: CognitiveFunction[]): boolean => {
  const activeFunctions = functionStack.map(f => f.isExtroverted ? f.extroverted : f.introverted);
  return activeFunctions.length === 4 && new Set(activeFunctions).size === 4;
};

export const calculateMBTIFromStack = (functionStack: CognitiveFunction[]): string => {
  if (!validateFunctionStack(functionStack)) {
    return 'XXXX';
  }
  
  const letters = [
    determineExtroversion(functionStack),
    determineSensingIntuition(functionStack),
    determineThinkingFeeling(functionStack),
    determineJudgingPerceiving(functionStack)
  ];
  
  if (letters.includes(MBTILetter.UNKNOWN)) {
    return 'XXXX';
  }
  
  return letters.join('');
};

export const calculateMBTIFromResponses = (responses: Response[]): string => {
  if (responses.length < questions.length) return 'XXXX';
  
  const functionScores = calculateFunctionScores(responses);
  
  // Count extroverted vs introverted preferences
  const extrovertedCount = Object.values(functionScores).filter(score => score > 0).length;
  const e_i = extrovertedCount >= 2 ? MBTILetter.E : MBTILetter.I;
  
  // Determine preferences based on absolute scores
  const sensingScore = Math.abs(functionScores[CognitiveFunctionType.SENSING]);
  const intuitionScore = Math.abs(functionScores[CognitiveFunctionType.INTUITION]);
  const s_n = intuitionScore >= sensingScore ? MBTILetter.N : MBTILetter.S;
  
  const thinkingScore = Math.abs(functionScores[CognitiveFunctionType.THINKING]);
  const feelingScore = Math.abs(functionScores[CognitiveFunctionType.FEELING]);
  const t_f = thinkingScore >= feelingScore ? MBTILetter.T : MBTILetter.F;
  
  // Determine J/P based on stronger function type
  const perceivingStrength = Math.max(sensingScore, intuitionScore);
  const judgingStrength = Math.max(thinkingScore, feelingScore);
  const j_p = judgingStrength > perceivingStrength ? MBTILetter.J : MBTILetter.P;
  
  return e_i + s_n + t_f + j_p;
};

const calculateStackMatchScore = (candidateStack: string[], currentStack: string[]): number => {
  let score = 0;
  
  // Weight matches by position importance
  const positionWeights = [
    SCORING_WEIGHTS.DOMINANT_MATCH,   // Dominant function
    SCORING_WEIGHTS.AUXILIARY_MATCH,  // Auxiliary function  
    SCORING_WEIGHTS.TERTIARY_MATCH,   // Tertiary function
    SCORING_WEIGHTS.INFERIOR_MATCH    // Inferior function
  ];
  
  candidateStack.forEach((func, index) => {
    if (index < currentStack.length && func === currentStack[index]) {
      score += positionWeights[index] || 0;
    }
  });
  
  return score;
};

const calculateResponseMatchScore = (typeStack: string[], functionScores: FunctionScores): number => {
  let score = 0;
  
  Object.entries(functionScores).forEach(([functionType, functionScore]) => {
    const functionPair = FUNCTION_PAIRS[functionType as CognitiveFunctionType];
    const hasExtroverted = typeStack.includes(functionPair.extroverted);
    const hasIntroverted = typeStack.includes(functionPair.introverted);
    
    if (functionScore > 0 && hasExtroverted) {
      score += Math.abs(functionScore) * SCORING_WEIGHTS.FUNCTION_PREFERENCE_MULTIPLIER;
    } else if (functionScore < 0 && hasIntroverted) {
      score += Math.abs(functionScore) * SCORING_WEIGHTS.FUNCTION_PREFERENCE_MULTIPLIER;
    }
  });
  
  return score;
};

const getMatchDescription = (score: number): string => {
  if (score >= MATCH_THRESHOLDS.EXCELLENT) return 'Excellent match';
  if (score >= MATCH_THRESHOLDS.VERY_GOOD) return 'Very good match';
  if (score >= MATCH_THRESHOLDS.GOOD) return 'Good match';
  if (score >= MATCH_THRESHOLDS.PARTIAL) return 'Partial match';
  return 'Weak match';
};

export const calculateClosestTypes = (
  functionStack: CognitiveFunction[], 
  responses: Response[], 
  isComplete: boolean
): TypeResult[] => {
  const currentType = isComplete ? calculateMBTIFromStack(functionStack) : calculateMBTIFromResponses(responses);
  const currentStack = functionStack.map(f => f.isExtroverted ? f.extroverted : f.introverted);
  const functionScores = calculateEnhancedFunctionScores(responses); // Use enhanced scoring
  
  const typeMatchScores = Object.entries(mbtiTypes).map(([type, typeInfo]) => {
    let score = 0;
    
    // Add stack matching score
    score += calculateStackMatchScore(typeInfo.functions, currentStack);
    
    // Add bonus for exact calculated type match
    if (type === currentType) {
      score += SCORING_WEIGHTS.EXACT_TYPE_BONUS;
    }
    
    // Add response preference matching score
    score += calculateResponseMatchScore(typeInfo.functions, functionScores);
    
    return { 
      type: type as MBTIType, 
      score, 
      match: getMatchDescription(score) 
    };
  });
  
  return typeMatchScores.sort((a, b) => b.score - a.score).slice(0, 3);
};

const createDefaultFunctionStack = (): CognitiveFunction[] => [
  { introverted: CognitiveFunctionName.NI, extroverted: CognitiveFunctionName.NE, isExtroverted: false, isAnimating: false },
  { introverted: CognitiveFunctionName.SI, extroverted: CognitiveFunctionName.SE, isExtroverted: true, isAnimating: false },
  { introverted: CognitiveFunctionName.TI, extroverted: CognitiveFunctionName.TE, isExtroverted: false, isAnimating: false },
  { introverted: CognitiveFunctionName.FI, extroverted: CognitiveFunctionName.FE, isExtroverted: true, isAnimating: false },
];

const getFunctionTypeIndex = (functionType: CognitiveFunctionType): number => {
  const mapping: Record<CognitiveFunctionType, number> = {
    [CognitiveFunctionType.INTUITION]: 0,
    [CognitiveFunctionType.SENSING]: 1, 
    [CognitiveFunctionType.THINKING]: 2,
    [CognitiveFunctionType.FEELING]: 3
  };
  return mapping[functionType];
};

const calculateFunctionStrengths = (functionScores: FunctionScores) => {
  return Object.entries(functionScores)
    .map(([type, score]) => ({
      type: type as CognitiveFunctionType,
      strength: Math.abs(score),
      index: getFunctionTypeIndex(type as CognitiveFunctionType)
    }))
    .sort((a, b) => b.strength - a.strength);
};

export const calculateFunctionStackFromResponses = (responses: Response[]): CognitiveFunction[] => {
  const enhancedScores = calculateEnhancedFunctionScores(responses);
  const functionStack = createDefaultFunctionStack();
  
  // Set function orientations based on enhanced responses
  functionStack[0].isExtroverted = enhancedScores[CognitiveFunctionType.INTUITION] > 0; // Ni vs Ne
  functionStack[1].isExtroverted = enhancedScores[CognitiveFunctionType.SENSING] > 0; // Si vs Se  
  functionStack[2].isExtroverted = enhancedScores[CognitiveFunctionType.THINKING] > 0; // Ti vs Te
  functionStack[3].isExtroverted = enhancedScores[CognitiveFunctionType.FEELING] > 0; // Fi vs Fe
  
  // Use MBTI-theory based ordering instead of simple strength ordering
  return orderFunctionsByMBTIRules(functionStack, enhancedScores);
};

// More sophisticated function stack ordering based on MBTI theory
const orderFunctionsByMBTIRules = (functionStack: CognitiveFunction[], functionScores: FunctionScores): CognitiveFunction[] => {
  // Calculate function strengths to determine dominance
  const functionStrengths = calculateFunctionStrengths(functionScores);
  
  // The strongest function becomes dominant
  const dominantIndex = functionStrengths[0].index;
  const dominantFunction = functionStack[dominantIndex];
  
  // For auxiliary function, we need opposite attitude and different type (perceiving vs judging)
  const isDominantPerceiving = dominantIndex === 0 || dominantIndex === 1; // Intuition or Sensing
  
  // Find auxiliary: opposite attitude from dominant, different category (P vs J)
  const auxiliaryOptions = functionStack.filter((func, index) => {
    if (index === dominantIndex) return false;
    
    const isPerceiving = index === 0 || index === 1; // Intuition or Sensing
    const hasOppositeAttitude = func.isExtroverted !== dominantFunction.isExtroverted;
    const isDifferentCategory = isPerceiving !== isDominantPerceiving;
    
    return hasOppositeAttitude && isDifferentCategory;
  });
  
  // Pick the strongest auxiliary option
  const auxiliaryFunction = auxiliaryOptions.length > 0 ? auxiliaryOptions[0] : functionStack.find((f, i) => i !== dominantIndex);
  
  // For tertiary, same category as auxiliary but same attitude as dominant  
  const tertiaryOptions = functionStack.filter((func, index) => {
    if (index === dominantIndex || func === auxiliaryFunction) return false;
    
    const isPerceiving = index === 0 || index === 1; // Intuition or Sensing
    const auxIsPerceiving = functionStack.indexOf(auxiliaryFunction!) === 0 || functionStack.indexOf(auxiliaryFunction!) === 1;
    const hasSameAttitudeAsDominant = func.isExtroverted === dominantFunction.isExtroverted;
    const isSameCategoryAsAux = isPerceiving === auxIsPerceiving;
    
    return hasSameAttitudeAsDominant && isSameCategoryAsAux;
  });
  
  const tertiaryFunction = tertiaryOptions.length > 0 ? tertiaryOptions[0] : functionStack.find((f, i) => i !== dominantIndex && f !== auxiliaryFunction);
  
  // Inferior is what's left
  const inferiorFunction = functionStack.find(f => f !== dominantFunction && f !== auxiliaryFunction && f !== tertiaryFunction);
  
  return [
    dominantFunction,
    auxiliaryFunction!,
    tertiaryFunction!,
    inferiorFunction!
  ].filter(Boolean) as CognitiveFunction[];
};

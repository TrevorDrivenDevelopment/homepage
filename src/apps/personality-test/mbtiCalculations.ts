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

const getFunctionTypeIndex = (functionType: CognitiveFunctionType): number => {
  const mapping: Record<CognitiveFunctionType, number> = {
    [CognitiveFunctionType.INTUITION]: 0,
    [CognitiveFunctionType.SENSING]: 1, 
    [CognitiveFunctionType.THINKING]: 2,
    [CognitiveFunctionType.FEELING]: 3
  };
  return mapping[functionType];
};

export const calculateFunctionStackFromResponses = (responses: Response[]): CognitiveFunction[] => {
  const enhancedScores = calculateEnhancedFunctionScores(responses);
  
  // Calculate function data with scores and orientations
  const functionData = Object.entries(enhancedScores).map(([type, score]) => ({
    type: type as CognitiveFunctionType,
    score,
    strength: Math.abs(score),
    isExtroverted: score > 0,
    index: getFunctionTypeIndex(type as CognitiveFunctionType)
  })).sort((a, b) => b.strength - a.strength);

  // Apply MBTI theory-based function stack construction
  return buildMBTIFunctionStack(functionData);
};

const buildMBTIFunctionStack = (functionData: Array<{
  type: CognitiveFunctionType;
  score: number;
  strength: number;
  isExtroverted: boolean;
  index: number;
}>): CognitiveFunction[] => {
  
  // 1. Find dominant function (strongest preference)
  const dominantData = functionData[0];
  const dominantFunction = createCognitiveFunction(dominantData);
  
  // 2. Find auxiliary function (opposite attitude, different category)
  const isDominantPerceiving = dominantData.type === CognitiveFunctionType.INTUITION || 
                              dominantData.type === CognitiveFunctionType.SENSING;
  
  const auxiliaryData = functionData.find(data => {
    const isPerceiving = data.type === CognitiveFunctionType.INTUITION || 
                        data.type === CognitiveFunctionType.SENSING;
    return data.type !== dominantData.type && 
           data.isExtroverted !== dominantData.isExtroverted && 
           isPerceiving !== isDominantPerceiving;
  });
  
  // 3. Find tertiary function (same attitude as dominant, different category from auxiliary)
  const tertiaryData = functionData.find(data => {
    if (!auxiliaryData || data.type === dominantData.type || data.type === auxiliaryData.type) {
      return false;
    }
    const auxIsPerceiving = auxiliaryData.type === CognitiveFunctionType.INTUITION || 
                           auxiliaryData.type === CognitiveFunctionType.SENSING;
    const isPerceiving = data.type === CognitiveFunctionType.INTUITION || 
                        data.type === CognitiveFunctionType.SENSING;
    return data.isExtroverted === dominantData.isExtroverted && 
           isPerceiving !== auxIsPerceiving;
  });
  
  // 4. Find inferior function (what's left, opposite attitude from dominant)
  const usedTypes = [dominantData.type, auxiliaryData?.type, tertiaryData?.type].filter(Boolean);
  const inferiorData = functionData.find(data => !usedTypes.includes(data.type));
  
  // Create the function stack
  const functionStack = [dominantFunction];
  
  if (auxiliaryData) {
    // Ensure auxiliary has opposite attitude from dominant
    const auxiliaryFunction = createCognitiveFunction({
      ...auxiliaryData,
      isExtroverted: !dominantData.isExtroverted
    });
    functionStack.push(auxiliaryFunction);
  }
  
  if (tertiaryData && functionStack.length === 2) {
    // Tertiary has same attitude as dominant  
    const tertiaryFunction = createCognitiveFunction({
      ...tertiaryData,
      isExtroverted: dominantData.isExtroverted
    });
    functionStack.push(tertiaryFunction);
  }
  
  if (inferiorData && functionStack.length === 3) {
    // Inferior has opposite attitude from dominant (same as auxiliary)
    const inferiorFunction = createCognitiveFunction({
      ...inferiorData,
      isExtroverted: !dominantData.isExtroverted
    });
    functionStack.push(inferiorFunction);
  }
  
  // Fill any missing functions with defaults if needed
  return fillMissingFunctions(functionStack, functionData);
};

const createCognitiveFunction = (data: {
  type: CognitiveFunctionType;
  isExtroverted: boolean;
}): CognitiveFunction => ({
  introverted: FUNCTION_PAIRS[data.type].introverted,
  extroverted: FUNCTION_PAIRS[data.type].extroverted,
  isExtroverted: data.isExtroverted,
  isAnimating: false
});

const fillMissingFunctions = (
  functionStack: CognitiveFunction[], 
  functionData: Array<{ type: CognitiveFunctionType; isExtroverted: boolean }>
): CognitiveFunction[] => {
  if (functionStack.length >= 4) return functionStack;
  
  const usedTypes = functionStack.map(f => {
    return Object.keys(FUNCTION_PAIRS).find(key => {
      const pair = FUNCTION_PAIRS[key as CognitiveFunctionType];
      return (f.isExtroverted && pair.extroverted === f.extroverted) ||
             (!f.isExtroverted && pair.introverted === f.introverted);
    }) as CognitiveFunctionType;
  });
  
  const allTypes = [
    CognitiveFunctionType.INTUITION, 
    CognitiveFunctionType.SENSING, 
    CognitiveFunctionType.THINKING, 
    CognitiveFunctionType.FEELING
  ];
  
  const missingTypes = allTypes.filter(type => !usedTypes.includes(type));
  
  for (const missingType of missingTypes) {
    if (functionStack.length >= 4) break;
    
    const missingData = functionData.find(d => d.type === missingType);
    
    // Apply attitude alternation rule (alternating E/I pattern)
    const shouldBeExtroverted = functionStack.length % 2 === 1 ? 
                               !functionStack[0].isExtroverted : 
                               functionStack[0].isExtroverted;
    
    // Use original preference if available, otherwise use calculated pattern
    const isExtroverted = missingData ? missingData.isExtroverted : shouldBeExtroverted;
    
    functionStack.push(createCognitiveFunction({
      type: missingType,
      isExtroverted
    }));
  }
  
  return functionStack;
};

import { Response, CognitiveFunction, FunctionScores, TypeResult } from './types/mbti';
import { questions, mbtiTypes } from './data/mbtiData';

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

export const calculateFunctionScores = (responses: Response[]): FunctionScores => {
  const functionScores: FunctionScores = { 'Ni/Ne': 0, 'Si/Se': 0, 'Ti/Te': 0, 'Fi/Fe': 0 };
  
  responses.forEach(response => {
    const question = questions.find(q => q.id === response.questionId);
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
  const functionScores: FunctionScores = { 'Ni/Ne': 0, 'Si/Se': 0, 'Ti/Te': 0, 'Fi/Fe': 0 };
  
  responses.forEach(response => {
    const question = questions.find(q => q.id === response.questionId);
    if (!question || response.value === null) return;
    
    // Weight function-order questions more heavily for determining dominance
    const weight = question.category === 'function-order' ? 2 : 1;
    
    if (response.value) {
      functionScores[question.functionType] += weight; // Extroverted version
    } else {
      functionScores[question.functionType] -= weight; // Introverted version
    }
  });
  
  return functionScores;
};

// Helper functions for type determination
const determineExtraversion = (functionStack: CognitiveFunction[]): string => {
  return functionStack[0].isExtroverted ? 'E' : 'I';
};

const determineSensingIntuition = (functionStack: CognitiveFunction[]): string => {
  const intuitionIndex = functionStack.findIndex(f => 
    (f.introverted === 'Ni' && !f.isExtroverted) || 
    (f.extroverted === 'Ne' && f.isExtroverted)
  );
  const sensingIndex = functionStack.findIndex(f => 
    (f.introverted === 'Si' && !f.isExtroverted) || 
    (f.extroverted === 'Se' && f.isExtroverted)
  );
  
  if (intuitionIndex === -1 && sensingIndex === -1) return 'X';
  if (intuitionIndex === -1) return 'S';
  if (sensingIndex === -1) return 'N';
  return intuitionIndex < sensingIndex ? 'N' : 'S';
};

const determineThinkingFeeling = (functionStack: CognitiveFunction[]): string => {
  const thinkingIndex = functionStack.findIndex(f => 
    (f.introverted === 'Ti' && !f.isExtroverted) || 
    (f.extroverted === 'Te' && f.isExtroverted)
  );
  const feelingIndex = functionStack.findIndex(f => 
    (f.introverted === 'Fi' && !f.isExtroverted) || 
    (f.extroverted === 'Fe' && f.isExtroverted)
  );
  
  if (thinkingIndex === -1 && feelingIndex === -1) return 'X';
  if (thinkingIndex === -1) return 'F';
  if (feelingIndex === -1) return 'T';
  return thinkingIndex < feelingIndex ? 'T' : 'F';
};

const determineJudgingPerceiving = (functionStack: CognitiveFunction[]): string => {
  if (functionStack.length < 2) return 'X';
  
  const auxiliaryFunction = functionStack[1];
  const isJudgingFunction = ['Ti', 'Te', 'Fi', 'Fe'].includes(auxiliaryFunction.introverted);
  
  if (functionStack[0].isExtroverted) {
    return isJudgingFunction ? 'J' : 'P';
  } else {
    return isJudgingFunction ? 'P' : 'J';
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
  
  const e_i = determineExtraversion(functionStack);
  const s_n = determineSensingIntuition(functionStack);
  const t_f = determineThinkingFeeling(functionStack);
  const j_p = determineJudgingPerceiving(functionStack);
  
  if ([e_i, s_n, t_f, j_p].includes('X')) {
    return 'XXXX';
  }
  
  return e_i + s_n + t_f + j_p;
};

export const calculateMBTIFromResponses = (responses: Response[]): string => {
  if (responses.length < questions.length) return 'XXXX';
  
  const functionScores = calculateFunctionScores(responses);
  
  // Count extroverted vs introverted preferences
  const extrovertedCount = Object.values(functionScores).filter(score => score > 0).length;
  const e_i = extrovertedCount >= 2 ? 'E' : 'I';
  
  // Determine preferences based on absolute scores
  const sensingScore = Math.abs(functionScores['Si/Se']);
  const intuitionScore = Math.abs(functionScores['Ni/Ne']);
  const s_n = intuitionScore >= sensingScore ? 'N' : 'S';
  
  const thinkingScore = Math.abs(functionScores['Ti/Te']);
  const feelingScore = Math.abs(functionScores['Fi/Fe']);
  const t_f = thinkingScore >= feelingScore ? 'T' : 'F';
  
  // Determine J/P based on stronger function type
  const perceivingStrength = Math.max(sensingScore, intuitionScore);
  const judgingStrength = Math.max(thinkingScore, feelingScore);
  const j_p = judgingStrength > perceivingStrength ? 'J' : 'P';
  
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
    const [introverted, extroverted] = functionType.split('/');
    const hasExtroverted = typeStack.includes(extroverted);
    const hasIntroverted = typeStack.includes(introverted);
    
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
  responses: Response[]
): TypeResult[] => {
  const currentStack = functionStack.map(f => f.isExtroverted ? f.extroverted : f.introverted);
  const functionScores = calculateEnhancedFunctionScores(responses); // Use enhanced scoring
  
  const typeMatchScores = Object.entries(mbtiTypes).map(([type, typeInfo]) => {
    let score = 0;
    
    // Add stack matching score
    score += calculateStackMatchScore(typeInfo.functions, currentStack);
    
    // Add response preference matching score
    score += calculateResponseMatchScore(typeInfo.functions, functionScores);
    
    return { 
      type, 
      score, 
      match: getMatchDescription(score) 
    };
  });
  
  return typeMatchScores.sort((a, b) => b.score - a.score).slice(0, 3);
};

const createDefaultFunctionStack = (): CognitiveFunction[] => [
  { introverted: 'Ni', extroverted: 'Ne', isExtroverted: false, isAnimating: false },
  { introverted: 'Si', extroverted: 'Se', isExtroverted: true, isAnimating: false },
  { introverted: 'Ti', extroverted: 'Te', isExtroverted: false, isAnimating: false },
  { introverted: 'Fi', extroverted: 'Fe', isExtroverted: true, isAnimating: false },
];

const getFunctionTypeIndex = (functionType: string): number => {
  const mapping: Record<string, number> = {
    'Ni/Ne': 0,
    'Si/Se': 1, 
    'Ti/Te': 2,
    'Fi/Fe': 3
  };
  return mapping[functionType];
};

const calculateFunctionStrengths = (functionScores: FunctionScores) => {
  return Object.entries(functionScores)
    .map(([type, score]) => ({
      type,
      strength: Math.abs(score),
      index: getFunctionTypeIndex(type)
    }))
    .sort((a, b) => b.strength - a.strength);
};

export const calculateFunctionStackFromResponses = (responses: Response[]): CognitiveFunction[] => {
  const enhancedScores = calculateEnhancedFunctionScores(responses);
  const functionStack = createDefaultFunctionStack();
  
  // Set function orientations based on enhanced responses
  functionStack[0].isExtroverted = enhancedScores['Ni/Ne'] > 0; // Ni vs Ne
  functionStack[1].isExtroverted = enhancedScores['Si/Se'] > 0; // Si vs Se  
  functionStack[2].isExtroverted = enhancedScores['Ti/Te'] > 0; // Ti vs Te
  functionStack[3].isExtroverted = enhancedScores['Fi/Fe'] > 0; // Fi vs Fe
  
  // Use MBTI-theory based ordering instead of simple strength ordering
  return orderFunctionsByMBTIRules(functionStack, enhancedScores);
};

// More sophisticated function stack ordering based on MBTI theory
const orderFunctionsByMBTIRules = (functionStack: CognitiveFunction[], functionScores: FunctionScores): CognitiveFunction[] => {
  // Calculate which functions are strongest
  const functionStrengths = calculateFunctionStrengths(functionScores);
  
  // Get the strongest function as dominant
  const dominantFunction = functionStack[functionStrengths[0].index];
  
  // Find auxiliary function (opposite attitude from dominant, different type)
  const remainingFunctions = functionStack.filter((_, i) => i !== functionStrengths[0].index);
  
  // Auxiliary should be opposite attitude and different category (perceiving vs judging)
  const isDominantPerceiving = ['Ni', 'Ne', 'Si', 'Se'].includes(
    dominantFunction.isExtroverted ? dominantFunction.extroverted : dominantFunction.introverted
  );
  
  const auxiliaryFunction = remainingFunctions.find(func => {
    const funcName = func.isExtroverted ? func.extroverted : func.introverted;
    const isPerceiving = ['Ni', 'Ne', 'Si', 'Se'].includes(funcName);
    
    // Auxiliary should be opposite type (perceiving vs judging) and opposite attitude
    return isPerceiving !== isDominantPerceiving && 
           func.isExtroverted !== dominantFunction.isExtroverted;
  });
  
  if (!auxiliaryFunction) {
    // Fallback to strength-based ordering if no valid auxiliary found
    return functionStrengths.map(({ index }) => functionStack[index]);
  }
  
  // Build the complete stack following MBTI patterns
  const remainingAfterAux = functionStack.filter(f => 
    f !== dominantFunction && f !== auxiliaryFunction
  );
  
  // Tertiary is opposite attitude from auxiliary, same type as auxiliary
  const auxFuncName = auxiliaryFunction.isExtroverted ? auxiliaryFunction.extroverted : auxiliaryFunction.introverted;
  const tertiaryFunction = remainingAfterAux.find(func => {
    const funcName = func.isExtroverted ? func.extroverted : func.introverted;
    const isSameType = (['Ni', 'Ne', 'Si', 'Se'].includes(funcName)) === 
                      (['Ni', 'Ne', 'Si', 'Se'].includes(auxFuncName));
    return isSameType && func.isExtroverted === dominantFunction.isExtroverted;
  });
  
  // Inferior is what's left
  const inferiorFunction = remainingAfterAux.find(f => f !== tertiaryFunction);
  
  return [
    dominantFunction,
    auxiliaryFunction,
    tertiaryFunction || remainingAfterAux[0],
    inferiorFunction || remainingAfterAux[1]
  ];
};

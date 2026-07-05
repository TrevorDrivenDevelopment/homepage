import { Response, CognitiveFunction, FunctionScores, TypeResult, Question } from './types/mbti';
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

// Helper: get effective Likert score accounting for reversed items
const getEffectiveScore = (response: Response, question: Question): number => {
  // Positive = extroverted preference, Negative = introverted preference
  return question.reversed ? -response.value : response.value;
};

// Helper: filter to only cognitive function questions (skip attention checks)
const getCognitiveFunctionQuestions = () => 
  questions.filter(q => q.category !== 'attention-check' && q.functionType);

export const calculateFunctionScores = (responses: Response[]): FunctionScores => {
  const functionScores: FunctionScores = { 'Ni/Ne': 0, 'Si/Se': 0, 'Ti/Te': 0, 'Fi/Fe': 0 };
  
  responses.forEach(response => {
    const question = questions.find(q => q.id === response.questionId);
    if (!question || !question.functionType || question.category === 'attention-check') return;
    
    const effectiveScore = getEffectiveScore(response, question);
    functionScores[question.functionType] += effectiveScore;
  });
  
  return functionScores;
};

// Enhanced function scoring — all cognitive function questions weighted equally.
// Previously order questions had inflated weight, but this caused well-developed
// auxiliary functions to outscore the true dominant. E/I disambiguation is now
// handled separately via direct E/I orientation questions.
export const calculateEnhancedFunctionScores = (responses: Response[]): FunctionScores => {
  const functionScores: FunctionScores = { 'Ni/Ne': 0, 'Si/Se': 0, 'Ti/Te': 0, 'Fi/Fe': 0 };
  
  responses.forEach(response => {
    const question = questions.find(q => q.id === response.questionId);
    if (!question || !question.functionType || question.category === 'attention-check') return;
    
    const effectiveScore = getEffectiveScore(response, question);
    functionScores[question.functionType] += effectiveScore;
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
  
  // J/P reflects the category (Judging vs Perceiving) of whichever function
  // is extraverted. For E types the dominant is extraverted, so J/P follows
  // the dominant's category (opposite of the auxiliary's category). For I
  // types the auxiliary is extraverted, so J/P follows the auxiliary's
  // category directly.
  if (functionStack[0].isExtroverted) {
    return isJudgingFunction ? 'P' : 'J';
  } else {
    return isJudgingFunction ? 'J' : 'P';
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
  // Use the stack-based approach which is theoretically correct
  // E/I is determined by the attitude of the dominant function, not a majority vote
  const stack = calculateFunctionStackFromResponses(responses);
  return calculateMBTIFromStack(stack);
};

// ===== Consistency & Confidence Utilities =====

export interface DimensionConfidence {
  dimension: string;
  score: number;
  maxPossible: number;
  clarity: number; // 0-100%
  label: string;
  answeredCount: number;
  sufficient: boolean;
}

export const calculateDimensionConfidence = (responses: Response[]): DimensionConfidence[] => {
  const cogQuestions = getCognitiveFunctionQuestions();
  const dimensions: Array<'Ni/Ne' | 'Si/Se' | 'Ti/Te' | 'Fi/Fe'> = ['Ni/Ne', 'Si/Se', 'Ti/Te', 'Fi/Fe'];
  const enhancedScores = calculateEnhancedFunctionScores(responses);
  
  return dimensions.map(dim => {
    const dimQuestions = cogQuestions.filter(q => q.functionType === dim);
    const answeredCount = dimQuestions.filter(q => responses.some(r => r.questionId === q.id)).length;
    
    // Max possible score: sum of (weight * 2) for all questions in this dimension
    const maxPossible = dimQuestions.reduce((sum, _q) => {
      return sum + 2; // max Likert = 2 per question, all weighted equally
    }, 0);
    
    const score = enhancedScores[dim];
    const clarity = maxPossible > 0 ? Math.round((Math.abs(score) / maxPossible) * 100) : 0;
    
    let label: string;
    if (clarity >= 60) label = 'Very clear';
    else if (clarity >= 35) label = 'Clear';
    else if (clarity >= 15) label = 'Slight';
    else label = 'Undifferentiated';
    
    const sufficient = answeredCount >= 5 && clarity >= 20;
    
    return { dimension: dim, score, maxPossible, clarity, label, answeredCount, sufficient };
  });
};

export const isTestConfidenceSufficient = (responses: Response[]): boolean => {
  const confidence = calculateDimensionConfidence(responses);
  return confidence.every(d => d.sufficient);
};

export interface ConsistencyResult {
  pairId: string;
  questionIds: string[];
  isConsistent: boolean;
  deviation: number; // 0 = perfectly consistent, higher = worse
}

export const calculateConsistency = (responses: Response[]): { results: ConsistencyResult[]; overallScore: number } => {
  // Find all consistency pairs
  const pairMap = new Map<string, Question[]>();
  for (const q of questions) {
    if (q.consistencyPairId) {
      const existing = pairMap.get(q.consistencyPairId) || [];
      existing.push(q);
      pairMap.set(q.consistencyPairId, existing);
    }
  }
  
  const results: ConsistencyResult[] = [];
  
  for (const [pairId, pairedQuestions] of pairMap) {
    if (pairedQuestions.length < 2) continue;
    
    const answeredPair = pairedQuestions.filter(q => responses.some(r => r.questionId === q.id));
    if (answeredPair.length < 2) continue;
    
    // Compare effective scores of paired questions (they should agree in direction)
    const scores = answeredPair.map(q => {
      const resp = responses.find(r => r.questionId === q.id)!;
      return getEffectiveScore(resp, q);
    });
    
    // Check if they agree in direction (both positive or both negative)
    const allSameDirection = scores.every(s => s >= 0) || scores.every(s => s <= 0);
    const maxDeviation = Math.max(...scores) - Math.min(...scores);
    
    results.push({
      pairId,
      questionIds: answeredPair.map(q => q.id),
      isConsistent: allSameDirection,
      deviation: maxDeviation
    });
  }
  
  const overallScore = results.length > 0 
    ? Math.round((results.filter(r => r.isConsistent).length / results.length) * 100)
    : 100;
  
  return { results, overallScore };
};

// ===== E/I Orientation =====

export interface EIOrientation {
  score: number;      // negative = introverted, positive = extroverted
  label: 'Introvert' | 'Extrovert' | 'Undetermined';
  answeredCount: number;
  confidence: number; // 0-100
}

export const calculateEIOrientation = (responses: Response[]): EIOrientation => {
  const eiQuestions = questions.filter(q => q.category === 'ei-orientation');
  let score = 0;
  let answeredCount = 0;
  
  for (const q of eiQuestions) {
    const resp = responses.find(r => r.questionId === q.id);
    if (!resp) continue;
    answeredCount++;
    score += getEffectiveScore(resp, q);
  }
  
  const maxPossible = answeredCount * 2; // each question contributes up to ±2
  const confidence = maxPossible > 0 ? Math.round((Math.abs(score) / maxPossible) * 100) : 0;
  
  let label: 'Introvert' | 'Extrovert' | 'Undetermined';
  if (answeredCount === 0 || confidence < 15) {
    label = 'Undetermined';
  } else {
    label = score > 0 ? 'Extrovert' : 'Introvert';
  }
  
  return { score, label, answeredCount, confidence };
};

export const checkAttentionCheck = (responses: Response[]): { passed: boolean; checked: boolean } => {
  const attentionQuestions = questions.filter(q => q.category === 'attention-check');
  const answered = attentionQuestions.filter(q => responses.some(r => r.questionId === q.id));
  
  if (answered.length === 0) return { passed: true, checked: false };
  
  const allPassed = answered.every(q => {
    const resp = responses.find(r => r.questionId === q.id);
    return resp && resp.value === q.attentionCheckExpectedValue;
  });
  
  return { passed: allPassed, checked: true };
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
  const eiOrientation = calculateEIOrientation(responses);
  const functionStack = createDefaultFunctionStack();
  
  // Set function orientations based on enhanced responses
  functionStack[0].isExtroverted = enhancedScores['Ni/Ne'] > 0; // Ni vs Ne
  functionStack[1].isExtroverted = enhancedScores['Si/Se'] > 0; // Si vs Se  
  functionStack[2].isExtroverted = enhancedScores['Ti/Te'] > 0; // Ti vs Te
  functionStack[3].isExtroverted = enhancedScores['Fi/Fe'] > 0; // Fi vs Fe
  
  // Use MBTI-theory based ordering with E/I disambiguation
  return orderFunctionsByMBTIRules(functionStack, enhancedScores, eiOrientation);
};

// More sophisticated function stack ordering based on MBTI theory
// Uses E/I orientation from direct questions to disambiguate when the top two
// functions form a valid dom/aux pair but the score-based dominant has the
// wrong attitude (e.g. INTP scoring higher on Ne than Ti).
const orderFunctionsByMBTIRules = (
  functionStack: CognitiveFunction[], 
  functionScores: FunctionScores,
  eiOrientation?: EIOrientation
): CognitiveFunction[] => {
  // Calculate which functions are strongest
  const functionStrengths = calculateFunctionStrengths(functionScores);
  
  // E/I disambiguation: when the top-scoring function's attitude conflicts
  // with direct E/I orientation answers, check if swapping the top two
  // functions would produce a valid dom/aux pair with the correct attitude.
  if (eiOrientation && eiOrientation.label !== 'Undetermined' && functionStrengths.length >= 2) {
    const topFunc = functionStack[functionStrengths[0].index];
    const topIsExtroverted = topFunc.isExtroverted;
    const eiSaysExtroverted = eiOrientation.label === 'Extrovert';
    
    // Conflict: E/I orientation disagrees with the dominant function's attitude
    if (topIsExtroverted !== eiSaysExtroverted) {
      const secondFunc = functionStack[functionStrengths[1].index];
      
      // Check if the second function has the correct attitude
      if (secondFunc.isExtroverted === eiSaysExtroverted) {
        // Verify they form a valid dom/aux pair (opposite perceiving/judging)
        const topName = topFunc.isExtroverted ? topFunc.extroverted : topFunc.introverted;
        const secondName = secondFunc.isExtroverted ? secondFunc.extroverted : secondFunc.introverted;
        const topIsPerceiving = ['Ni', 'Ne', 'Si', 'Se'].includes(topName);
        const secondIsPerceiving = ['Ni', 'Ne', 'Si', 'Se'].includes(secondName);
        
        if (topIsPerceiving !== secondIsPerceiving) {
          // Valid swap: second function becomes dominant with correct E/I attitude
          [functionStrengths[0], functionStrengths[1]] = [functionStrengths[1], functionStrengths[0]];
        }
      }
    }
  }
  
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
  
  // Resolve actual tertiary and inferior, ensuring no duplicates
  const actualTertiary = tertiaryFunction || remainingAfterAux[0];
  const actualInferior = remainingAfterAux.find(f => f !== actualTertiary) || remainingAfterAux[1];
  
  return [
    dominantFunction,
    auxiliaryFunction,
    actualTertiary,
    actualInferior
  ];
};

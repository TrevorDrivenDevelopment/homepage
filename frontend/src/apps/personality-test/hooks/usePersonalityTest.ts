import { createSignal, createMemo } from 'solid-js';
import { Response, CognitiveFunction, FunctionScores, TypeResult } from '../types/mbti';
import { questions } from '../data/mbtiData';
import { 
  calculateFunctionScores, 
  calculateEnhancedFunctionScores,
  calculateFunctionStackFromResponses,
  calculateClosestTypes 
} from '../mbtiCalculations';

export const usePersonalityTest = () => {
  const [responses, setResponses] = createSignal<Response[]>([]);
  const [functionStack, setFunctionStack] = createSignal<CognitiveFunction[]>([
    { introverted: 'Ni', extroverted: 'Ne', isExtroverted: false, isAnimating: false },
    { introverted: 'Si', extroverted: 'Se', isExtroverted: true, isAnimating: false },
    { introverted: 'Ti', extroverted: 'Te', isExtroverted: false, isAnimating: false },
    { introverted: 'Fi', extroverted: 'Fe', isExtroverted: true, isAnimating: false },
  ]);

  const [showEditStack, setShowEditStack] = createSignal(false);

  // Computed values
  const functionScores = createMemo<FunctionScores>(() => calculateFunctionScores(responses()));
  const enhancedFunctionScores = createMemo<FunctionScores>(() => calculateEnhancedFunctionScores(responses()));
  
  const calculatedStack = createMemo<CognitiveFunction[]>(() => {
    const resp = responses();
    if (resp.length === 0) return functionStack();
    return calculateFunctionStackFromResponses(resp);
  });

  const closestTypes = createMemo<TypeResult[]>(() => {
    const stack = showEditStack() ? functionStack() : calculatedStack();
    const resp = responses();
    return calculateClosestTypes(stack, resp);
  });

  const currentType = createMemo<string>(() => {
    const types = closestTypes();
    return types.length > 0 ? types[0].type : 'XXXX';
  });

  const isTestComplete = createMemo(() => {
    const resp = responses();
    return resp.length === questions.length && resp.every(r => r.value !== null);
  });

  const progressPercentage = createMemo(() => {
    const answeredCount = responses().filter(r => r.value !== null).length;
    return Math.round((answeredCount / questions.length) * 100);
  });

  // Actions
  const updateResponse = (questionId: string, value: boolean | null) => {
    setResponses(prev => {
      const existing = prev.find(r => r.questionId === questionId);
      if (existing) {
        return prev.map(r => r.questionId === questionId ? { ...r, value } : r);
      } else {
        return [...prev, { questionId, value }];
      }
    });
  };

  const updateFunctionStack = (newStack: CognitiveFunction[]) => {
    setFunctionStack(newStack);
  };

  const resetTest = () => {
    setResponses([]);
    setFunctionStack([
      { introverted: 'Ni', extroverted: 'Ne', isExtroverted: false, isAnimating: false },
      { introverted: 'Si', extroverted: 'Se', isExtroverted: true, isAnimating: false },
      { introverted: 'Ti', extroverted: 'Te', isExtroverted: false, isAnimating: false },
      { introverted: 'Fi', extroverted: 'Fe', isExtroverted: true, isAnimating: false },
    ]);
    setShowEditStack(false);
  };

  const toggleEditStack = () => {
    setShowEditStack(prev => !prev);
  };

  return {
    // State
    responses,
    functionStack,
    showEditStack,
    
    // Computed
    functionScores,
    enhancedFunctionScores,
    calculatedStack,
    currentType,
    closestTypes,
    isTestComplete,
    progressPercentage,
    
    // Actions
    updateResponse,
    updateFunctionStack,
    resetTest,
    toggleEditStack,
    
    // Data
    questions
  };
};

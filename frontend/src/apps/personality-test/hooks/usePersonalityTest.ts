import { createSignal, createMemo } from 'solid-js';
import { Response, CognitiveFunction, FunctionScores, TypeResult, Question } from '../types/mbti';
import { questions, QUESTION_SCHEMA_VERSION } from '../data/mbtiData';
import { 
  calculateFunctionScores, 
  calculateEnhancedFunctionScores,
  calculateFunctionStackFromResponses,
  calculateClosestTypes,
  calculateDimensionConfidence,
  isTestConfidenceSufficient,
  calculateConsistency,
  checkAttentionCheck,
  calculateEIOrientation,
  DimensionConfidence,
  ConsistencyResult,
  EIOrientation
} from '../mbtiCalculations';

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Order questions adaptively: E/I orientation + tier 1 first (shuffled), then tier 2 (shuffled), then tier 3 (shuffled)
// E/I orientation questions are placed at the start (tier 1) since they're critical for disambiguation.
// Attention checks are interspersed in tier 2.
const createAdaptiveQuestionOrder = (): Question[] => {
  const eiQuestions = shuffleArray(questions.filter(q => q.category === 'ei-orientation'));
  const tier1 = shuffleArray(questions.filter(q => q.discriminationTier === 1 && q.category !== 'ei-orientation'));
  const tier2Regular = shuffleArray(questions.filter(q => q.discriminationTier === 2 && q.category !== 'attention-check'));
  const tier3 = shuffleArray(questions.filter(q => q.discriminationTier === 3));
  const attentionChecks = questions.filter(q => q.category === 'attention-check');
  
  // Intersperse attention checks in tier 2
  const tier2WithAttention = [...tier2Regular];
  if (attentionChecks.length > 0 && tier2WithAttention.length > 2) {
    const insertPos = Math.floor(tier2WithAttention.length / 2);
    tier2WithAttention.splice(insertPos, 0, ...attentionChecks);
  } else {
    tier2WithAttention.push(...attentionChecks);
  }
  
  // Any questions without a tier (fallback)
  const untiered = shuffleArray(questions.filter(q => !q.discriminationTier && q.category !== 'attention-check'));
  
  return [...eiQuestions, ...tier1, ...tier2WithAttention, ...tier3, ...untiered];
};

export const usePersonalityTest = () => {
  const [responses, setResponses] = createSignal<Response[]>([]);
  const [functionStack, setFunctionStack] = createSignal<CognitiveFunction[]>([
    { introverted: 'Ni', extroverted: 'Ne', isExtroverted: false, isAnimating: false },
    { introverted: 'Si', extroverted: 'Se', isExtroverted: true, isAnimating: false },
    { introverted: 'Ti', extroverted: 'Te', isExtroverted: false, isAnimating: false },
    { introverted: 'Fi', extroverted: 'Fe', isExtroverted: true, isAnimating: false },
  ]);

  const [showEditStack, setShowEditStack] = createSignal(false);
  
  // Adaptive question order — shuffled within discrimination tiers
  const [orderedQuestions, setOrderedQuestions] = createSignal<Question[]>(createAdaptiveQuestionOrder());

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

  // Confidence and consistency
  const dimensionConfidence = createMemo<DimensionConfidence[]>(() => 
    calculateDimensionConfidence(responses())
  );
  
  const confidenceSufficient = createMemo<boolean>(() => 
    isTestConfidenceSufficient(responses())
  );
  
  const consistency = createMemo(() => calculateConsistency(responses()));
  
  const attentionCheck = createMemo(() => checkAttentionCheck(responses()));

  // E/I orientation
  const eiOrientation = createMemo<EIOrientation>(() => calculateEIOrientation(responses()));

  const cognitiveQuestionCount = createMemo(() => 
    orderedQuestions().filter(q => q.category !== 'attention-check' && q.category !== 'ei-orientation').length
  );

  const isTestComplete = createMemo(() => {
    const resp = responses();
    return resp.length >= cognitiveQuestionCount();
  });

  const progressPercentage = createMemo(() => {
    const answeredCount = responses().length;
    const total = orderedQuestions().length;
    return Math.round((answeredCount / total) * 100);
  });

  // Actions
  const updateResponse = (questionId: string, value: number) => {
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
    // Re-shuffle questions on reset
    setOrderedQuestions(createAdaptiveQuestionOrder());
  };

  const toggleEditStack = () => {
    setShowEditStack(prev => !prev);
  };

  const exportResults = () => {
    const ordered = orderedQuestions();
    const resp = responses();
    const exportData = {
      version: QUESTION_SCHEMA_VERSION,
      timestamp: new Date().toISOString(),
      questionOrder: ordered.map(q => q.id),
      responses: resp.map(r => {
        const q = ordered.find(oq => oq.id === r.questionId);
        return {
          questionId: r.questionId,
          questionText: q?.text ?? '',
          optionA: q?.optionA ?? '',
          optionB: q?.optionB ?? '',
          functionType: q?.functionType ?? null,
          category: q?.category ?? '',
          reversed: q?.reversed ?? false,
          value: r.value
        };
      }),
      scores: {
        basic: functionScores(),
        enhanced: enhancedFunctionScores()
      },
      calculatedStack: calculatedStack().map(f => ({
        active: f.isExtroverted ? f.extroverted : f.introverted,
        isExtroverted: f.isExtroverted
      })),
      currentType: currentType(),
      closestTypes: closestTypes(),
      dimensionConfidence: dimensionConfidence(),
      eiOrientation: eiOrientation(),
      consistency: consistency(),
      attentionCheck: attentionCheck()
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mbti-results-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importResults = (): Promise<{ imported: number; skipped: number; total: number }> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }
        
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result as string);
            
            // Validate basic structure
            if (!data.responses || !Array.isArray(data.responses)) {
              reject(new Error('Invalid file format: missing responses array'));
              return;
            }
            
            // Build a set of current question IDs for matching
            const currentQuestionIds = new Set(questions.map(q => q.id));
            
            // Filter to only responses whose questionId still exists
            const validResponses: Response[] = [];
            let skipped = 0;
            
            for (const r of data.responses) {
              if (!r.questionId || typeof r.value !== 'number') {
                skipped++;
                continue;
              }
              if (!currentQuestionIds.has(r.questionId)) {
                skipped++;
                continue;
              }
              validResponses.push({ questionId: r.questionId, value: r.value });
            }
            
            // Restore question order from export if possible
            if (data.questionOrder && Array.isArray(data.questionOrder)) {
              const exportedIds: string[] = data.questionOrder;
              const currentQMap = new Map(questions.map(q => [q.id, q]));
              
              // Reconstruct order: exported questions first (in their order), then any new questions
              const orderedFromExport: Question[] = [];
              const usedIds = new Set<string>();
              
              for (const id of exportedIds) {
                const q = currentQMap.get(id);
                if (q) {
                  orderedFromExport.push(q);
                  usedIds.add(id);
                }
              }
              
              // Append any new questions that weren't in the export
              const newQuestions = questions.filter(q => !usedIds.has(q.id));
              setOrderedQuestions([...orderedFromExport, ...newQuestions]);
            }
            
            // Set responses
            setResponses(validResponses);
            setShowEditStack(false);
            
            resolve({
              imported: validResponses.length,
              skipped,
              total: data.responses.length
            });
          } catch (e) {
            reject(new Error(`Failed to parse file: ${(e as Error).message}`));
          }
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      };
      
      // Handle cancel (no file selected)
      input.oncancel = () => reject(new Error('Import cancelled'));
      
      input.click();
    });
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
    dimensionConfidence,
    confidenceSufficient,
    consistency,
    attentionCheck,
    eiOrientation,
    
    // Actions
    updateResponse,
    updateFunctionStack,
    resetTest,
    toggleEditStack,
    exportResults,
    importResults,
    
    // Data - use adaptive ordering
    questions: orderedQuestions()
  };
};

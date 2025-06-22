import { Response, DetailedFunctionScores, QuestionType, Question, QuestionCategory } from './types';
import { IScoringStrategy, ScoringWeights } from './interfaces';
import { questions } from './mbtiData';

/**
 * Base class for scoring strategies
 */
export abstract class ScoringStrategy implements IScoringStrategy {
  protected abstract weights: ScoringWeights;
  
  abstract getName(): string;
  
  getWeights(): ScoringWeights {
    return this.weights;
  }
  
  scoreResponses(responses: Response[]): DetailedFunctionScores {
    const scores: DetailedFunctionScores = {
      Ne: 0, Ni: 0, Se: 0, Si: 0,
      Te: 0, Ti: 0, Fe: 0, Fi: 0
    };
    
    // Track traditional dichotomy scores for modifying cognitive function scores
    let extroversionScore = 0;
    let introversionScore = 0;
    let judgingScore = 0;
    let perceivingScore = 0;
    
    responses.forEach((response) => {
      if (response === null) return;
      
      const question = questions[response.questionIndex];
      const weight = this.getQuestionWeight(question.category);
      
      // Handle traditional dichotomy questions
      if (question.functionType === 'extroversion-introversion') {
        if (response.value) {
          extroversionScore += weight;
        } else {
          introversionScore += weight;
        }
        return;
      }
      
      if (question.functionType === 'judging-perceiving') {
        if (response.value) {
          judgingScore += weight;
        } else {
          perceivingScore += weight;
        }
        return;
      }
      
      // Handle cognitive function questions
      if (response.value) {
        scores[this.getExtrovertedFunction(question)] += weight;
      } else {
        scores[this.getIntrovertedFunction(question)] += weight;
      }
    });
    
    // Apply traditional dichotomy modifiers to cognitive function scores
    const extroversionBonus = extroversionScore > introversionScore ? 0.1 : 0;
    const introversionBonus = introversionScore > extroversionScore ? 0.1 : 0;
    const judgingBonus = judgingScore > perceivingScore ? 0.08 : 0;
    const perceivingBonus = perceivingScore > judgingScore ? 0.08 : 0;
    
    // Apply bonuses based on traditional preferences - more nuanced reinforcement
    // Only boost functions that align naturally with the dichotomy preferences
    
    // Extraverted Perceiving functions (Ne, Se) get P bonus
    scores.Ne = scores.Ne * (1 + extroversionBonus + perceivingBonus);
    scores.Se = scores.Se * (1 + extroversionBonus + perceivingBonus);
    
    // Extraverted Judging functions (Te, Fe) get J bonus  
    scores.Te = scores.Te * (1 + extroversionBonus + judgingBonus);
    scores.Fe = scores.Fe * (1 + extroversionBonus + judgingBonus);
    
    // Introverted functions - be more careful with bonuses to avoid misclassification
    // Ni gets J bonus, but only moderate to avoid overwhelming other functions
    scores.Ni = scores.Ni * (1 + introversionBonus + (judgingBonus * 0.7)); // Reduced J bonus for Ni
    
    // Si gets P bonus (more common in IP types like INTP, ISFP)  
    scores.Si = scores.Si * (1 + introversionBonus + perceivingBonus);
    
    // Ti and Fi get P bonus for IP types
    scores.Ti = scores.Ti * (1 + introversionBonus + perceivingBonus);
    scores.Fi = scores.Fi * (1 + introversionBonus + perceivingBonus);
    
    return scores;
  }
  
  protected getQuestionWeight(type: QuestionType): number {
    switch (type) {
      case QuestionCategory.FUNCTION_ORDER:
        return this.weights.functionOrder;
      case QuestionCategory.TRADITIONAL_DICHOTOMY:
        return this.weights.traditionalDichotomy;
      default:
        return this.weights.functionPreference;
    }
  }
  
  protected getExtrovertedFunction(question: Question): keyof DetailedFunctionScores {
    const typeMap = {
      'intuition': 'Ne',
      'sensing': 'Se',
      'thinking': 'Te',
      'feeling': 'Fe'
    };
    
    // Only return for cognitive function questions, not traditional dichotomies
    if (question.functionType in typeMap) {
      return typeMap[question.functionType as keyof typeof typeMap] as keyof DetailedFunctionScores;
    }
    
    // Default fallback for non-cognitive function questions
    return 'Ne';
  }
  
  protected getIntrovertedFunction(question: Question): keyof DetailedFunctionScores {
    const typeMap = {
      'intuition': 'Ni',
      'sensing': 'Si',
      'thinking': 'Ti',
      'feeling': 'Fi'
    };
    
    // Only return for cognitive function questions, not traditional dichotomies
    if (question.functionType in typeMap) {
      return typeMap[question.functionType as keyof typeof typeMap] as keyof DetailedFunctionScores;
    }
    
    // Default fallback for non-cognitive function questions
    return 'Ni';
  }
}

/**
 * Basic scoring strategy - equal weight for all questions
 */
export class BasicScoringStrategy extends ScoringStrategy {
  protected weights: ScoringWeights = {
    functionPreference: 1,
    functionOrder: 1,
    traditionalDichotomy: 0.8,
    stackPosition: [1, 0.8, 0.6, 0.4]
  };
  
  getName(): string {
    return 'Basic';
  }
}

/**
 * Enhanced scoring strategy - higher weight for order questions
 */
export class EnhancedScoringStrategy extends ScoringStrategy {
  protected weights: ScoringWeights = {
    functionPreference: 1,
    functionOrder: 2,
    traditionalDichotomy: 0.5,
    stackPosition: [1, 0.75, 0.5, 0.25]
  };
  
  getName(): string {
    return 'Enhanced';
  }
}

/**
 * Stack-aware scoring strategy - applies position weights based on function prominence
 * This strategy considers that dominant functions should score higher than auxiliary, etc.
 */
export class StackAwareScoringStrategy extends ScoringStrategy {
  protected weights: ScoringWeights = {
    functionPreference: 1,
    functionOrder: 2.5,
    traditionalDichotomy: 0.8,
    stackPosition: [1.0, 0.7, 0.4, 0.2] // Dominant, Auxiliary, Tertiary, Inferior
  };
  
  getName(): string {
    return 'StackAware';
  }
  
  scoreResponses(responses: Response[]): DetailedFunctionScores {
    const scores: DetailedFunctionScores = {
      Ne: 0, Ni: 0, Se: 0, Si: 0,
      Te: 0, Ti: 0, Fe: 0, Fi: 0
    };
    
    responses.forEach((response) => {
      if (response === null) return;
      
      const question = questions[response.questionIndex];
      const baseWeight = this.getQuestionWeight(question.category);
      
      // Apply different weights based on question importance
      let weight = baseWeight;
      
      // Give higher weight to FUNCTION_ORDER questions as they indicate dominance
      if (question.category === QuestionCategory.FUNCTION_ORDER) {
        weight *= 1.5; // Extra boost for order questions
      }
      
      if (response.value) {
        scores[this.getExtrovertedFunction(question)] += weight;
      } else {
        scores[this.getIntrovertedFunction(question)] += weight;
      }
    });
    
    return scores;
  }
}

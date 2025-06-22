import { Question, CognitiveFunctionType, QuestionCategory } from '../types';
import { Response, MBTIType } from '../calculation/types';

/**
 * Generates response patterns for testing MBTI calculator
 */
export class ResponsePatternGenerator {
  private questions: Question[];

  // Type-to-function mappings based on MBTI theory
  private readonly typeToFunctions: Record<MBTIType, string[]> = {
    [MBTIType.INTJ]: ['Ni', 'Te', 'Fi', 'Se'],
    [MBTIType.INTP]: ['Ti', 'Ne', 'Si', 'Fe'],
    [MBTIType.ENTJ]: ['Te', 'Ni', 'Se', 'Fi'],
    [MBTIType.ENTP]: ['Ne', 'Ti', 'Fe', 'Si'],
    [MBTIType.INFJ]: ['Ni', 'Fe', 'Ti', 'Se'],
    [MBTIType.INFP]: ['Fi', 'Ne', 'Si', 'Te'],
    [MBTIType.ENFJ]: ['Fe', 'Ni', 'Se', 'Ti'],
    [MBTIType.ENFP]: ['Ne', 'Fi', 'Te', 'Si'],
    [MBTIType.ISTJ]: ['Si', 'Te', 'Fi', 'Ne'],
    [MBTIType.ISFJ]: ['Si', 'Fe', 'Ti', 'Ne'],
    [MBTIType.ESTJ]: ['Te', 'Si', 'Ne', 'Fi'],
    [MBTIType.ESFJ]: ['Fe', 'Si', 'Ne', 'Ti'],
    [MBTIType.ISTP]: ['Ti', 'Se', 'Ni', 'Fe'],
    [MBTIType.ISFP]: ['Fi', 'Se', 'Ni', 'Te'],
    [MBTIType.ESTP]: ['Se', 'Ti', 'Fe', 'Ni'],
    [MBTIType.ESFP]: ['Se', 'Fi', 'Te', 'Ni']
  };

  constructor(questions: Question[]) {
    this.questions = questions;
  }

  /**
   * Generate sophisticated pattern that differentiates between similar types
   * This considers dominant strength, inferior weakness, and function hierarchy
   */
  generateSophisticatedPattern(type: MBTIType): Response[] {
    const responses: Response[] = [];
    const typeFunctions = this.typeToFunctions[type];
    
    // Stack position insights: dominant=very strong, auxiliary=strong, tertiary=weak, inferior=very weak
    const dominantFunc = typeFunctions[0];   // Position 0: Very strong
    const auxiliaryFunc = typeFunctions[1];  // Position 1: Strong  
    const tertiaryFunc = typeFunctions[2];   // Position 2: Weak
    const inferiorFunc = typeFunctions[3];   // Position 3: Very weak (often opposite behavior)

    this.questions.forEach((question, index) => {
      const response = this.getSophisticatedResponse(
        question, 
        dominantFunc, 
        auxiliaryFunc, 
        tertiaryFunc, 
        inferiorFunc,
        index
      );
      responses.push({
        questionIndex: index,
        value: response
      });
    });

    return responses;
  }

  /**
   * Get sophisticated response considering function hierarchy and positioning
   */
  private getSophisticatedResponse(
    question: Question,
    dominantFunc: string,
    auxiliaryFunc: string,
    tertiaryFunc: string,
    inferiorFunc: string,
    questionIndex: number
  ): boolean | null {
    // Handle traditional dichotomy questions
    if (question.functionType === 'extroversion-introversion') {
      // Check if the type is extroverted or introverted based on dominant function
      const isExtroverted = ['Ne', 'Se', 'Te', 'Fe'].includes(dominantFunc);
      return isExtroverted;
    }
    
    if (question.functionType === 'judging-perceiving') {
      // Check if the type is judging or perceiving based on dominant function
      const isJudging = ['Te', 'Fe', 'Ti', 'Fi'].includes(dominantFunc);
      return isJudging;
    }
    
    // Handle cognitive function questions
    const extrovertedFunction = this.getExtrovertedFunction(question.functionType);
    const introvertedFunction = this.getIntrovertedFunction(question.functionType);

    // Check which functions are being tested
    const testingExtroverted = [dominantFunc, auxiliaryFunc, tertiaryFunc, inferiorFunc].includes(extrovertedFunction);
    const testingIntroverted = [dominantFunc, auxiliaryFunc, tertiaryFunc, inferiorFunc].includes(introvertedFunction);
    
    // Priority scoring: dominant=4, auxiliary=3, tertiary=2, inferior=1
    const getStrength = (func: string) => {
      if (func === dominantFunc) return 4;
      if (func === auxiliaryFunc) return 3;
      if (func === tertiaryFunc) return 2;
      if (func === inferiorFunc) return 1;
      return 0;
    };
    
    const extrovertedStrength = getStrength(extrovertedFunction);
    const introvertedStrength = getStrength(introvertedFunction);
    
    // If neither function is in stack, use default logic
    if (!testingExtroverted && !testingIntroverted) {
      return questionIndex % 3 !== 0; // Deterministic but varied
    }
    
    // If only one function is in stack
    if (!testingExtroverted) {
      // Only introverted function in stack
      if (introvertedStrength >= 3) return false; // Strong preference for introverted
      if (introvertedStrength === 2) return questionIndex % 4 === 0; // Tertiary: mostly introverted, some variation
      return questionIndex % 2 === 0; // Inferior: very inconsistent
    }
    
    if (!testingIntroverted) {
      // Only extroverted function in stack
      if (extrovertedStrength >= 3) return true; // Strong preference for extroverted
      if (extrovertedStrength === 2) return questionIndex % 4 !== 0; // Tertiary: mostly extroverted, some variation
      return questionIndex % 2 !== 0; // Inferior: very inconsistent
    }
    
    // Both functions in stack - this is the key differentiator
    if (extrovertedStrength > introvertedStrength) {
      // Extroverted function is higher in stack
      if (extrovertedStrength === 4) return true; // Dominant: very strong
      if (extrovertedStrength === 3) return questionIndex % 5 !== 0; // Auxiliary: mostly strong
      if (extrovertedStrength === 2) return questionIndex % 3 === 0; // Tertiary: weaker
      return false; // Should not happen
    } else {
      // Introverted function is higher in stack  
      if (introvertedStrength === 4) return false; // Dominant: very strong
      if (introvertedStrength === 3) return questionIndex % 5 === 0; // Auxiliary: mostly strong
      if (introvertedStrength === 2) return questionIndex % 3 !== 0; // Tertiary: weaker
      return true; // Should not happen
    }
  }

  /**
   * Generate deterministic realistic pattern with consistent stack hierarchy
   */
  generateDeterministicPattern(type: MBTIType): Response[] {
    const responses: Response[] = [];
    const typeFunctions = this.typeToFunctions[type];
    
    // Stack position weights: dominant=1.0, auxiliary=0.75, tertiary=0.5, inferior=0.25
    const stackWeights = [1.0, 0.75, 0.5, 0.25];

    this.questions.forEach((question, index) => {
      const response = this.getDeterministicResponse(question, typeFunctions, stackWeights);
      responses.push({
        questionIndex: index,
        value: response
      });
    });

    return responses;
  }

  /**
   * Get deterministic response based on stack position and question importance
   */
  private getDeterministicResponse(
    question: Question, 
    typeFunctions: string[], 
    stackWeights: number[]
  ): boolean | null {
    // Handle traditional dichotomy questions
    if (question.functionType === 'extroversion-introversion') {
      // Check if the type is extroverted or introverted
      const firstFunction = typeFunctions[0];
      const isExtroverted = ['Ne', 'Se', 'Te', 'Fe'].includes(firstFunction);
      return isExtroverted;
    }
    
    if (question.functionType === 'judging-perceiving') {
      // Check if the type is judging or perceiving
      const firstFunction = typeFunctions[0];
      const isJudging = ['Te', 'Fe', 'Ti', 'Fi'].includes(firstFunction);
      return isJudging;
    }
    
    // Handle cognitive function questions
    const extrovertedFunction = this.getExtrovertedFunction(question.functionType);
    const introvertedFunction = this.getIntrovertedFunction(question.functionType);

    const extrovertedIndex = typeFunctions.indexOf(extrovertedFunction);
    const introvertedIndex = typeFunctions.indexOf(introvertedFunction);

    // If neither function is in the stack, slightly favor extroverted (60/40)
    if (extrovertedIndex === -1 && introvertedIndex === -1) {
      return true; // Simplified: favor extroverted
    }

    // If only one function is in stack, strongly prefer it based on position
    if (extrovertedIndex === -1) {
      const strength = stackWeights[introvertedIndex];
      return strength < 0.4; // Only if very weak (inferior position)
    }
    
    if (introvertedIndex === -1) {
      const strength = stackWeights[extrovertedIndex];
      return strength > 0.4; // If reasonably strong
    }

    // Both functions are in stack - choose based on relative strength and question type
    const extrovertedStrength = stackWeights[extrovertedIndex];
    const introvertedStrength = stackWeights[introvertedIndex];
    
    // For FUNCTION_ORDER questions, be more decisive based on strength
    if (question.category === QuestionCategory.FUNCTION_ORDER) {
      return extrovertedStrength > introvertedStrength;
    }
    
    // For FUNCTION_PREFERENCE questions, add some nuance
    // If strengths are close (within 0.25), consider other factors
    if (Math.abs(extrovertedStrength - introvertedStrength) < 0.25) {
      // Use question index to add deterministic variation
      return (question.functionType.length + extrovertedIndex) % 3 !== 0;
    }
    
    return extrovertedStrength > introvertedStrength;
  }

  /**
   * Get extroverted function name for a function type
   */
  private getExtrovertedFunction(functionType: CognitiveFunctionType): string {
    switch (functionType) {
      case CognitiveFunctionType.INTUITION:
        return 'Ne';
      case CognitiveFunctionType.SENSING:
        return 'Se';
      case CognitiveFunctionType.THINKING:
        return 'Te';
      case CognitiveFunctionType.FEELING:
        return 'Fe';
      default:
        return 'Ne';
    }
  }

  /**
   * Get introverted function name for a function type
   */
  private getIntrovertedFunction(functionType: CognitiveFunctionType): string {
    switch (functionType) {
      case CognitiveFunctionType.INTUITION:
        return 'Ni';
      case CognitiveFunctionType.SENSING:
        return 'Si';
      case CognitiveFunctionType.THINKING:
        return 'Ti';
      case CognitiveFunctionType.FEELING:
        return 'Fi';
      default:
        return 'Ni';
    }
  }

  /**
   * Add noise to a pattern for testing variation
   */
  addNoiseToPattern(basePattern: Response[], noiseLevel: number): Response[] {
    return basePattern.map(response => {
      if (Math.random() < noiseLevel) {
        // Add noise: flip response or make it null
        if (response.value === null) {
          return { ...response, value: Math.random() < 0.5 };
        } else if (Math.random() < 0.5) {
          return { ...response, value: !response.value };
        } else {
          return { ...response, value: null };
        }
      }
      return response;
    });
  }

  /**
   * Generate pattern with incomplete responses (null values)
   */
  generateIncompletePattern(incompleteness: number): Response[] {
    const baseType = MBTIType.INTP; // Use INTP as base
    const basePattern = this.generateDeterministicPattern(baseType);

    return basePattern.map(response => {
      if (Math.random() < incompleteness) {
        return { ...response, value: null };
      }
      return response;
    });
  }

  /**
   * Generate pattern where all responses are null/unsure
   */
  generateAllUnsurePattern(): Response[] {
    return this.questions.map((_, index) => ({
      questionIndex: index,
      value: null
    }));
  }

  /**
   * Generate pattern with weak preferences for specified dimensions
   */
  generateWeakPreferencePattern(type: MBTIType, weakDimensions: string[]): Response[] {
    const basePattern = this.generateDeterministicPattern(type);
    
    return basePattern.map((response, index) => {
      const question = this.questions[index];
      
      // Make responses weaker for specified dimensions
      const shouldWeaken = weakDimensions.some(dim => {
        switch (dim) {
          case 'thinking':
            return question.functionType === CognitiveFunctionType.THINKING;
          case 'feeling':
            return question.functionType === CognitiveFunctionType.FEELING;
          case 'sensing':
            return question.functionType === CognitiveFunctionType.SENSING;
          case 'intuition':
            return question.functionType === CognitiveFunctionType.INTUITION;
          case 'perceiving':
            return question.functionType === CognitiveFunctionType.JUDGING_PERCEIVING;
          case 'judging':
            return question.functionType === CognitiveFunctionType.JUDGING_PERCEIVING;
          case 'extroversion':
            return question.functionType === CognitiveFunctionType.EXTROVERSION_INTROVERSION;
          case 'introversion':
            return question.functionType === CognitiveFunctionType.EXTROVERSION_INTROVERSION;
          default:
            return false;
        }
      });

      if (shouldWeaken && Math.random() < 0.4) {
        // 40% chance to make response null (unsure) for weak dimensions
        return { ...response, value: null };
      }

      if (shouldWeaken && Math.random() < 0.3) {
        // 30% chance to flip response for weak dimensions
        return { 
          ...response, 
          value: response.value === null ? null : !response.value 
        };
      }

      return response;
    });
  }
}

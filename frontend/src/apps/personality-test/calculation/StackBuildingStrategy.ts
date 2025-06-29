import { CognitiveFunction, DetailedFunctionScores, CognitiveFunctionName, MBTIType } from './types';
import { IStackBuildingStrategy } from './interfaces';
import { mbtiTypes } from './mbtiData';

/**
 * Base class for stack building strategies
 */
export abstract class StackBuildingStrategy implements IStackBuildingStrategy {
  abstract getName(): string;
  abstract buildStack(scores: DetailedFunctionScores): CognitiveFunction[];
  
  /**
   * Validate if a stack follows MBTI theory rules
   */
  validateStack(stack: CognitiveFunction[]): boolean {
    if (stack.length !== 4) return false;
    
    // Check alternating extroversion pattern
    const attitudes = stack.map(f => f.isExtroverted);
    return attitudes[0] !== attitudes[1] && attitudes[1] !== attitudes[2] && attitudes[2] !== attitudes[3];
  }
  
  /**
   * Helper to create a CognitiveFunction object
   */
  protected createFunction(extroverted: CognitiveFunctionName, introverted: CognitiveFunctionName, isExtroverted: boolean): CognitiveFunction {
    return {
      extroverted,
      introverted,
      isExtroverted,
      isAnimating: false
    };
  }
}

/**
 * Theory-based stack building strategy
 * Builds stacks according to MBTI cognitive function theory
 */
export class TheoryBasedStackBuildingStrategy extends StackBuildingStrategy {
  getName(): string {
    return 'TheoryBased';
  }
  
  buildStack(scores: DetailedFunctionScores): CognitiveFunction[] {
    // Find the strongest function as dominant
    const functionStrengths = [
      { name: 'Ni', score: scores.Ni, extroverted: CognitiveFunctionName.NE, introverted: CognitiveFunctionName.NI, isExtroverted: false },
      { name: 'Ne', score: scores.Ne, extroverted: CognitiveFunctionName.NE, introverted: CognitiveFunctionName.NI, isExtroverted: true },
      { name: 'Si', score: scores.Si, extroverted: CognitiveFunctionName.SE, introverted: CognitiveFunctionName.SI, isExtroverted: false },
      { name: 'Se', score: scores.Se, extroverted: CognitiveFunctionName.SE, introverted: CognitiveFunctionName.SI, isExtroverted: true },
      { name: 'Ti', score: scores.Ti, extroverted: CognitiveFunctionName.TE, introverted: CognitiveFunctionName.TI, isExtroverted: false },
      { name: 'Te', score: scores.Te, extroverted: CognitiveFunctionName.TE, introverted: CognitiveFunctionName.TI, isExtroverted: true },
      { name: 'Fi', score: scores.Fi, extroverted: CognitiveFunctionName.FE, introverted: CognitiveFunctionName.FI, isExtroverted: false },
      { name: 'Fe', score: scores.Fe, extroverted: CognitiveFunctionName.FE, introverted: CognitiveFunctionName.FI, isExtroverted: true }
    ].sort((a, b) => b.score - a.score);
    
    const dominant = functionStrengths[0];
    
    // Find auxiliary (opposite attitude, different category)
    const isPerceiving = ['Ni', 'Ne', 'Si', 'Se'].includes(dominant.name);
    const auxiliaryCandidates = functionStrengths.filter(f => 
      f.isExtroverted !== dominant.isExtroverted && 
      (isPerceiving ? ['Ti', 'Te', 'Fi', 'Fe'].includes(f.name) : ['Ni', 'Ne', 'Si', 'Se'].includes(f.name))
    );
    const auxiliary = auxiliaryCandidates[0] || functionStrengths[1];
    
    // Build the remaining stack following MBTI theory
    const remainingFunctions = functionStrengths.filter(f => 
      f.name !== dominant.name && f.name !== auxiliary.name
    );
    
    // Tertiary should be same attitude as dominant
    const tertiaryCandidates = remainingFunctions.filter(f => f.isExtroverted === dominant.isExtroverted);
    const tertiary = tertiaryCandidates[0] || remainingFunctions[0];
    
    // Inferior should be opposite attitude from dominant
    const inferiorCandidates = remainingFunctions.filter(f => 
      f.isExtroverted !== dominant.isExtroverted && f.name !== tertiary.name
    );
    const inferior = inferiorCandidates[0] || remainingFunctions.find(f => f.name !== tertiary.name);
    
    return [
      this.createFunction(dominant.extroverted, dominant.introverted, dominant.isExtroverted),
      this.createFunction(auxiliary.extroverted, auxiliary.introverted, auxiliary.isExtroverted),
      this.createFunction(tertiary.extroverted, tertiary.introverted, tertiary.isExtroverted),
      this.createFunction(inferior?.extroverted || CognitiveFunctionName.NE, inferior?.introverted || CognitiveFunctionName.NI, inferior?.isExtroverted || false)
    ];
  }
}

/**
 * Simple stack building strategy
 * Just takes the four strongest functions in order
 */
export class SimpleStackBuildingStrategy extends StackBuildingStrategy {
  getName(): string {
    return 'Simple';
  }
  
  buildStack(scores: DetailedFunctionScores): CognitiveFunction[] {
    const functionStrengths = [
      { name: 'Ni', score: scores.Ni, extroverted: CognitiveFunctionName.NE, introverted: CognitiveFunctionName.NI, isExtroverted: false },
      { name: 'Ne', score: scores.Ne, extroverted: CognitiveFunctionName.NE, introverted: CognitiveFunctionName.NI, isExtroverted: true },
      { name: 'Si', score: scores.Si, extroverted: CognitiveFunctionName.SE, introverted: CognitiveFunctionName.SI, isExtroverted: false },
      { name: 'Se', score: scores.Se, extroverted: CognitiveFunctionName.SE, introverted: CognitiveFunctionName.SI, isExtroverted: true },
      { name: 'Ti', score: scores.Ti, extroverted: CognitiveFunctionName.TE, introverted: CognitiveFunctionName.TI, isExtroverted: false },
      { name: 'Te', score: scores.Te, extroverted: CognitiveFunctionName.TE, introverted: CognitiveFunctionName.TI, isExtroverted: true },
      { name: 'Fi', score: scores.Fi, extroverted: CognitiveFunctionName.FE, introverted: CognitiveFunctionName.FI, isExtroverted: false },
      { name: 'Fe', score: scores.Fe, extroverted: CognitiveFunctionName.FE, introverted: CognitiveFunctionName.FI, isExtroverted: true }
    ].sort((a, b) => b.score - a.score);
    
    return functionStrengths.slice(0, 4).map(f => 
      this.createFunction(f.extroverted, f.introverted, f.isExtroverted)
    );
  }
}

/**
 * Simple top-4 stack building strategy
 * Takes the 4 highest scoring functions in order, ensuring theory compliance
 */
export class TopFourStackBuildingStrategy extends StackBuildingStrategy {
  getName(): string {
    return 'TopFour';
  }
  
  buildStack(scores: DetailedFunctionScores): CognitiveFunction[] {
    // Get all functions sorted by score
    const functionStrengths = [
      { name: 'Ni', score: scores.Ni, extroverted: CognitiveFunctionName.NE, introverted: CognitiveFunctionName.NI, isExtroverted: false },
      { name: 'Ne', score: scores.Ne, extroverted: CognitiveFunctionName.NE, introverted: CognitiveFunctionName.NI, isExtroverted: true },
      { name: 'Si', score: scores.Si, extroverted: CognitiveFunctionName.SE, introverted: CognitiveFunctionName.SI, isExtroverted: false },
      { name: 'Se', score: scores.Se, extroverted: CognitiveFunctionName.SE, introverted: CognitiveFunctionName.SI, isExtroverted: true },
      { name: 'Ti', score: scores.Ti, extroverted: CognitiveFunctionName.TE, introverted: CognitiveFunctionName.TI, isExtroverted: false },
      { name: 'Te', score: scores.Te, extroverted: CognitiveFunctionName.TE, introverted: CognitiveFunctionName.TI, isExtroverted: true },
      { name: 'Fi', score: scores.Fi, extroverted: CognitiveFunctionName.FE, introverted: CognitiveFunctionName.FI, isExtroverted: false },
      { name: 'Fe', score: scores.Fe, extroverted: CognitiveFunctionName.FE, introverted: CognitiveFunctionName.FI, isExtroverted: true }
    ].sort((a, b) => b.score - a.score);
    
    // Take top 4 scoring functions
    const topFour = functionStrengths.slice(0, 4);
    
    // Build cognitive function stack
    const stack = topFour.map(f => 
      this.createFunction(f.extroverted, f.introverted, f.isExtroverted)
    );
    
    // Validate and adjust if needed to follow MBTI theory
    if (this.validateStack(stack)) {
      return stack;
    }
    
    // If validation fails, fall back to theory-based approach
    return this.buildValidStack(functionStrengths);
  }
  
  /**
   * Build a valid stack that follows MBTI alternating pattern
   */
  private buildValidStack(functionStrengths: any[]): CognitiveFunction[] {
    const stack: CognitiveFunction[] = [];
    
    // Start with the highest scoring function as dominant
    const dominant = functionStrengths[0];
    stack.push(this.createFunction(dominant.extroverted, dominant.introverted, dominant.isExtroverted));
    
    // Find auxiliary (opposite attitude, different function type)
    const auxiliaryCandidates = functionStrengths.filter(f => 
      f.isExtroverted !== dominant.isExtroverted &&
      this.isDifferentFunctionType(f.name, dominant.name)
    );
    const auxiliary = auxiliaryCandidates[0] || functionStrengths[1];
    stack.push(this.createFunction(auxiliary.extroverted, auxiliary.introverted, auxiliary.isExtroverted));
    
    // Continue building valid stack...
    const remaining = functionStrengths.filter(f => 
      f.name !== dominant.name && f.name !== auxiliary.name
    );
    
    // Tertiary: same attitude as dominant
    const tertiaryCandidates = remaining.filter(f => f.isExtroverted === dominant.isExtroverted);
    const tertiary = tertiaryCandidates[0] || remaining[0];
    stack.push(this.createFunction(tertiary.extroverted, tertiary.introverted, tertiary.isExtroverted));
    
    // Inferior: opposite attitude from dominant
    const inferiorCandidates = remaining.filter(f => 
      f.isExtroverted !== dominant.isExtroverted && f.name !== tertiary.name
    );
    const inferior = inferiorCandidates[0] || remaining.find(f => f.name !== tertiary.name);
    if (inferior) {
      stack.push(this.createFunction(inferior.extroverted, inferior.introverted, inferior.isExtroverted));
    }
    
    return stack;
  }
  
  private isDifferentFunctionType(func1: string, func2: string): boolean {
    const getType = (f: string) => {
      if (['Ne', 'Ni'].includes(f)) return 'intuition';
      if (['Se', 'Si'].includes(f)) return 'sensing';
      if (['Te', 'Ti'].includes(f)) return 'thinking';
      if (['Fe', 'Fi'].includes(f)) return 'feeling';
      return 'unknown';
    };
    return getType(func1) !== getType(func2);
  }
}

/**
 * Type-First Stack Building Strategy
 * First determines which MBTI type the scores most likely represent,
 * then builds that type's canonical stack
 */
export class TypeFirstStackBuildingStrategy extends StackBuildingStrategy {
  getName(): string {
    return 'TypeFirst';
  }
  
  buildStack(scores: DetailedFunctionScores): CognitiveFunction[] {
    // For each MBTI type, calculate how well the scores match that type's expected pattern
    const typeScores: { type: MBTIType, score: number }[] = [];
    
    for (const [typeName, typeData] of Object.entries(mbtiTypes)) {
      const matchScore = this.calculateTypeMatchScore(scores, typeData.functions);
      typeScores.push({
        type: typeName as MBTIType,
        score: matchScore
      });
    }
    
    // Sort by match score and take the best match
    typeScores.sort((a, b) => b.score - a.score);
    const bestMatchType = typeScores[0].type;
    const bestTypeData = mbtiTypes[bestMatchType];
    
    // Build the canonical stack for this type
    return this.buildCanonicalStack(bestTypeData.functions);
  }
  
  /**
   * Calculate how well the function scores match a given type's expected pattern
   */
  private calculateTypeMatchScore(scores: DetailedFunctionScores, typeFunctions: string[]): number {
    let totalScore = 0;
    
    // Check each position in the type's stack
    typeFunctions.forEach((functionName, position) => {
      const functionScore = scores[functionName as keyof DetailedFunctionScores] || 0;
      
      // Weight by position: dominant=4x, auxiliary=3x, tertiary=2x, inferior=1x
      const positionWeight = 4 - position;
      
      // Expect higher scores for higher positions
      totalScore += functionScore * positionWeight;
    });
    
    return totalScore;
  }
  
  /**
   * Build the canonical cognitive function stack for a type
   */
  private buildCanonicalStack(typeFunctions: string[]): CognitiveFunction[] {
    return typeFunctions.map(funcName => {
      // Determine if this function is extroverted or introverted
      const isExtroverted = ['Ne', 'Se', 'Te', 'Fe'].includes(funcName);
      
      // Map to CognitiveFunctionName enum values
      let extroverted: CognitiveFunctionName, introverted: CognitiveFunctionName;
      
      if (['Ne', 'Ni'].includes(funcName)) {
        extroverted = CognitiveFunctionName.NE;
        introverted = CognitiveFunctionName.NI;
      } else if (['Se', 'Si'].includes(funcName)) {
        extroverted = CognitiveFunctionName.SE;
        introverted = CognitiveFunctionName.SI;
      } else if (['Te', 'Ti'].includes(funcName)) {
        extroverted = CognitiveFunctionName.TE;
        introverted = CognitiveFunctionName.TI;
      } else { // Fe, Fi
        extroverted = CognitiveFunctionName.FE;
        introverted = CognitiveFunctionName.FI;
      }
      
      return this.createFunction(extroverted, introverted, isExtroverted);
    });
  }
}

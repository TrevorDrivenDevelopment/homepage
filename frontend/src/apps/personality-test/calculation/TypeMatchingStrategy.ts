import { CognitiveFunction, MBTIType, Response } from './types';
import { ITypeMatchingStrategy, TypeMatchResult } from './interfaces';
import { mbtiTypes } from './mbtiData';

/**
 * Base class for type matching strategies
 */
export abstract class TypeMatchingStrategy implements ITypeMatchingStrategy {
  abstract getName(): string;
  
  /**
   * Find best matching types for a given stack
   */
  findBestMatches(
    stack: CognitiveFunction[], 
    responses: Response[]
  ): TypeMatchResult[] {
    const results: TypeMatchResult[] = [];
    
    // Score each MBTI type
    for (const [typeName, typeData] of Object.entries(mbtiTypes)) {
      const score = this.calculateMatchScore(
        typeName as MBTIType, 
        stack
      );
      
      results.push({
        type: typeName as MBTIType,
        score,
        confidence: this.calculateConfidence(score, stack, typeData.functions),
        stack: [] // We'll populate this properly later if needed
      });
    }
    
    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
  }
  
  abstract calculateMatchScore(
    type: MBTIType, 
    stack: CognitiveFunction[]
  ): number;
  
  protected calculateConfidence(
    score: number, 
    userStack: CognitiveFunction[], 
    typeStack: string[]
  ): number {
    // Base confidence on match score
    let confidence = Math.min(score / 4, 1) * 100;
    
    // Convert user stack to string for comparison
    const userStackString = userStack.map(f => f.isExtroverted ? f.extroverted : f.introverted);
    
    // Reduce confidence if stacks don't match exactly
    const exactMatch = userStackString.every((f, i) => f === typeStack[i]);
    if (!exactMatch) {
      confidence *= 0.8;
    }
    
    return Math.round(confidence);
  }
}

/**
 * Exact match strategy - scores based on exact function matches
 */
export class ExactMatchStrategy extends TypeMatchingStrategy {
  getName(): string {
    return 'ExactMatch';
  }
  
  calculateMatchScore(type: MBTIType, stack: CognitiveFunction[]): number {
    const typeData = mbtiTypes[type];
    let score = 0;
    
    // Convert user stack to string array for comparison
    const userStackString = stack.map(f => f.isExtroverted ? f.extroverted : f.introverted);
    
    // Compare each position
    userStackString.forEach((func, index) => {
      if (func === typeData.functions[index]) {
        score += (4 - index); // Higher positions worth more
      }
    });
    
    return score;
  }
}

/**
 * Flexible match strategy - allows for function position variations
 */
export class FlexibleMatchStrategy extends TypeMatchingStrategy {
  getName(): string {
    return 'FlexibleMatch';
  }
  
  calculateMatchScore(type: MBTIType, stack: CognitiveFunction[]): number {
    const typeData = mbtiTypes[type];
    let score = 0;
    
    // Convert user stack to string array for comparison
    const userStackString = stack.map(f => f.isExtroverted ? f.extroverted : f.introverted);
    
    // Check if functions exist in both stacks
    userStackString.forEach((func, userIndex) => {
      const typeIndex = typeData.functions.indexOf(func);
      if (typeIndex !== -1) {
        // Score based on position difference
        const posDiff = Math.abs(userIndex - typeIndex);
        score += (4 - posDiff);
      }
    });
    
    return score;
  }
}

/**
 * Weighted match strategy - uses custom position weights
 */
export class WeightedMatchStrategy extends TypeMatchingStrategy {
  private positionWeights = [1.0, 0.7, 0.4, 0.2];
  
  getName(): string {
    return 'WeightedMatch';
  }
  
  calculateMatchScore(type: MBTIType, stack: CognitiveFunction[]): number {
    const typeData = mbtiTypes[type];
    let score = 0;
    
    // Convert user stack to string array for comparison
    const userStackString = stack.map(f => f.isExtroverted ? f.extroverted : f.introverted);
    
    userStackString.forEach((func, index) => {
      const typeIndex = typeData.functions.indexOf(func);
      if (typeIndex !== -1) {
        // Weight by both positions
        const userWeight = this.positionWeights[index];
        const typeWeight = this.positionWeights[typeIndex];
        score += (userWeight + typeWeight) / 2;
      }
    });
    
    return score * 2.5; // Scale to comparable range
  }
}

/**
 * Dominant-Auxiliary focus strategy - heavily weights first two functions
 */
export class DominantAuxiliaryStrategy extends TypeMatchingStrategy {
  getName(): string {
    return 'DominantAuxiliary';
  }
  
  calculateMatchScore(type: MBTIType, stack: CognitiveFunction[]): number {
    const typeData = mbtiTypes[type];
    let score = 0;
    
    // Convert user stack to string array for comparison
    const userStackString = stack.map(f => f.isExtroverted ? f.extroverted : f.introverted);
    
    // Heavily weight dominant and auxiliary matches
    if (userStackString[0] === typeData.functions[0]) score += 5;
    if (userStackString[1] === typeData.functions[1]) score += 3;
    
    // Lightly weight tertiary and inferior
    if (userStackString[2] === typeData.functions[2]) score += 1;
    if (userStackString[3] === typeData.functions[3]) score += 0.5;
    
    return score;
  }
}

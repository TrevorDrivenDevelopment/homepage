import { Response, CognitiveFunction, MBTIType, DetailedFunctionScores } from './types';

/**
 * Strategy for calculating MBTI type and cognitive function stack from responses
 */
export interface ICalculationStrategy {
  /**
   * Calculate MBTI type from responses
   */
  calculateType(responses: Response[]): MBTIType;
  
  /**
   * Calculate cognitive function stack from responses
   */
  calculateStack(responses: Response[]): CognitiveFunction[];
  
  /**
   * Calculate confidence score for the result
   */
  calculateConfidence(responses: Response[]): number;
  
  /**
   * Get strategy name for debugging/logging
   */
  getName(): string;
}

/**
 * Strategy for scoring responses to get function scores
 */
export interface IScoringStrategy {
  /**
   * Score responses to get function scores
   */
  scoreResponses(responses: Response[]): DetailedFunctionScores;
  
  /**
   * Get scoring weights used by this strategy
   */
  getWeights(): ScoringWeights;
  
  /**
   * Get strategy name
   */
  getName(): string;
}

/**
 * Strategy for building cognitive function stacks from scores
 */
export interface IStackBuildingStrategy {
  /**
   * Build cognitive function stack from scores
   */
  buildStack(scores: DetailedFunctionScores): CognitiveFunction[];
  
  /**
   * Validate if a stack follows MBTI theory rules
   */
  validateStack(stack: CognitiveFunction[]): boolean;
  
  /**
   * Get strategy name
   */
  getName(): string;
}

/**
 * Strategy for matching MBTI types to function stacks
 */
export interface ITypeMatchingStrategy {
  /**
   * Find best matching types for a given stack
   */
  findBestMatches(
    stack: CognitiveFunction[], 
    responses: Response[]
  ): TypeMatchResult[];
  
  /**
   * Calculate match score between a type and a stack
   */
  calculateMatchScore(
    type: MBTIType, 
    stack: CognitiveFunction[]
  ): number;
  
  /**
   * Get strategy name
   */
  getName(): string;
}

/**
 * Weights used for scoring
 */
export interface ScoringWeights {
  functionPreference: number;
  functionOrder: number;
  traditionalDichotomy: number;
  stackPosition: number[];
}

/**
 * Result of type matching
 */
export interface TypeMatchResult {
  type: MBTIType;
  score: number;
  confidence: number;
  stack: CognitiveFunction[];
}

/**
 * Complete calculation result
 */
export interface CalculationResult {
  type: MBTIType;
  stack: CognitiveFunction[];
  confidence: number;
  scores: DetailedFunctionScores;
  alternativeTypes?: TypeMatchResult[];
  strategies: {
    calculation: string;
    scoring: string;
    stackBuilding: string;
    typeMatching: string;
  };
}

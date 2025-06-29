import { Response } from './types';
import { 
  ICalculationStrategy, 
  IScoringStrategy, 
  IStackBuildingStrategy, 
  ITypeMatchingStrategy,
  CalculationResult 
} from './interfaces';

// Import default strategies
import { EnhancedScoringStrategy, StackAwareScoringStrategy } from './ScoringStrategy';
import { TheoryBasedStackBuildingStrategy, TypeFirstStackBuildingStrategy } from './StackBuildingStrategy';
import { FlexibleMatchStrategy, ExactMatchStrategy } from './TypeMatchingStrategy';
import { HybridCalculationStrategy } from './CalculationStrategy';

/**
 * Main MBTI Calculator that uses strategy pattern for flexible calculation
 */
export class MBTICalculator {
  private calculationStrategy: ICalculationStrategy;
  private scoringStrategy: IScoringStrategy;
  private stackBuildingStrategy: IStackBuildingStrategy;
  private typeMatchingStrategy: ITypeMatchingStrategy;
  
  constructor() {
    // Set default strategies
    this.scoringStrategy = new EnhancedScoringStrategy();
    this.stackBuildingStrategy = new TheoryBasedStackBuildingStrategy();
    this.typeMatchingStrategy = new FlexibleMatchStrategy();
    this.calculationStrategy = new HybridCalculationStrategy(
      this.scoringStrategy,
      this.stackBuildingStrategy,
      this.typeMatchingStrategy
    );
  }
  
  /**
   * Set the scoring strategy
   */
  setScoringStrategy(strategy: IScoringStrategy): void {
    this.scoringStrategy = strategy;
    // Update calculation strategy with new scoring strategy
    this.updateCalculationStrategy();
  }
  
  /**
   * Set the stack building strategy
   */
  setStackBuildingStrategy(strategy: IStackBuildingStrategy): void {
    this.stackBuildingStrategy = strategy;
    this.updateCalculationStrategy();
  }
  
  /**
   * Set the type matching strategy
   */
  setTypeMatchingStrategy(strategy: ITypeMatchingStrategy): void {
    this.typeMatchingStrategy = strategy;
    this.updateCalculationStrategy();
  }
  
  /**
   * Calculate MBTI type using current strategies
   */
  calculate(responses: Response[]): CalculationResult {
    // Filter out null responses
    const validResponses = responses.filter(r => r !== null && r.value !== null);
    
    if (validResponses.length === 0) {
      throw new Error('No valid responses provided');
    }
    
    // Calculate using current strategy
    const type = this.calculationStrategy.calculateType(validResponses);
    const stack = this.calculationStrategy.calculateStack(validResponses);
    const confidence = this.calculationStrategy.calculateConfidence(validResponses);
    const scores = this.scoringStrategy.scoreResponses(validResponses);
    
    // Get alternative types
    const alternativeTypes = this.typeMatchingStrategy.findBestMatches(stack, validResponses);
    
    return {
      type,
      stack,
      confidence,
      scores,
      alternativeTypes: alternativeTypes.slice(0, 5), // Top 5 alternatives
      strategies: {
        calculation: this.calculationStrategy.getName(),
        scoring: this.scoringStrategy.getName(),
        stackBuilding: this.stackBuildingStrategy.getName(),
        typeMatching: this.typeMatchingStrategy.getName()
      }
    };
  }
  
  /**
   * Get current strategy names
   */
  getStrategies() {
    return {
      calculation: this.calculationStrategy.getName(),
      scoring: this.scoringStrategy.getName(),
      stackBuilding: this.stackBuildingStrategy.getName(),
      typeMatching: this.typeMatchingStrategy.getName()
    };
  }
  
  /**
   * Update calculation strategy with current sub-strategies
   */
  private updateCalculationStrategy(): void {
    // Get the current calculation strategy class
    const StrategyClass = this.calculationStrategy.constructor as any;
    
    // Create new instance with updated sub-strategies
    this.calculationStrategy = new StrategyClass(
      this.scoringStrategy,
      this.stackBuildingStrategy,
      this.typeMatchingStrategy
    );
  }
}

/**
 * Factory for creating pre-configured calculators
 */
export class MBTICalculatorFactory {
  /**
   * Create a calculator optimized for accuracy
   */
  static createAccurateCalculator(): MBTICalculator {
    const calculator = new MBTICalculator();
    calculator.setScoringStrategy(new StackAwareScoringStrategy()); // Use StackAware instead of Enhanced
    calculator.setStackBuildingStrategy(new TheoryBasedStackBuildingStrategy());
    calculator.setTypeMatchingStrategy(new ExactMatchStrategy()); // Use ExactMatch instead of Flexible
    return calculator;
  }
  
  /**
   * Create a calculator with type-first approach
   */
  static createTypeFirstCalculator(): MBTICalculator {
    const calculator = new MBTICalculator();
    calculator.setScoringStrategy(new StackAwareScoringStrategy());
    calculator.setStackBuildingStrategy(new TypeFirstStackBuildingStrategy());
    calculator.setTypeMatchingStrategy(new ExactMatchStrategy()); // Use exact match since we're building canonical stacks
    return calculator;
  }
}

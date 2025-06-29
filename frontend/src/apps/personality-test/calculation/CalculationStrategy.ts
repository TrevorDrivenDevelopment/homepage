import { Response, CognitiveFunction, MBTIType } from './types';
import { ICalculationStrategy, IScoringStrategy, IStackBuildingStrategy, ITypeMatchingStrategy } from './interfaces';
import { BasicScoringStrategy } from './ScoringStrategy';
import { TheoryBasedStackBuildingStrategy } from './StackBuildingStrategy';
import { FlexibleMatchStrategy } from './TypeMatchingStrategy';

/**
 * Base class for calculation strategies
 */
export abstract class CalculationStrategy implements ICalculationStrategy {
  protected scoringStrategy: IScoringStrategy;
  protected stackBuildingStrategy: IStackBuildingStrategy;
  protected typeMatchingStrategy: ITypeMatchingStrategy;
  
  constructor(
    scoringStrategy?: IScoringStrategy,
    stackBuildingStrategy?: IStackBuildingStrategy,
    typeMatchingStrategy?: ITypeMatchingStrategy
  ) {
    this.scoringStrategy = scoringStrategy || new BasicScoringStrategy();
    this.stackBuildingStrategy = stackBuildingStrategy || new TheoryBasedStackBuildingStrategy();
    this.typeMatchingStrategy = typeMatchingStrategy || new FlexibleMatchStrategy();
  }
  
  abstract getName(): string;
  
  calculateType(responses: Response[]): MBTIType {
    const stack = this.calculateStack(responses);
    const matches = this.typeMatchingStrategy.findBestMatches(stack, responses);
    return matches[0].type;
  }
  
  calculateStack(responses: Response[]): CognitiveFunction[] {
    const scores = this.scoringStrategy.scoreResponses(responses);
    return this.stackBuildingStrategy.buildStack(scores);
  }
  
  calculateConfidence(responses: Response[]): number {
    const stack = this.calculateStack(responses);
    const matches = this.typeMatchingStrategy.findBestMatches(stack, responses);
    return matches[0].confidence;
  }
}

/**
 * Hybrid calculation strategy - uses the best of all approaches
 */
export class HybridCalculationStrategy extends CalculationStrategy {
  getName(): string {
    return 'Hybrid';
  }
}

/**
 * Function-based calculation strategy - focuses on cognitive functions
 */
export class FunctionBasedCalculationStrategy extends CalculationStrategy {
  getName(): string {
    return 'FunctionBased';
  }
}

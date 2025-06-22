import { Response, MBTIType } from '../calculation/types';

/**
 * Interface for test results structure
 */
export interface TestResults {
  questionQuality: QuestionQualityResults;
  typeAccuracy: TestMetrics;
  consistency: TestMetrics;
  edgeCases: TestMetrics;
  performance: TestMetrics;
  overallScore: number;
  timestamp: string;
}

/**
 * General test metrics structure
 */
export interface TestMetrics {
  totalTests: number;
  passed: number;
  accuracy: number;
  details?: any;
}

/**
 * Test case definition
 */
export interface TestCase {
  name: string;
  description: string;
  pattern: Response[];
  expectedType?: MBTIType;
  minConfidence?: number;
  maxConfidence?: number;
}

/**
 * Question quality analysis results
 */
export interface QuestionQualityResults {
  distribution: {
    passed: boolean;
    details: FunctionDistribution;
  };
  bias: {
    score: number;
    issues: BiasIssue[];
  };
  clarity: {
    averageScore: number;
    questionScores: QuestionClarityScore[];
  };
  theoretical: {
    compliance: number;
    violations: string[];
  };
  overallScore: number;
}

/**
 * Function distribution across questions
 */
export interface FunctionDistribution {
  intuition: number;
  sensing: number;
  thinking: number;
  feeling: number;
  extraversionIntroversion: number;
  judgingPerceiving: number;
  functionPreference: number;
  functionOrder: number;
  traditionalDichotomy: number;
}

/**
 * Bias detection issue
 */
export interface BiasIssue {
  questionIndex: number;
  type: 'loaded_language' | 'length_disparity' | 'complexity_difference';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
}

/**
 * Individual question clarity score
 */
export interface QuestionClarityScore {
  questionIndex: number;
  score: number;
  issues: string[];
  extrovertedLength: number;
  introvertedLength: number;
  complexity: number;
}

/**
 * Type accuracy test result
 */
export interface TypeAccuracyResult {
  type: MBTIType;
  accuracy: number;
  iterations: number;
  averageConfidence: number;
  failed: number;
  details: TypeTestDetail[];
}

/**
 * Detailed result for individual type test
 */
export interface TypeTestDetail {
  iteration: number;
  calculated: MBTIType;
  expected: MBTIType;
  confidence: number;
  correct: boolean;
  responses: Response[];
}

/**
 * Consistency test configuration
 */
export interface ConsistencyTestConfig {
  iterations: number;
  noiseLevel: number;
  typesToTest: MBTIType[];
}

/**
 * Performance test metrics
 */
export interface PerformanceMetrics {
  averageTime: number;
  maxTime: number;
  minTime: number;
  under100ms: number;
  under1000ms: number;
  over2000ms: number;
}

/**
 * Edge case test categories
 */
export enum EdgeCaseCategory {
  WEAK_PREFERENCES = 'weak_preferences',
  AMBIGUOUS_RESPONSES = 'ambiguous_responses',
  INCOMPLETE_DATA = 'incomplete_data',
  EXTREME_INTROVERSION = 'extreme_introversion',
  EXTREME_EXTROVERSION = 'extreme_extroversion',
  FUNCTION_CONFLICTS = 'function_conflicts'
}

/**
 * Quality thresholds for different metrics
 */
export interface QualityThresholds {
  minimum: {
    typeAccuracy: number;
    consistency: number;
    confidence: number;
    theoreticalCompliance: number;
  };
  target: {
    typeAccuracy: number;
    consistency: number;
    userSatisfaction: number;
    questionQuality: number;
  };
  excellence: {
    typeAccuracy: number;
    consistency: number;
    userSatisfaction: number;
    theoreticalInnovation: number;
  };
}

/**
 * Default quality thresholds
 */
export const DEFAULT_QUALITY_THRESHOLDS: QualityThresholds = {
  minimum: {
    typeAccuracy: 75,
    consistency: 70,
    confidence: 60,
    theoreticalCompliance: 100
  },
  target: {
    typeAccuracy: 90,
    consistency: 85,
    userSatisfaction: 80,
    questionQuality: 85
  },
  excellence: {
    typeAccuracy: 95,
    consistency: 90,
    userSatisfaction: 90,
    theoreticalInnovation: 95
  }
};

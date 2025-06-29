import { questions } from '../calculation/mbtiData';
import { MBTICalculator } from '../calculation';
import { MBTIType, Response } from '../calculation/types';
import { ResponsePatternGenerator } from './ResponsePatternGenerator';
import { TestMetrics, TypeAccuracyResult, TypeTestDetail } from './TestTypes';

/**
 * Tests type identification accuracy across all MBTI types
 */
export class TypeAccuracyTester {
  private calculator: MBTICalculator;
  private patternGenerator: ResponsePatternGenerator;

  constructor(calculator: MBTICalculator) {
    this.calculator = calculator;
    this.patternGenerator = new ResponsePatternGenerator(questions);
  }

  /**
   * Test accuracy for all 16 MBTI types
   */
  async testAllTypes(iterations: number = 10): Promise<TestMetrics> {
    const allTypes = Object.values(MBTIType);
    const results: TypeAccuracyResult[] = [];
    let totalCorrect = 0;
    let totalTests = 0;

    for (const type of allTypes) {
      const result = await this.testSingleType(type, iterations);
      results.push(result);
      totalCorrect += result.iterations - result.failed;
      totalTests += result.iterations;
    }

    // Find best and worst performing types
    const sortedResults = results.sort((a, b) => b.accuracy - a.accuracy);
    const bestType = sortedResults[0];
    const worstType = sortedResults[sortedResults.length - 1];

    return {
      totalTests,
      passed: totalCorrect,
      accuracy: (totalCorrect / totalTests) * 100,
      details: {
        typeResults: results,
        bestType: bestType.type,
        bestAccuracy: bestType.accuracy,
        worstType: worstType.type,
        worstAccuracy: worstType.accuracy,
        averageConfidence: results.reduce((sum, r) => sum + r.averageConfidence, 0) / results.length
      }
    };
  }

  /**
   * Test accuracy for a single MBTI type
   */
  async testSingleType(type: MBTIType, iterations: number = 10): Promise<TypeAccuracyResult> {
    const details: TypeTestDetail[] = [];
    let correct = 0;
    let totalConfidence = 0;

    for (let i = 0; i < iterations; i++) {
      const responses = this.generateTestPattern(type, i);
      
      try {
        const result = this.calculator.calculate(responses);
        const isCorrect = result.type === type;
        
        if (isCorrect) correct++;
        totalConfidence += result.confidence;

        details.push({
          iteration: i + 1,
          calculated: result.type,
          expected: type,
          confidence: result.confidence,
          correct: isCorrect,
          responses
        });
      } catch (error) {
        details.push({
          iteration: i + 1,
          calculated: 'ERROR' as MBTIType,
          expected: type,
          confidence: 0,
          correct: false,
          responses
        });
      }
    }

    return {
      type,
      accuracy: (correct / iterations) * 100,
      iterations,
      averageConfidence: totalConfidence / iterations,
      failed: iterations - correct,
      details
    };
  }

  /**
   * Generate test pattern for a specific type with variation
   */
  private generateTestPattern(type: MBTIType, variation: number): Response[] {
    // Use sophisticated pattern generation for better discrimination
    const sophisticatedPattern = this.patternGenerator.generateSophisticatedPattern(type);
    
    // Add minimal noise based on variation level
    const noiseLevel = Math.min(variation * 0.01, 0.05); // Max 5% noise, very low
    return this.patternGenerator.addNoiseToPattern(sophisticatedPattern, noiseLevel);
  }

  /**
   * Generate an ambiguous pattern between two similar types
   */
  private generateAmbiguousPattern(type1: MBTIType, type2: MBTIType): Response[] {
    const pattern1 = this.patternGenerator.generateSophisticatedPattern(type1);
    const pattern2 = this.patternGenerator.generateSophisticatedPattern(type2);
    
    // Mix the two patterns - 50% from each type
    return pattern1.map((response1, index) => {
      const response2 = pattern2[index];
      
      // Randomly choose between the two responses
      if (Math.random() < 0.5) {
        return response1;
      } else {
        return response2;
      }
    });
  }

  /**
   * Test specific challenging scenarios
   */
  async testChallengingScenarios(): Promise<TestMetrics> {
    const scenarios = [
      {
        name: 'Weak T & P INTP',
        type: MBTIType.INTP,
        generator: () => this.patternGenerator.generateWeakPreferencePattern(MBTIType.INTP, ['thinking', 'perceiving'])
      },
      {
        name: 'Ambiguous INFP vs ISFP',
        type: MBTIType.INFP,
        generator: () => this.generateAmbiguousPattern(MBTIType.INFP, MBTIType.ISFP)
      },
      {
        name: 'ENTJ vs ESTJ confusion',
        type: MBTIType.ENTJ,
        generator: () => this.generateAmbiguousPattern(MBTIType.ENTJ, MBTIType.ESTJ)
      },
      {
        name: 'Extreme Introvert INTJ',
        type: MBTIType.INTJ,
        generator: () => this.patternGenerator.addNoiseToPattern(
          this.patternGenerator.generateSophisticatedPattern(MBTIType.INTJ), 
          0.1
        )
      }
    ];

    let totalTests = 0;
    let totalCorrect = 0;
    const results: any[] = [];

    for (const scenario of scenarios) {
      const iterations = 5;
      let correct = 0;

      for (let i = 0; i < iterations; i++) {
        const pattern = scenario.generator();
        
        try {
          const result = this.calculator.calculate(pattern);
          if (result.type === scenario.type) {
            correct++;
          }
          totalTests++;
        } catch (error) {
          totalTests++;
        }
      }

      totalCorrect += correct;
      results.push({
        scenario: scenario.name,
        expected: scenario.type,
        accuracy: (correct / iterations) * 100,
        correct,
        total: iterations
      });
    }

    return {
      totalTests,
      passed: totalCorrect,
      accuracy: (totalCorrect / totalTests) * 100,
      details: results
    };
  }

  /**
   * Test edge cases with incomplete or problematic data
   */
  async testEdgeCases(): Promise<TestMetrics> {
    const edgeCases = [
      {
        name: 'All Null Responses',
        pattern: this.patternGenerator.generateAllUnsurePattern()
      },
      {
        name: '50% Incomplete',
        pattern: this.patternGenerator.generateIncompletePattern(0.5)
      },
      {
        name: '25% Incomplete',
        pattern: this.patternGenerator.generateIncompletePattern(0.25)
      },
      {
        name: 'Contradictory Responses',
        pattern: this.patternGenerator.addNoiseToPattern(
          this.patternGenerator.generateSophisticatedPattern(MBTIType.INTP),
          0.5 // High noise level to create contradictory responses
        )
      }
    ];

    let totalTests = 0;
    let totalPassed = 0;
    const results: any[] = [];

    for (const edgeCase of edgeCases) {
      totalTests++;
      
      try {
        const result = this.calculator.calculate(edgeCase.pattern);
        
        // For edge cases, we mainly check that:
        // 1. No error occurred
        // 2. A valid type was returned
        // 3. Confidence is appropriately low
        
        const validType = Object.values(MBTIType).includes(result.type);
        const appropriateConfidence = edgeCase.name.includes('Null') ? 
          result.confidence < 50 : result.confidence < 80;
        
        if (validType && appropriateConfidence) {
          totalPassed++;
        }

        results.push({
          case: edgeCase.name,
          passed: validType && appropriateConfidence,
          type: result.type,
          confidence: result.confidence,
          error: null
        });
      } catch (error) {
        results.push({
          case: edgeCase.name,
          passed: false,
          type: null,
          confidence: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      totalTests,
      passed: totalPassed,
      accuracy: (totalPassed / totalTests) * 100,
      details: results
    };
  }
}

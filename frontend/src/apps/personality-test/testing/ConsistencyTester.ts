import { questions } from '../calculation/mbtiData';
import { MBTICalculator } from '../calculation';
import { MBTIType } from '../calculation/types';
import { ResponsePatternGenerator } from './ResponsePatternGenerator';
import { ConsistencyTestConfig, TestMetrics } from './TestTypes';

/**
 * Tests result consistency across multiple iterations
 */
export class ConsistencyTester {
  private calculator: MBTICalculator;
  private patternGenerator: ResponsePatternGenerator;

  constructor(calculator: MBTICalculator) {
    this.calculator = calculator;
    this.patternGenerator = new ResponsePatternGenerator(questions);
  }

  /**
   * Test consistency across multiple iterations with noise
   */
  async testConsistency(config?: Partial<ConsistencyTestConfig>): Promise<TestMetrics> {
    const defaultConfig: ConsistencyTestConfig = {
      iterations: 20,
      noiseLevel: 0.1, // 10% noise
      typesToTest: [MBTIType.INTP, MBTIType.ENFP, MBTIType.INTJ, MBTIType.ESFJ] // Sample types
    };

    const finalConfig = { ...defaultConfig, ...config };
    
    let totalTests = 0;
    let stableResults = 0;
    const results: any[] = [];

    for (const type of finalConfig.typesToTest) {
      const typeResult = await this.testTypeConsistency(type, finalConfig);
      results.push(typeResult);
      
      totalTests += typeResult.totalTests;
      stableResults += typeResult.stableResults;
    }

    return {
      totalTests,
      passed: stableResults,
      accuracy: (stableResults / totalTests) * 100,
      details: {
        typeResults: results,
        config: finalConfig,
        averageConsistency: results.reduce((sum, r) => sum + r.consistency, 0) / results.length
      }
    };
  }

  /**
   * Test consistency for a single type
   */
  private async testTypeConsistency(
    type: MBTIType, 
    config: ConsistencyTestConfig
  ): Promise<any> {
    const basePattern = this.patternGenerator.generateSophisticatedPattern(type);
    const results: { type: MBTIType; confidence: number }[] = [];

    // Run multiple iterations with slight variations
    for (let i = 0; i < config.iterations; i++) {
      const noisyPattern = this.patternGenerator.addNoiseToPattern(basePattern, config.noiseLevel);
      
      try {
        const result = this.calculator.calculate(noisyPattern);
        results.push({
          type: result.type,
          confidence: result.confidence
        });
      } catch (error) {
        results.push({
          type: 'ERROR' as MBTIType,
          confidence: 0
        });
      }
    }

    // Calculate consistency metrics
    const correctResults = results.filter(r => r.type === type);
    const consistency = (correctResults.length / config.iterations) * 100;
    
    // Calculate confidence stability
    const confidences = correctResults.map(r => r.confidence);
    const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    const confidenceStdDev = this.calculateStandardDeviation(confidences);

    return {
      expectedType: type,
      totalTests: config.iterations,
      stableResults: correctResults.length,
      consistency,
      averageConfidence: avgConfidence || 0,
      confidenceStability: confidenceStdDev < 10 ? 'High' : confidenceStdDev < 20 ? 'Medium' : 'Low',
      results: results.map(r => r.type)
    };
  }

  /**
   * Test consistency with different noise levels
   */
  async testNoiseRobustness(): Promise<TestMetrics> {
    const noiseLevels = [0.05, 0.1, 0.15, 0.2, 0.3];
    const testType = MBTIType.INTP;
    const iterations = 10;
    
    let totalTests = 0;
    let totalPassed = 0;
    const results: any[] = [];

    for (const noiseLevel of noiseLevels) {
      const basePattern = this.patternGenerator.generateSophisticatedPattern(testType);
      let passed = 0;

      for (let i = 0; i < iterations; i++) {
        const noisyPattern = this.patternGenerator.addNoiseToPattern(basePattern, noiseLevel);
        
        try {
          const result = this.calculator.calculate(noisyPattern);
          if (result.type === testType) {
            passed++;
          }
          totalTests++;
        } catch (error) {
          totalTests++;
        }
      }

      totalPassed += passed;
      results.push({
        noiseLevel: Math.round(noiseLevel * 100) + '%',
        accuracy: (passed / iterations) * 100,
        passed,
        total: iterations
      });
    }

    return {
      totalTests,
      passed: totalPassed,
      accuracy: (totalPassed / totalTests) * 100,
      details: {
        noiseLevelResults: results,
        testType,
        recommendation: this.getNoiseRecommendation(results)
      }
    };
  }

  /**
   * Test temporal consistency (same input, same output over time)
   */
  async testTemporalConsistency(): Promise<TestMetrics> {
    const testCases = [
      { type: MBTIType.INTP, label: 'Clear INTP' },
      { type: MBTIType.ENFP, label: 'Clear ENFP' },
      { type: MBTIType.INTJ, label: 'Clear INTJ' }
    ];

    let totalTests = 0;
    let totalConsistent = 0;
    const results: any[] = [];

    for (const testCase of testCases) {
      const pattern = this.patternGenerator.generateSophisticatedPattern(testCase.type);
      const iterations = 10;
      const calculationResults: string[] = [];

      // Run same pattern multiple times
      for (let i = 0; i < iterations; i++) {
        try {
          const result = this.calculator.calculate(pattern);
          calculationResults.push(result.type);
          totalTests++;
        } catch (error) {
          calculationResults.push('ERROR');
          totalTests++;
        }
      }

      // Check if all results are the same
      const isConsistent = calculationResults.every(r => r === calculationResults[0]);
      if (isConsistent) {
        totalConsistent += iterations;
      }

      results.push({
        testCase: testCase.label,
        expected: testCase.type,
        results: calculationResults,
        consistent: isConsistent,
        uniqueResults: Array.from(new Set(calculationResults))
      });
    }

    return {
      totalTests,
      passed: totalConsistent,
      accuracy: (totalConsistent / totalTests) * 100,
      details: {
        testResults: results,
        summary: `${results.filter(r => r.consistent).length}/${results.length} test cases were temporally consistent`
      }
    };
  }

  /**
   * Calculate standard deviation
   */
  private calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    
    return Math.sqrt(avgSquaredDiff);
  }

  /**
   * Get recommendation based on noise test results
   */
  private getNoiseRecommendation(results: any[]): string {
    const lowNoiseAccuracy = results.find(r => r.noiseLevel === '5%')?.accuracy || 0;
    const highNoiseAccuracy = results.find(r => r.noiseLevel === '30%')?.accuracy || 0;

    if (lowNoiseAccuracy >= 95 && highNoiseAccuracy >= 70) {
      return 'Excellent noise robustness - algorithm handles uncertainty well';
    } else if (lowNoiseAccuracy >= 90 && highNoiseAccuracy >= 60) {
      return 'Good noise robustness - acceptable performance under uncertainty';
    } else if (lowNoiseAccuracy >= 80) {
      return 'Fair noise robustness - may struggle with ambiguous responses';
    } else {
      return 'Poor noise robustness - algorithm needs improvement for real-world usage';
    }
  }
}

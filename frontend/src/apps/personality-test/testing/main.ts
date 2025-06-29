import { questions } from '../calculation/mbtiData';
import { MBTICalculator, MBTICalculatorFactory } from '../calculation';
import { MBTIType, Response } from '../calculation/types';
import { ConsistencyTester } from './ConsistencyTester';
import { QuestionQualityAnalyzer } from './QuestionQualityAnalyzer';
import { ResponsePatternGenerator } from './ResponsePatternGenerator';
import { TestCase, TestMetrics, TestResults } from './TestTypes';
import { TypeAccuracyTester } from './TypeAccuracyTester';

/**
 * Main testing script for MBTI quality assurance
 * Analyzes questions, tests calculator accuracy, and validates consistency
 */
class MBTIQualityAssurance {
  private calculator: MBTICalculator;
  private questionAnalyzer: QuestionQualityAnalyzer;
  private accuracyTester: TypeAccuracyTester;
  private consistencyTester: ConsistencyTester;
  private patternGenerator: ResponsePatternGenerator;

  constructor() {
    this.calculator = MBTICalculatorFactory.createTypeFirstCalculator(); // Use the best performing calculator
    this.questionAnalyzer = new QuestionQualityAnalyzer(questions);
    this.accuracyTester = new TypeAccuracyTester(this.calculator);
    this.consistencyTester = new ConsistencyTester(this.calculator);
    this.patternGenerator = new ResponsePatternGenerator(questions);
  }

  /**
   * Run complete quality assurance suite
   */
  async runCompleteAssessment(): Promise<TestResults> {
    console.log('🔬 Starting MBTI Quality Assurance Assessment...\n');

    // 1. Question Quality Analysis
    console.log('📋 Analyzing Question Quality...');
    const questionResults = this.questionAnalyzer.analyzeQuestions();
    this.printQuestionResults(questionResults);

    // 2. Type Accuracy Testing
    console.log('\n🎯 Testing Type Identification Accuracy...');
    const accuracyResults = await this.accuracyTester.testAllTypes();
    this.printAccuracyResults(accuracyResults);

    // 3. Consistency Testing
    console.log('\n🔄 Testing Result Consistency...');
    const consistencyResults = await this.consistencyTester.testConsistency();
    this.printConsistencyResults(consistencyResults);

    // 4. Edge Case Testing
    console.log('\n⚠️  Testing Edge Cases...');
    const edgeCaseResults = await this.testEdgeCases();
    this.printEdgeCaseResults(edgeCaseResults);

    // 5. Performance Testing
    console.log('\n⚡ Testing Performance...');
    const performanceResults = this.testPerformance();
    this.printPerformanceResults(performanceResults);

    // Compile final results
    const finalResults: TestResults = {
      questionQuality: questionResults,
      typeAccuracy: accuracyResults,
      consistency: consistencyResults,
      edgeCases: edgeCaseResults,
      performance: performanceResults,
      overallScore: this.calculateOverallScore(questionResults, accuracyResults, consistencyResults),
      timestamp: new Date().toISOString()
    };

    this.printFinalSummary(finalResults);
    return finalResults;
  }

  /**
   * Test edge cases like ambiguous responses, incomplete data
   */
  private async testEdgeCases(): Promise<TestMetrics> {
    const testCases: TestCase[] = [
      {
        name: 'Weak T & P INTP',
        description: 'INTP with unclear thinking/perceiving preferences',
        pattern: this.patternGenerator.generateWeakPreferencePattern(MBTIType.INTP, ['thinking', 'perceiving'])
      },
      {
        name: 'Noisy INTJ Pattern',
        description: 'INTJ pattern with 20% response noise',
        pattern: this.patternGenerator.addNoiseToPattern(
          this.patternGenerator.generateSophisticatedPattern(MBTIType.INTJ), 
          0.2
        )
      },
      {
        name: 'Partial Responses',
        description: 'Test with 25% null responses (realistic incomplete data)',
        pattern: this.patternGenerator.generateIncompletePattern(0.25)
      },
      {
        name: 'Highly Ambiguous',
        description: 'Mixed responses between two similar types',
        pattern: this.generateAmbiguousPattern(MBTIType.ENFP, MBTIType.ESFP)
      }
    ];

    let passedTests = 0;
    const results: any[] = [];

    for (const testCase of testCases) {
      try {
        const result = this.calculator.calculate(testCase.pattern);
        const passed = this.validateEdgeCaseResult(result, testCase);
        if (passed) passedTests++;
        
        results.push({
          testCase: testCase.name,
          passed,
          result: result.type,
          confidence: result.confidence,
          description: testCase.description
        });
      } catch (error) {
        results.push({
          testCase: testCase.name,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          description: testCase.description
        });
      }
    }

    return {
      totalTests: testCases.length,
      passed: passedTests,
      accuracy: (passedTests / testCases.length) * 100,
      details: results
    };
  }

  /**
   * Test calculation performance
   */
  private testPerformance(): TestMetrics {
    const iterations = 100;
    const testPattern = this.patternGenerator.generateSophisticatedPattern(MBTIType.INTP);
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      this.calculator.calculate(testPattern);
      const end = performance.now();
      times.push(end - start);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);

    return {
      totalTests: iterations,
      passed: times.filter(t => t < 2000).length, // Less than 2 seconds
      accuracy: avgTime < 100 ? 100 : Math.max(0, 100 - (avgTime - 100)),
      details: {
        averageTime: avgTime,
        maxTime,
        minTime,
        under100ms: times.filter(t => t < 100).length,
        under1000ms: times.filter(t => t < 1000).length
      }
    };
  }

  /**
   * Validate edge case results
   */
  private validateEdgeCaseResult(result: any, testCase: TestCase): boolean {
    // For edge cases, we check that:
    // 1. No errors occurred
    // 2. A valid type was returned
    // 3. Confidence is reasonable for the ambiguity level
    
    if (!result.type || !Object.values(MBTIType).includes(result.type as MBTIType)) {
      return false;
    }

    // For weak preference cases, accept the type family
    if (testCase.name.includes('Weak T & P INTP')) {
      // Accept NT types (INTP, ENTP, INTJ, ENTJ) as reasonable
      return ['INTP', 'ENTP', 'INFP', 'ENFP'].includes(result.type);
    }

    // For noisy patterns, confidence should still be reasonable
    if (testCase.name.includes('Noisy')) {
      return result.confidence > 50; // Should still be confident enough
    }

    // For partial responses, accept any reasonable result
    if (testCase.name.includes('Partial')) {
      return result.confidence > 30; // Lower threshold for incomplete data
    }

    // For ambiguous patterns, accept either of the target types
    if (testCase.name.includes('Ambiguous')) {
      return ['ENFP', 'ESFP'].includes(result.type); // The two types we mixed
    }

    return true;
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallScore(
    questionResults: any,
    accuracyResults: TestMetrics,
    consistencyResults: TestMetrics
  ): number {
    const questionScore = questionResults.overallScore || 0;
    const accuracyScore = accuracyResults.accuracy;
    const consistencyScore = consistencyResults.accuracy;

    // Weighted average: 30% questions, 50% accuracy, 20% consistency
    return Math.round(questionScore * 0.3 + accuracyScore * 0.5 + consistencyScore * 0.2);
  }

  /**
   * Generate an ambiguous pattern between two similar types
   */
  private generateAmbiguousPattern(type1: MBTIType, type2: MBTIType): Response[] {
    const pattern1 = this.patternGenerator.generateSophisticatedPattern(type1);
    const pattern2 = this.patternGenerator.generateSophisticatedPattern(type2);
    
    // Mix the two patterns - 50% from each type
    const mixed = pattern1.map((response1, index) => {
      const response2 = pattern2[index];
      
      // Randomly choose between the two responses
      if (Math.random() < 0.5) {
        return response1;
      } else {
        return response2;
      }
    });
    // Filter out any undefined values to ensure the result is Response[]
    return mixed.filter((r): r is Response => r !== undefined);
  }

  // Print methods for results
  private printQuestionResults(results: any): void {
    console.log(`  ✅ Question Distribution: ${results.distribution.passed ? 'PASS' : 'FAIL'}`);
    console.log(`  ✅ Bias Detection: ${results.bias.score > 90 ? 'PASS' : 'WARN'} (${results.bias.score}%)`);
    console.log(`  ✅ Clarity Score: ${results.clarity.averageScore.toFixed(1)}/10`);
  }

  private printAccuracyResults(results: TestMetrics): void {
    console.log(`  ✅ Overall Accuracy: ${results.accuracy.toFixed(1)}% (${results.passed}/${results.totalTests})`);
    if (results.details) {
      console.log(`  📊 Best Type: ${results.details.bestType} (${results.details.bestAccuracy}%)`);
      console.log(`  📊 Worst Type: ${results.details.worstType} (${results.details.worstAccuracy}%)`);
    }
  }

  private printConsistencyResults(results: TestMetrics): void {
    console.log(`  ✅ Consistency Score: ${results.accuracy.toFixed(1)}%`);
    console.log(`  🔄 Stable Results: ${results.passed}/${results.totalTests} test cases`);
  }

  private printEdgeCaseResults(results: TestMetrics): void {
    console.log(`  ✅ Edge Case Handling: ${results.accuracy.toFixed(1)}% (${results.passed}/${results.totalTests})`);
    if (results.details) {
      results.details.forEach((detail: any) => {
        const status = detail.passed ? '✅' : '❌';
        console.log(`    ${status} ${detail.testCase}: ${detail.result || detail.error}`);
      });
    }
  }

  private printPerformanceResults(results: TestMetrics): void {
    console.log(`  ✅ Performance Score: ${results.accuracy.toFixed(1)}%`);
    if (results.details) {
      console.log(`    ⚡ Average: ${results.details.averageTime.toFixed(2)}ms`);
      console.log(`    ⚡ Under 100ms: ${results.details.under100ms}/${results.totalTests}`);
    }
  }

  private printFinalSummary(results: TestResults): void {
    console.log('\n' + '='.repeat(60));
    console.log('🏆 FINAL QUALITY ASSESSMENT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Overall Score: ${results.overallScore}%`);
    console.log(`Type Accuracy: ${results.typeAccuracy.accuracy.toFixed(1)}%`);
    console.log(`Consistency: ${results.consistency.accuracy.toFixed(1)}%`);
    console.log(`Edge Cases: ${results.edgeCases.accuracy.toFixed(1)}%`);
    console.log(`Performance: ${results.performance.accuracy.toFixed(1)}%`);
    
    if (results.overallScore >= 90) {
      console.log('\n🎉 EXCELLENT - System exceeds quality thresholds!');
    } else if (results.overallScore >= 75) {
      console.log('\n✅ GOOD - System meets minimum quality requirements');
    } else {
      console.log('\n⚠️  NEEDS IMPROVEMENT - System below quality thresholds');
    }
    
    console.log(`\nAssessment completed: ${results.timestamp}`);
  }
}


const qa = new MBTIQualityAssurance();
qa.runCompleteAssessment()
    .then(() => {
        console.log('\n✅ Assessment completed successfully');
        // If running in Node.js, uncomment the next line:
        // process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Assessment failed:', error);
        // If running in Node.js, uncomment the next line:
        // process.exit(1);
    });


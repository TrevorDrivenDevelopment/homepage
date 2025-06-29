import { questions } from '../calculation/mbtiData';
import { MBTICalculator, MBTICalculatorFactory } from '../calculation';
import { MBTIType } from '../calculation/types';
import { ResponsePatternGenerator } from './ResponsePatternGenerator';

/**
 * Specific test for INTP vs ESTJ confusion
 * Tests various scenarios of weak T & P preferences for INTP
 */
class INTPvsESTJTester {
  private calculator: MBTICalculator;
  private patternGenerator: ResponsePatternGenerator;

  constructor() {
    this.calculator = MBTICalculatorFactory.createTypeFirstCalculator();
    this.patternGenerator = new ResponsePatternGenerator(questions);
  }

  /**
   * Test various INTP patterns with different weakness levels
   */
  testINTPVariations(): void {
    console.log('🧪 Testing INTP vs ESTJ Classification\n');

    // Test 1: Strong INTP pattern
    console.log('1. Strong INTP Pattern:');
    const strongINTP = this.patternGenerator.generateSophisticatedPattern(MBTIType.INTP);
    const strongResult = this.calculator.calculate(strongINTP);
    console.log(`   Result: ${strongResult.type} (confidence: ${strongResult.confidence}%)`);
    console.log(`   Expected: INTP - ${strongResult.type === MBTIType.INTP ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 2: INTP with weak T preference
    console.log('2. INTP with Weak Thinking Preference:');
    const weakTINTP = this.patternGenerator.generateWeakPreferencePattern(MBTIType.INTP, ['thinking']);
    const weakTResult = this.calculator.calculate(weakTINTP);
    console.log(`   Result: ${weakTResult.type} (confidence: ${weakTResult.confidence}%)`);
    const isNTType = ['INTP', 'ENTP', 'INTJ', 'ENTJ'].includes(weakTResult.type);
    console.log(`   Expected: NT type - ${isNTType ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 3: INTP with weak P preference
    console.log('3. INTP with Weak Perceiving Preference:');
    const weakPINTP = this.patternGenerator.generateWeakPreferencePattern(MBTIType.INTP, ['perceiving']);
    const weakPResult = this.calculator.calculate(weakPINTP);
    console.log(`   Result: ${weakPResult.type} (confidence: ${weakPResult.confidence}%)`);
    const isINType = ['INTP', 'INFP', 'ENTP', 'ENFP'].includes(weakPResult.type);
    console.log(`   Expected: NP type - ${isINType ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 4: INTP with both weak T & P preferences  
    console.log('4. INTP with Weak T & P Preferences:');
    const weakTPINTP = this.patternGenerator.generateWeakPreferencePattern(MBTIType.INTP, ['thinking', 'perceiving']);
    const weakTPResult = this.calculator.calculate(weakTPINTP);
    console.log(`   Result: ${weakTPResult.type} (confidence: ${weakTPResult.confidence}%)`);
    // Should NOT be ESTJ - that would be the opposite type!
    const isNotESTJ = weakTPResult.type !== MBTIType.ESTJ;
    const isReasonable = ['INTP', 'INFP', 'ENTP', 'ENFP', 'INTJ'].includes(weakTPResult.type);
    console.log(`   NOT ESTJ: ${isNotESTJ ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Reasonable type: ${isReasonable ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 5: Actual ESTJ pattern for comparison
    console.log('5. Strong ESTJ Pattern:');
    const strongESTJ = this.patternGenerator.generateSophisticatedPattern(MBTIType.ESTJ);
    const estjResult = this.calculator.calculate(strongESTJ);
    console.log(`   Result: ${estjResult.type} (confidence: ${estjResult.confidence}%)`);
    console.log(`   Expected: ESTJ - ${estjResult.type === MBTIType.ESTJ ? '✅ PASS' : '❌ FAIL'}\n`);

    // Show detailed scoring for the problematic case
    console.log('📊 Detailed Analysis of Weak T&P INTP:');
    console.log('   Function Scores:', weakTPResult.scores);
    console.log('   Alternative Types:', weakTPResult.alternativeTypes?.slice(0, 3).map(t => `${t.type}(${t.confidence}%)`).join(', '));
  }
}

// Run the test
const tester = new INTPvsESTJTester();
tester.testINTPVariations();

import { MBTICalculatorFactory } from '../calculation';
import { MBTIType } from '../calculation/types';
import { ResponsePatternGenerator } from './ResponsePatternGenerator';
import { questions } from '../calculation/mbtiData';

const calculator = MBTICalculatorFactory.createTypeFirstCalculator();
const patternGenerator = new ResponsePatternGenerator(questions);

// Test all 16 types to see which ones work and which don't
const allTypes = Object.values(MBTIType);
const results: { [key: string]: { result: string, correct: boolean, confidence: number } } = {};

console.log('=== Testing All 16 MBTI Types ===');
allTypes.forEach(type => {
  const pattern = patternGenerator.generateDeterministicPattern(type);
  const result = calculator.calculate(pattern);
  const correct = result.type === type;
  
  results[type] = {
    result: result.type,
    correct,
    confidence: result.confidence
  };
  
  const status = correct ? '✅' : '❌';
  console.log(`${status} ${type}: got ${result.type} (${result.confidence}% confidence)`);
});

// Summary
const correctCount = Object.values(results).filter(r => r.correct).length;
console.log(`\n=== Summary ===`);
console.log(`Correct: ${correctCount}/16 (${(correctCount/16*100).toFixed(1)}%)`);

console.log('\n=== Failed Types ===');
Object.entries(results).forEach(([expected, result]) => {
  if (!result.correct) {
    console.log(`${expected} → ${result.result}`);
  }
});

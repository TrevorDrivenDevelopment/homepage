import { MBTICalculatorFactory } from '../calculation';
import { MBTIType } from '../calculation/types';
import { ResponsePatternGenerator } from './ResponsePatternGenerator';
import { questions } from '../calculation/mbtiData';

const calculator = MBTICalculatorFactory.createTypeFirstCalculator();
const patternGenerator = new ResponsePatternGenerator(questions);

// Analyze Thinking/Feeling confusion pairs
console.log('=== ANALYZING THINKING/FEELING CONFUSION ===');

const confusionPairs = [
  [MBTIType.INFP, MBTIType.INTP], // Fi vs Ti dominant
  [MBTIType.ENFJ, MBTIType.ENTJ], // Fe vs Te auxiliary  
  [MBTIType.ISFP, MBTIType.ISTP], // Fi vs Ti dominant
  [MBTIType.ESFJ, MBTIType.ESTJ], // Fe vs Te dominant
];

confusionPairs.forEach(([feelingType, thinkingType]) => {
  console.log(`\n--- ${feelingType} vs ${thinkingType} ---`);
  
  const feelingPattern = patternGenerator.generateDeterministicPattern(feelingType);
  const thinkingPattern = patternGenerator.generateDeterministicPattern(thinkingType);
  
  const feelingResult = calculator.calculate(feelingPattern);
  const thinkingResult = calculator.calculate(thinkingPattern);
  
  console.log(`${feelingType}: got ${feelingResult.type} ${feelingResult.type === feelingType ? '✅' : '❌'}`);
  console.log(`${thinkingType}: got ${thinkingResult.type} ${thinkingResult.type === thinkingType ? '✅' : '❌'}`);
  
  // Compare thinking/feeling scores
  console.log(`${feelingType} T/F scores: Ti=${feelingResult.scores.Ti}, Te=${feelingResult.scores.Te}, Fi=${feelingResult.scores.Fi}, Fe=${feelingResult.scores.Fe}`);
  console.log(`${thinkingType} T/F scores: Ti=${thinkingResult.scores.Ti}, Te=${thinkingResult.scores.Te}, Fi=${thinkingResult.scores.Fi}, Fe=${thinkingResult.scores.Fe}`);
});

// Analyze Sensing/Intuition confusion
console.log('\n\n=== ANALYZING SENSING/INTUITION CONFUSION ===');

const sensingIntuitionPairs = [
  [MBTIType.ISTJ, MBTIType.INTJ], // Si vs Ni dominant
  [MBTIType.ESTP, MBTIType.ENTP], // Se vs Ne dominant
];

sensingIntuitionPairs.forEach(([sensingType, intuitionType]) => {
  console.log(`\n--- ${sensingType} vs ${intuitionType} ---`);
  
  const sensingPattern = patternGenerator.generateDeterministicPattern(sensingType);
  const intuitionPattern = patternGenerator.generateDeterministicPattern(intuitionType);
  
  const sensingResult = calculator.calculate(sensingPattern);
  const intuitionResult = calculator.calculate(intuitionPattern);
  
  console.log(`${sensingType}: got ${sensingResult.type} ${sensingResult.type === sensingType ? '✅' : '❌'}`);
  console.log(`${intuitionType}: got ${intuitionResult.type} ${intuitionResult.type === intuitionType ? '✅' : '❌'}`);
  
  // Compare sensing/intuition scores
  console.log(`${sensingType} S/N scores: Si=${sensingResult.scores.Si}, Se=${sensingResult.scores.Se}, Ni=${sensingResult.scores.Ni}, Ne=${sensingResult.scores.Ne}`);
  console.log(`${intuitionType} S/N scores: Si=${intuitionResult.scores.Si}, Se=${intuitionResult.scores.Se}, Ni=${intuitionResult.scores.Ni}, Ne=${intuitionResult.scores.Ne}`);
});

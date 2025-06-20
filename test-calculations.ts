// Simple test for MBTI calculations
import { questions } from './src/apps/personality-test/data/mbtiData';
import { Response, CognitiveFunctionType } from './src/apps/personality-test/mbti';
import { calculateFunctionStackFromResponses, calculateClosestTypes } from './src/apps/personality-test/mbtiCalculations';

// Test with INTJ-like responses (strong Ni, moderate Te, weak Fi, very weak Se)
const intjResponses: Response[] = [
  // Intuition questions - prefer introverted (Ni)
  { questionIndex: 0, value: false }, // Ni: deep single idea vs many ideas
  { questionIndex: 1, value: false }, // Ni: specific vision vs keep options open
  { questionIndex: 2, value: false }, // Ni: deep understanding vs connect many ideas
  { questionIndex: 3, value: false }, // Ni: develop deeply vs generate many
  { questionIndex: 4, value: false }, // Ni: follow intuition vs explore possibilities
  { questionIndex: 5, value: false }, // Ni: deep insights vs connections
  { questionIndex: 6, value: false }, // Ni: clear sense vs seeing connections
  { questionIndex: 7, value: false }, // Ni: insights about outcomes vs creative ideas
  
  // Sensing questions - prefer introverted but weakly (Si over Se, but overall weak)
  { questionIndex: 8, value: false }, // Si: past experience vs present experience
  { questionIndex: 9, value: false }, // Si: step-by-step vs hands-on
  { questionIndex: 10, value: false }, // Si: plan with proven methods vs trial and error
  { questionIndex: 11, value: false }, // Si: consistent routines vs variety
  { questionIndex: 12, value: false }, // Si: tried-and-true vs quick response
  { questionIndex: 13, value: false }, // Si: familiar info vs current info
  { questionIndex: 14, value: false }, // Si: compare to past vs direct experience
  { questionIndex: 15, value: false }, // Si: dependable vs adaptive
  
  // Thinking questions - prefer extroverted (Te)
  { questionIndex: 16, value: true }, // Te: results quickly vs understand deeply
  { questionIndex: 17, value: true }, // Te: organize people vs think through logic
  { questionIndex: 18, value: true }, // Te: facts and practice vs logical sense
  { questionIndex: 19, value: true }, // Te: objective facts vs underlying principles
  { questionIndex: 20, value: true }, // Te: efficient solutions vs understanding systems
  { questionIndex: 21, value: true }, // Te: organize systems vs think thoroughly
  { questionIndex: 22, value: true }, // Te: plans into action vs deeper logic
  { questionIndex: 23, value: true }, // Te: organize efficiently vs figure out complex ideas
  
  // Feeling questions - prefer introverted (Fi)
  { questionIndex: 24, value: false }, // Fi: genuine and true to values vs everyone comfortable
  { questionIndex: 25, value: false }, // Fi: what feels right vs affect others
  { questionIndex: 26, value: false }, // Fi: honest about views vs everyone heard
  { questionIndex: 27, value: false }, // Fi: honest thoughts vs listen to feelings
  { questionIndex: 28, value: false }, // Fi: stick to values vs keep everyone happy
  { questionIndex: 29, value: false }, // Fi: aligns with beliefs vs affects group mood
  { questionIndex: 30, value: false }, // Fi: authentic vs help others feel supported
  { questionIndex: 31, value: false }, // Fi: stand up for what's right vs consider everyone's needs
];

console.log('Testing INTJ-like responses...');
console.log('Expected: Strong Ni (introverted intuition), moderate Te (extroverted thinking)');
console.log('Expected type: INTJ (Ni-Te-Fi-Se)');

const functionStack = calculateFunctionStackFromResponses(intjResponses);
console.log('\nCalculated Function Stack:');
functionStack.forEach((func, index) => {
  const activeName = func.isExtroverted ? func.extroverted : func.introverted;
  const position = ['Dominant', 'Auxiliary', 'Tertiary', 'Inferior'][index];
  console.log(`${position}: ${activeName} (${func.isExtroverted ? 'Extroverted' : 'Introverted'})`);
});

const closestTypes = calculateClosestTypes(functionStack, intjResponses, true);
console.log('\nClosest Types:');
closestTypes.forEach((result, index) => {
  console.log(`${index + 1}. ${result.type} (Score: ${result.score}, Match: ${result.match})`);
});

export {};

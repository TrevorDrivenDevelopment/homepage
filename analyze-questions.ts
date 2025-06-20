import { questions } from './src/apps/personality-test/data/mbtiData';
import { CognitiveFunctionType, QuestionCategory } from './src/apps/personality-test/mbti';

// Analyze question distribution
const analysis = {
  total: questions.length,
  byFunction: {
    [CognitiveFunctionType.INTUITION]: { total: 0, preference: 0, order: 0 },
    [CognitiveFunctionType.SENSING]: { total: 0, preference: 0, order: 0 },
    [CognitiveFunctionType.THINKING]: { total: 0, preference: 0, order: 0 },
    [CognitiveFunctionType.FEELING]: { total: 0, preference: 0, order: 0 }
  }
};

questions.forEach(q => {
  analysis.byFunction[q.functionType].total++;
  if (q.category === QuestionCategory.FUNCTION_PREFERENCE) {
    analysis.byFunction[q.functionType].preference++;
  } else {
    analysis.byFunction[q.functionType].order++;
  }
});

console.log('MBTI Questions Analysis:');
console.log('Total questions:', analysis.total);
console.log('\nBy Function:');
Object.entries(analysis.byFunction).forEach(([func, data]) => {
  console.log(`${func}: ${data.total} total (${data.preference} preference, ${data.order} order)`);
});

// Check question length and clarity
const lengthAnalysis = questions.map((q, i) => ({
  index: i,
  textLength: q.text.length,
  extrovertedLength: q.extroverted.length,
  introvertedLength: q.introverted.length,
  lengthDiff: Math.abs(q.extroverted.length - q.introverted.length)
}));

const avgLengthDiff = lengthAnalysis.reduce((sum, q) => sum + q.lengthDiff, 0) / lengthAnalysis.length;
const maxLengthDiff = Math.max(...lengthAnalysis.map(q => q.lengthDiff));

console.log('\nQuestion Length Analysis:');
console.log('Average length difference between extroverted/introverted options:', Math.round(avgLengthDiff));
console.log('Max length difference:', maxLengthDiff);

const problematicQuestions = lengthAnalysis.filter(q => q.lengthDiff > 50);
if (problematicQuestions.length > 0) {
  console.log('\nQuestions with large length differences (>50 chars):');
  problematicQuestions.forEach(q => {
    const question = questions[q.index];
    console.log(`Question ${q.index}: ${q.lengthDiff} char difference`);
    console.log(`  Text: "${question.text}"`);
    console.log(`  Extroverted (${q.extrovertedLength}): "${question.extroverted}"`);
    console.log(`  Introverted (${q.introvertedLength}): "${question.introverted}"`);
    console.log();
  });
}

// Check for potential bias or unclear wording
console.log('\nChecking for potential issues:');
questions.forEach((q, i) => {
  const extWords = q.extroverted.toLowerCase();
  const intWords = q.introverted.toLowerCase();
  
  // Check for obvious bias words
  const biasWords = ['better', 'worse', 'good', 'bad', 'right', 'wrong', 'should', 'must'];
  const extHasBias = biasWords.some(word => extWords.includes(word));
  const intHasBias = biasWords.some(word => intWords.includes(word));
  
  if (extHasBias || intHasBias) {
    console.log(`Question ${i} may have bias: "${q.text}"`);
  }
  
  // Check for overly complex language
  if (q.extroverted.length > 100 || q.introverted.length > 100) {
    console.log(`Question ${i} may be too complex: "${q.text}"`);
  }
});

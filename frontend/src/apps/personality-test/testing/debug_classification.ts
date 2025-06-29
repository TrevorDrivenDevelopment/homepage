#!/usr/bin/env npx tsx

/**
 * Debug Analysis - Detailed breakdown of classification logic
 */

import * as fs from 'fs';
import { MBTICalculatorFactory } from '../calculation';
import { RESPONSES_FILE, SavedResponseData } from './quick_test';

function debugClassification(): void {
  console.log('🔍 DETAILED CLASSIFICATION DEBUG\n');

  if (!fs.existsSync(RESPONSES_FILE)) {
    console.log('❌ No saved responses found.');
    return;
  }

  const data: SavedResponseData = JSON.parse(fs.readFileSync(RESPONSES_FILE, 'utf8'));
  
  console.log('📊 RAW FUNCTION SCORES ANALYSIS:');
  
  // Create calculator and get detailed breakdown
  const calc = MBTICalculatorFactory.createAccurateCalculator();
  const result = calc.calculate(data.responses);
  
  // Show raw scores
  console.log('Raw Scores:');
  Object.entries(result.scores).forEach(([func, score]) => {
    console.log(`  ${func}: ${Math.round(score * 100) / 100}`);
  });
  
  // Analyze the pattern
  console.log('\n🧠 PATTERN ANALYSIS:');
  
  const scores = result.scores;
  
  // Find dominant function (highest score)
  const functionScores = [
    { name: 'Ti', score: scores.Ti },
    { name: 'Te', score: scores.Te },
    { name: 'Ni', score: scores.Ni },
    { name: 'Ne', score: scores.Ne },
    { name: 'Si', score: scores.Si },
    { name: 'Se', score: scores.Se },
    { name: 'Fi', score: scores.Fi },
    { name: 'Fe', score: scores.Fe }
  ].sort((a, b) => b.score - a.score);
  
  console.log('Function Ranking (strongest to weakest):');
  functionScores.forEach((func, index) => {
    console.log(`  ${index + 1}. ${func.name}: ${Math.round(func.score * 100) / 100}`);
  });
  
  const dominant = functionScores[0];
  const auxiliary = functionScores[1];
  
  console.log(`\n🎯 EXPECTED TYPE ANALYSIS:`);
  console.log(`Dominant Function: ${dominant.name} (${Math.round(dominant.score * 100) / 100})`);
  console.log(`Auxiliary Function: ${auxiliary.name} (${Math.round(auxiliary.score * 100) / 100})`);
  
  // Determine expected type based on dominant/auxiliary
  let expectedType = '';
  if (dominant.name === 'Ti' && auxiliary.name === 'Ne') {
    expectedType = 'INTP';
  } else if (dominant.name === 'Ni' && auxiliary.name === 'Te') {
    expectedType = 'INTJ';
  } else if (dominant.name === 'Te' && auxiliary.name === 'Ni') {
    expectedType = 'ENTJ';
  } else if (dominant.name === 'Ne' && auxiliary.name === 'Ti') {
    expectedType = 'ENTP';
  } else {
    expectedType = 'Unknown pattern';
  }
  
  console.log(`Expected Type: ${expectedType}`);
  console.log(`Actual Result: ${result.type}`);
  console.log(`Match: ${expectedType === result.type ? '✅' : '❌'}`);
  
  console.log(`\n🔍 DISCREPANCY ANALYSIS:`);
  if (expectedType !== result.type) {
    console.log('❌ Classification does not match function scores!');
    console.log('This suggests an issue with:');
    console.log('- Stack building logic');
    console.log('- Type matching strategy');
    console.log('- Traditional dichotomy bonuses affecting cognitive functions incorrectly');
    
    // Check if traditional dichotomies are skewing results
    console.log('\n📈 TRADITIONAL DICHOTOMY IMPACT:');
    
    // Count E/I and J/P responses
    let extroversion = 0, judging = 0;
    
    data.responses.forEach(response => {
      if (response.questionIndex >= 32 && response.questionIndex <= 35) {
        // E/I questions (indices 32-35)
        if (response.value) extroversion++;
      } else if (response.questionIndex >= 36 && response.questionIndex <= 39) {
        // J/P questions (indices 36-39)  
        if (response.value) judging++;
      }
    });
    
    console.log(`Extroversion responses: ${extroversion}/4 (${extroversion > 2 ? 'E' : 'I'} preference)`);
    console.log(`Judging responses: ${judging}/4 (${judging > 2 ? 'J' : 'P'} preference)`);
    
    if (judging > 2) {
      console.log('⚠️  J preference might be boosting Ni over Ti inappropriately');
    }
  }
  
  console.log('\n📋 SYSTEM RECOMMENDATION:');
  if (expectedType === 'INTP' && result.type === 'INTJ') {
    console.log('- Reduce Ni bonus from traditional J preference');
    console.log('- Ensure Ti gets proper boost from traditional I/P preferences');
    console.log('- Check that Ne auxiliary is properly recognized');
  }
}

debugClassification();

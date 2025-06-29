#!/usr/bin/env npx tsx

/**
 * Stack Building Debug - See exactly what stack is being built
 */

import * as fs from 'fs';
import { MBTICalculatorFactory } from '../calculation';
import { RESPONSES_FILE, SavedResponseData } from './quick_test';

function debugStackBuilding(): void {
  console.log('🏗️  STACK BUILDING DEBUG\n');

  if (!fs.existsSync(RESPONSES_FILE)) {
    console.log('❌ No saved responses found.');
    return;
  }

  const data: SavedResponseData = JSON.parse(fs.readFileSync(RESPONSES_FILE, 'utf8'));
  
  // Test with Type-First calculator which should be more straightforward
  const calc = MBTICalculatorFactory.createTypeFirstCalculator();
  const result = calc.calculate(data.responses);
  
  console.log('📊 Function Scores:');
  Object.entries(result.scores).forEach(([func, score]) => {
    console.log(`  ${func}: ${Math.round(score * 100) / 100}`);
  });
  
  console.log('\n🏗️  Built Stack Analysis:');
  console.log(`Result Type: ${result.type}`);
  console.log(`Confidence: ${result.confidence}%`);
  
  // Show the function stack if available
  if (result.stack) {
    console.log('Function Stack:');
    result.stack.forEach((func, index) => {
      const position = ['Dominant', 'Auxiliary', 'Tertiary', 'Inferior'][index];
      const funcName = func.isExtroverted ? func.extroverted : func.introverted;
      console.log(`  ${index + 1}. ${position}: ${funcName} (${func.isExtroverted ? 'Extroverted' : 'Introverted'})`);
    });
  }
  
  // Manual analysis - what SHOULD the stack be?
  console.log('\n🎯 MANUAL ANALYSIS:');
  const scores = result.scores;
  
  // Sort all functions by strength
  const allFunctions = [
    { name: 'Ti', score: scores.Ti, isExtroverted: false },
    { name: 'Te', score: scores.Te, isExtroverted: true },
    { name: 'Ni', score: scores.Ni, isExtroverted: false },
    { name: 'Ne', score: scores.Ne, isExtroverted: true },
    { name: 'Si', score: scores.Si, isExtroverted: false },
    { name: 'Se', score: scores.Se, isExtroverted: true },
    { name: 'Fi', score: scores.Fi, isExtroverted: false },
    { name: 'Fe', score: scores.Fe, isExtroverted: true }
  ].sort((a, b) => b.score - a.score);
  
  console.log('All Functions by Strength:');
  allFunctions.forEach((func, index) => {
    console.log(`  ${index + 1}. ${func.name}: ${Math.round(func.score * 100) / 100} (${func.isExtroverted ? 'E' : 'I'})`);
  });
  
  // Expected INTP stack should be: Ti(dom), Ne(aux), Si(tert), Fe(inf)
  const expectedINTP = [
    { name: 'Ti', score: scores.Ti },
    { name: 'Ne', score: scores.Ne },
    { name: 'Si', score: scores.Si },
    { name: 'Fe', score: scores.Fe }
  ];
  
  console.log('\nExpected INTP Stack Strength:');
  expectedINTP.forEach((func, index) => {
    const position = ['Dominant', 'Auxiliary', 'Tertiary', 'Inferior'][index];
    console.log(`  ${position}: ${func.name} (${Math.round(func.score * 100) / 100})`);
  });
  
  // Expected INTJ stack should be: Ni(dom), Te(aux), Fi(tert), Se(inf)  
  const expectedINTJ = [
    { name: 'Ni', score: scores.Ni },
    { name: 'Te', score: scores.Te },
    { name: 'Fi', score: scores.Fi },
    { name: 'Se', score: scores.Se }
  ];
  
  console.log('\nExpected INTJ Stack Strength:');
  expectedINTJ.forEach((func, index) => {
    const position = ['Dominant', 'Auxiliary', 'Tertiary', 'Inferior'][index];
    console.log(`  ${position}: ${func.name} (${Math.round(func.score * 100) / 100})`);
  });
  
  // Calculate stack strength scores
  const intpStrength = expectedINTP.reduce((sum, func) => sum + func.score, 0);
  const intjStrength = expectedINTJ.reduce((sum, func) => sum + func.score, 0);
  
  console.log(`\n📈 Stack Strength Comparison:`);
  console.log(`INTP Total: ${Math.round(intpStrength * 100) / 100}`);
  console.log(`INTJ Total: ${Math.round(intjStrength * 100) / 100}`);
  console.log(`Winner: ${intpStrength > intjStrength ? 'INTP' : 'INTJ'} should be the result`);
}

debugStackBuilding();

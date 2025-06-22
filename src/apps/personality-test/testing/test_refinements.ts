#!/usr/bin/env npx tsx

/**
 * System Refinement Tester
 * 
 * This script loads your saved responses and tests them against different
 * system configurations to help validate improvements and refinements.
 */

import * as fs from 'fs';
import { MBTICalculatorFactory } from '../calculation';
import { BasicScoringStrategy, EnhancedScoringStrategy, StackAwareScoringStrategy } from '../calculation/ScoringStrategy';
import { RESPONSES_FILE, SavedResponseData } from './quick_test';

function testSystemRefinements(): void {
  console.log('🔬 MBTI System Refinement Testing\n');

  if (!fs.existsSync(RESPONSES_FILE)) {
    console.log('❌ No saved responses found.');
    console.log('💡 Run: npx tsx interactive_test.ts');
    return;
  }

  const data: SavedResponseData = JSON.parse(fs.readFileSync(RESPONSES_FILE, 'utf8'));
  console.log(`📅 Testing responses from: ${new Date(data.timestamp).toLocaleString()}\n`);

  // Test different calculator configurations
  const configurations = [
    {
      name: 'Current System (Accurate)',
      calc: MBTICalculatorFactory.createAccurateCalculator()
    },
    {
      name: 'Type-First Approach',
      calc: MBTICalculatorFactory.createTypeFirstCalculator()
    }
  ];

  configurations.forEach(({ name, calc }, index) => {
    console.log(`--- ${name} ---`);
    
    const result = calc.calculate(data.responses);
    
    console.log(`🎯 Result: ${result.type} (${result.confidence}% confidence)`);
    
    // Format function stack properly
    if (result.stack && Array.isArray(result.stack)) {
      const stackNames = result.stack.map(func => 
        func.isExtroverted ? func.extroverted : func.introverted
      );
      console.log(`📊 Stack: ${stackNames.join(' → ')}`);
    } else {
      console.log('📊 Stack: Not available');
    }
    
    // Show key function scores that matter for classification
    const keyScores = ['Ti', 'Te', 'Ni', 'Ne'].map(func => 
      `${func}: ${Math.round(result.scores[func as keyof typeof result.scores] * 100) / 100}`
    ).join(' | ');
    console.log(`⚖️  Key Scores: ${keyScores}`);
    
    if (result.alternativeTypes && result.alternativeTypes.length > 0) {
      const top3 = result.alternativeTypes.slice(0, 3).map(t => 
        `${t.type}(${t.confidence}%)`
      ).join(', ');
      console.log(`🔄 Alternatives: ${top3}`);
    }
    
    console.log('');
  });

  // Show scoring strategy comparison
  console.log('--- Scoring Strategy Comparison ---');
  const baseCalc = MBTICalculatorFactory.createAccurateCalculator();
  
  const strategies = [
    { name: 'Basic', strategy: new BasicScoringStrategy() },
    { name: 'Enhanced', strategy: new EnhancedScoringStrategy() },
    { name: 'Stack-Aware', strategy: new StackAwareScoringStrategy() }
  ];

  strategies.forEach(({ name, strategy }) => {
    baseCalc.setScoringStrategy(strategy);
    const result = baseCalc.calculate(data.responses);
    console.log(`${name} Strategy: ${result.type} (${result.confidence}%)`);
  });

  console.log('\n✅ Refinement testing completed!');
}

// Run if executed directly
if (require.main === module) {
  testSystemRefinements();
}

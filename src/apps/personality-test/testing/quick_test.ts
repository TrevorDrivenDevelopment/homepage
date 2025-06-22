#!/usr/bin/env npx tsx

/**
 * Simple Response Tester - Load saved responses and test quickly
 * 
 * This is a lightweight version that just loads your saved responses
 * and runs them through the current system configuration.
 */

import * as fs from 'fs';
import * as path from 'path';
import { MBTICalculatorFactory } from '../calculation';
import { Response } from '../calculation/types';

const RESPONSES_FILE = path.join(__dirname, 'my_responses.json');

interface SavedResponseData {
  timestamp: string;
  responses: Response[];
  questionTexts: string[];
}

function quickTest(): void {
  console.log('⚡ Quick MBTI Test with Saved Responses\n');

  if (!fs.existsSync(RESPONSES_FILE)) {
    console.log('❌ No saved responses found.');
    console.log('💡 Run the interactive test first: npx tsx interactive_test.ts');
    return;
  }

  try {
    const data: SavedResponseData = JSON.parse(fs.readFileSync(RESPONSES_FILE, 'utf8'));
    
    console.log(`📅 Using responses from: ${new Date(data.timestamp).toLocaleString()}`);
    console.log(`📝 Total questions answered: ${data.responses.length}/40\n`);

    // Test with current system
    const calc = MBTICalculatorFactory.createAccurateCalculator();
    const result = calc.calculate(data.responses);

    console.log('🎯 CURRENT RESULT:');
    console.log(`   Type: ${result.type}`);
    console.log(`   Confidence: ${result.confidence}%`);
    
    // Format function stack properly
    if (result.stack && Array.isArray(result.stack)) {
      const stackNames = result.stack.map(func => 
        func.isExtroverted ? func.extroverted : func.introverted
      );
      console.log(`   Function Stack: ${stackNames.join(' → ')}\n`);
    } else {
      console.log('   Function Stack: Not available\n');
    }

    console.log('📊 DETAILED FUNCTION SCORES:');
    
    // Group and display scores nicely
    const functionPairs = [
      { name: 'Intuition', ext: 'Ne', int: 'Ni' },
      { name: 'Sensing', ext: 'Se', int: 'Si' },
      { name: 'Thinking', ext: 'Te', int: 'Ti' },
      { name: 'Feeling', ext: 'Fe', int: 'Fi' }
    ];

    functionPairs.forEach(({ name, ext, int }) => {
      const extScore = Math.round(result.scores[ext as keyof typeof result.scores] * 100) / 100;
      const intScore = Math.round(result.scores[int as keyof typeof result.scores] * 100) / 100;
      const preference = extScore > intScore ? `${ext} focused` : `${int} focused`;
      const strength = Math.abs(extScore - intScore);
      
      console.log(`   ${name}: ${preference} (${Math.round(strength * 100) / 100})`);
    });

    if (result.alternativeTypes && result.alternativeTypes.length > 0) {
      console.log('\n🔄 ALTERNATIVE TYPES:');
      result.alternativeTypes.slice(0, 5).forEach((alt, index) => {
        console.log(`   ${index + 1}. ${alt.type} (${alt.confidence}%)`);
      });
    }

    console.log('\n✅ Test completed successfully!');
    console.log('💡 To re-answer questions: npx tsx interactive_test.ts');

  } catch (error) {
    console.error('❌ Error reading saved responses:', error);
    console.log('💡 Try running the interactive test to create new responses.');
  }
}

// Export for use in other test files
export { RESPONSES_FILE };
export type { SavedResponseData };

// Run if executed directly
if (require.main === module) {
  quickTest();
}

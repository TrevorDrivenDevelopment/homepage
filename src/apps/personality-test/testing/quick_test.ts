#!/usr/bin/env npx tsx

/**
 * Simple Response Tester - Load saved responses and test quickly
 * 
 * This tool loads saved responses and runs them through the current system.
 * Now supports testing your personal responses or any of the 16 deterministic type patterns.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { MBTICalculatorFactory } from '../calculation';
import { Response, MBTIType } from '../calculation/types';

const RESPONSES_FILE = path.join(__dirname, 'my_responses.json');
const DETERMINISTIC_DIR = path.join(__dirname, 'deterministic-types');

interface SavedResponseData {
  timestamp: string;
  responses: Response[];
  questionTexts: string[];
}

interface TypeResponseData {
  timestamp: string;
  type: MBTIType;
  description: string;
  responses: Array<{ questionIndex: number; value: boolean }>;
  questionTexts: string[];
}

async function selectResponseSource(): Promise<{ data: SavedResponseData; sourceType: string; expectedType?: MBTIType }> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = (question: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(question, (answer) => resolve(answer));
    });
  };

  console.log('📋 Select Response Source:\n');
  console.log('1. Your personal responses (my_responses.json)');
  console.log('2. Test a specific MBTI type (deterministic patterns)');
  console.log('3. List all available deterministic types\n');

  const choice = await askQuestion('Your choice (1/2/3): ');

  if (choice === '1') {
    rl.close();
    if (!fs.existsSync(RESPONSES_FILE)) {
      throw new Error('❌ No personal responses found. Run: npx tsx interactive_test.ts');
    }
    const data = JSON.parse(fs.readFileSync(RESPONSES_FILE, 'utf8'));
    return { data, sourceType: 'Personal Responses' };
  } else if (choice === '2') {
    const typeChoice = await askQuestion('\nEnter MBTI type (e.g., INTP, INTJ, ENFP): ');
    const normalizedType = typeChoice.trim().toUpperCase();
    
    rl.close();
    
    if (!Object.values(MBTIType).includes(normalizedType as MBTIType)) {
      throw new Error(`❌ Invalid MBTI type: ${normalizedType}`);
    }
    
    const filename = `${normalizedType.toLowerCase()}_responses.json`;
    const filepath = path.join(DETERMINISTIC_DIR, filename);
    
    if (!fs.existsSync(filepath)) {
      throw new Error(`❌ Deterministic responses for ${normalizedType} not found`);
    }
    
    const typeData: TypeResponseData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    // Convert to SavedResponseData format
    const data: SavedResponseData = {
      timestamp: typeData.timestamp,
      responses: typeData.responses.map(r => ({ questionIndex: r.questionIndex, value: r.value })),
      questionTexts: typeData.questionTexts
    };
    
    return { 
      data, 
      sourceType: `Deterministic ${normalizedType}`, 
      expectedType: normalizedType as MBTIType 
    };
  } else if (choice === '3') {
    rl.close();
    console.log('\n📁 Available Deterministic Types:');
    
    const indexPath = path.join(DETERMINISTIC_DIR, 'index.json');
    if (fs.existsSync(indexPath)) {
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      index.files.forEach((file: any, i: number) => {
        console.log(`${i + 1}. ${file.type} - ${file.description.split(' designed')[0]}`);
      });
    } else {
      // Fallback: list files directly
      const files = fs.readdirSync(DETERMINISTIC_DIR).filter(f => f.endsWith('_responses.json'));
      files.forEach((file, i) => {
        const type = file.replace('_responses.json', '').toUpperCase();
        console.log(`${i + 1}. ${type}`);
      });
    }
    
    console.log('\n💡 Run again and choose option 2 to test a specific type');
    process.exit(0);
  } else {
    rl.close();
    throw new Error('❌ Invalid choice');
  }
}

async function quickTest(): Promise<void> {
  console.log('⚡ Quick MBTI Test with Saved Responses\n');

  try {
    const { data, sourceType, expectedType } = await selectResponseSource();
    
    console.log(`📅 Using responses from: ${new Date(data.timestamp).toLocaleString()}`);
    console.log(`📝 Source: ${sourceType}`);
    if (expectedType) {
      console.log(`🎯 Expected Type: ${expectedType}`);
    }
    console.log(`📋 Total questions answered: ${data.responses.length}/40\n`);

    // Test with current system
    const calc = MBTICalculatorFactory.createAccurateCalculator();
    const result = calc.calculate(data.responses);

    console.log('🎯 CURRENT RESULT:');
    console.log(`   Type: ${result.type}`);
    console.log(`   Confidence: ${result.confidence}%`);
    
    // Show if result matches expected type
    if (expectedType) {
      const isCorrect = result.type === expectedType;
      console.log(`   Expected: ${expectedType} - ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
    }
    
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
    if (sourceType === 'Personal Responses') {
      console.log('💡 To re-answer questions: npx tsx interactive_test.ts');
    } else {
      console.log('💡 To test your personal responses: npx tsx quick_test.ts (choose option 1)');
    }

  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
    console.log('💡 Try running: npx tsx interactive_test.ts for personal responses');
    console.log('💡 Or: npx tsx generate_deterministic.ts to create type patterns');
  }
}

// Export for use in other test files
export { RESPONSES_FILE, DETERMINISTIC_DIR };
export type { SavedResponseData, TypeResponseData };

// Run if executed directly
if (require.main === module) {
  quickTest().catch(console.error);
}

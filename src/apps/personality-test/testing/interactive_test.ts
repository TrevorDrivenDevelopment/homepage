#!/usr/bin/env npx tsx

/**
 * Interactive Test Runner - Answer questions once, test system refinements repeatedly
 * 
 * This tool allows you to:
 * 1. Answer all questions once and save your responses
 * 2. Run those responses through different calculator configurations
 * 3. Test system refinements without re-answering questions
 * 
 * Usage:
 * - First run: Answer questions and save responses
 * - Subsequent runs: Load saved responses and test different configurations
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { questions } from '../calculation/mbtiData';
import { MBTICalculatorFactory } from '../calculation';
import { Response } from '../calculation/types';

const RESPONSES_FILE = path.join(__dirname, 'my_responses.json');

interface SavedResponseData {
  timestamp: string;
  responses: Response[];
  questionTexts: string[]; // For verification
}

class InteractiveTestRunner {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async run(): Promise<void> {
    console.log('🧪 Interactive MBTI Test Runner\n');
    console.log('This tool lets you answer questions once and test system refinements repeatedly.\n');

    if (fs.existsSync(RESPONSES_FILE)) {
      console.log('📁 Found existing responses file.');
      const choice = await this.askQuestion('Do you want to (1) Use existing responses, (2) Re-answer questions, or (3) View existing responses? [1/2/3]: ');
      
      if (choice === '2') {
        await this.collectResponses();
      } else if (choice === '3') {
        await this.viewExistingResponses();
        return;
      }
    } else {
      console.log('📝 No existing responses found. Let\'s collect your answers.\n');
      await this.collectResponses();
    }

    await this.runCalculations();
    this.rl.close();
  }

  private async collectResponses(): Promise<void> {
    console.log('\n📋 Please answer each question by choosing the option that best describes you:');
    console.log('Enter "A" for the first option or "B" for the second option.\n');
    console.log('You can also enter "?" to see the question again or "quit" to exit.\n');

    const responses: Response[] = [];
    const questionTexts: string[] = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      questionTexts.push(question.text);
      
      console.log(`\n--- Question ${i + 1} of ${questions.length} ---`);
      console.log(`Category: ${question.category} | Function: ${question.functionType}`);
      console.log(`\n${question.text}`);
      console.log(`A) ${question.extroverted}`);
      console.log(`B) ${question.introverted}`);

      let answer: string;
      do {
        answer = await this.askQuestion('\nYour choice (A/B): ');
        answer = answer.toLowerCase().trim();

        if (answer === 'quit') {
          console.log('Exiting...');
          process.exit(0);
        } else if (answer === '?') {
          console.log(`\n${question.text}`);
          console.log(`A) ${question.extroverted}`);
          console.log(`B) ${question.introverted}`);
        } else if (answer !== 'a' && answer !== 'b') {
          console.log('Please enter "A" or "B" (or "?" to repeat question)');
        }
      } while (answer !== 'a' && answer !== 'b');

      // A = extroverted (true), B = introverted (false)
      const value = answer === 'a';
      responses.push({ questionIndex: i, value });

      // Show progress
      const progress = Math.round(((i + 1) / questions.length) * 100);
      console.log(`✅ Answer recorded. Progress: ${progress}%`);
    }

    // Save responses
    const saveData: SavedResponseData = {
      timestamp: new Date().toISOString(),
      responses,
      questionTexts
    };

    fs.writeFileSync(RESPONSES_FILE, JSON.stringify(saveData, null, 2));
    console.log(`\n💾 Responses saved to: ${RESPONSES_FILE}`);
  }

  private async viewExistingResponses(): Promise<void> {
    const data: SavedResponseData = JSON.parse(fs.readFileSync(RESPONSES_FILE, 'utf8'));
    
    console.log(`\n📊 Existing Responses (saved: ${new Date(data.timestamp).toLocaleString()})\n`);
    
    data.responses.forEach((response, index) => {
      const question = questions[response.questionIndex];
      const chosen = response.value ? question.extroverted : question.introverted;
      const chosenLetter = response.value ? 'A' : 'B';
      
      console.log(`${index + 1}. ${question.text}`);
      console.log(`   Choice: ${chosenLetter}) ${chosen}`);
      console.log(`   (${question.functionType} - ${question.category})\n`);
    });
  }

  private async runCalculations(): Promise<void> {
    console.log('\n🧮 Running Calculations with Your Responses...\n');

    const data: SavedResponseData = JSON.parse(fs.readFileSync(RESPONSES_FILE, 'utf8'));
    const responses = data.responses;

    console.log(`📅 Using responses from: ${new Date(data.timestamp).toLocaleString()}`);
    console.log(`📝 Total responses: ${responses.length}\n`);

    // Test with different calculator configurations
    const calculators = [
      { name: 'Accurate Calculator', calc: MBTICalculatorFactory.createAccurateCalculator() },
      { name: 'Type-First Calculator', calc: MBTICalculatorFactory.createTypeFirstCalculator() }
    ];

    calculators.forEach(({ name, calc }) => {
      console.log(`--- ${name} ---`);
      const result = calc.calculate(responses);
      
      console.log(`🎯 Result: ${result.type} (${result.confidence}% confidence)`);
      console.log(`📊 Function Stack: ${result.stack.join(' → ')}`);
      
      // Round scores for clean display
      const roundedScores = Object.entries(result.scores).map(([func, score]) => 
        `${func}: ${Math.round(score * 100) / 100}`
      ).join(', ');
      console.log(`⚖️  Function Scores: ${roundedScores}`);
      
      if (result.alternativeTypes && result.alternativeTypes.length > 0) {
        const alternatives = result.alternativeTypes.slice(0, 3).map(t => 
          `${t.type}(${t.confidence}%)`
        ).join(', ');
        console.log(`🔄 Alternative Types: ${alternatives}`);
      }
      
      console.log('');
    });

    // Ask if user wants to run again or make changes
    const choice = await this.askQuestion('Do you want to (1) Run again, (2) Re-answer questions, or (3) Exit? [1/2/3]: ');
    
    if (choice === '1') {
      await this.runCalculations();
    } else if (choice === '2') {
      await this.collectResponses();
      await this.runCalculations();
    }
  }

  private askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }
}

// Also create a simple non-interactive runner for quick testing
export function runSavedResponses(): void {
  if (!fs.existsSync(RESPONSES_FILE)) {
    console.log('❌ No saved responses found. Run the interactive version first.');
    return;
  }

  const data: SavedResponseData = JSON.parse(fs.readFileSync(RESPONSES_FILE, 'utf8'));
  console.log('🧮 Quick Test with Saved Responses\n');
  console.log(`📅 From: ${new Date(data.timestamp).toLocaleString()}\n`);

  const calc = MBTICalculatorFactory.createAccurateCalculator();
  const result = calc.calculate(data.responses);

  console.log(`🎯 Result: ${result.type} (${result.confidence}% confidence)`);
  console.log(`📊 Function Stack: ${result.stack.join(' → ')}`);
  
  const roundedScores = Object.entries(result.scores).map(([func, score]) => 
    `${func}: ${Math.round(score * 100) / 100}`
  ).join(', ');
  console.log(`⚖️  Scores: ${roundedScores}`);
}

// Run the interactive version if this file is executed directly
if (require.main === module) {
  const runner = new InteractiveTestRunner();
  runner.run().catch(console.error);
}

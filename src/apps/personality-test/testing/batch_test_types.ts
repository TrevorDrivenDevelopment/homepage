#!/usr/bin/env npx tsx

/**
 * Batch Test All Deterministic Types
 * 
 * This script tests all 16 deterministic response patterns to validate
 * that each pattern correctly classifies as its intended type.
 */

import * as fs from 'fs';
import * as path from 'path';
import { MBTICalculatorFactory } from '../calculation';
import { MBTIType } from '../calculation/types';

const DETERMINISTIC_DIR = path.join(__dirname, 'deterministic-types');

interface TypeResponseData {
  timestamp: string;
  type: MBTIType;
  description: string;
  responses: Array<{ questionIndex: number; value: boolean }>;
  questionTexts: string[];
}

function batchTestAllTypes(): void {
  console.log('🔬 Batch Testing All Deterministic MBTI Types\n');

  const calc = MBTICalculatorFactory.createAccurateCalculator();
  const allTypes = Object.values(MBTIType);
  
  let correctCount = 0;
  let totalCount = 0;
  const results: Array<{ 
    expected: MBTIType; 
    actual: MBTIType; 
    confidence: number; 
    correct: boolean;
    alternatives: string;
  }> = [];

  allTypes.forEach(expectedType => {
    const filename = `${expectedType.toLowerCase()}_responses.json`;
    const filepath = path.join(DETERMINISTIC_DIR, filename);
    
    if (!fs.existsSync(filepath)) {
      console.log(`❌ Missing file: ${filename}`);
      return;
    }
    
    try {
      const typeData: TypeResponseData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      const responses = typeData.responses.map(r => ({ 
        questionIndex: r.questionIndex, 
        value: r.value 
      }));
      
      const result = calc.calculate(responses);
      const isCorrect = result.type === expectedType;
      
      if (isCorrect) correctCount++;
      totalCount++;
      
      // Get top 3 alternatives
      const alternatives = result.alternativeTypes?.slice(0, 3)
        .map(alt => `${alt.type}(${alt.confidence}%)`)
        .join(', ') || 'None';
      
      results.push({
        expected: expectedType,
        actual: result.type,
        confidence: result.confidence,
        correct: isCorrect,
        alternatives
      });
      
      const status = isCorrect ? '✅' : '❌';
      console.log(`${status} ${expectedType}: ${result.type} (${result.confidence}%)`);
      
      if (!isCorrect) {
        console.log(`   Expected: ${expectedType}, Got: ${result.type}`);
        console.log(`   Alternatives: ${alternatives}`);
      }
      
    } catch (error) {
      console.log(`❌ Error testing ${expectedType}: ${error}`);
    }
  });

  // Summary
  console.log('\n📊 BATCH TEST SUMMARY:');
  console.log(`Overall Accuracy: ${correctCount}/${totalCount} (${Math.round(correctCount/totalCount*100)}%)`);
  
  // Show incorrect classifications
  const incorrect = results.filter(r => !r.correct);
  if (incorrect.length > 0) {
    console.log('\n❌ Incorrect Classifications:');
    incorrect.forEach(r => {
      console.log(`   ${r.expected} → ${r.actual} (${r.confidence}%)`);
    });
  }
  
  // Show low confidence results (even if correct)
  const lowConfidence = results.filter(r => r.confidence < 80);
  if (lowConfidence.length > 0) {
    console.log('\n⚠️  Low Confidence Results (<80%):');
    lowConfidence.forEach(r => {
      const status = r.correct ? '✅' : '❌';
      console.log(`   ${status} ${r.expected}: ${r.confidence}%`);
    });
  }
  
  console.log('\n✅ Batch testing completed!');
}

// Run if executed directly
if (require.main === module) {
  batchTestAllTypes();
}

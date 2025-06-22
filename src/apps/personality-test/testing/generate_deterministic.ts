#!/usr/bin/env npx tsx

/**
 * Generate deterministic response files for all 16 MBTI types
 */

import * as fs from 'fs';
import * as path from 'path';
import { questions } from '../calculation/mbtiData';
import { MBTIType } from '../calculation/types';
import { ResponsePatternGenerator } from './ResponsePatternGenerator';

const DETERMINISTIC_DIR = path.join(__dirname, 'deterministic-types');

interface TypeResponseData {
  timestamp: string;
  type: MBTIType;
  description: string;
  responses: Array<{ questionIndex: number; value: boolean }>;
  questionTexts: string[];
}

function generateDeterministicResponses(): void {
  console.log('🔧 Generating Deterministic Response Files for All MBTI Types\n');

  const generator = new ResponsePatternGenerator(questions);
  
  // Ensure directory exists
  if (!fs.existsSync(DETERMINISTIC_DIR)) {
    fs.mkdirSync(DETERMINISTIC_DIR, { recursive: true });
  }

  const allTypes = Object.values(MBTIType);
  
  allTypes.forEach(type => {
    console.log(`Generating responses for ${type}...`);
    
    // Generate sophisticated pattern for this type
    const responses = generator.generateSophisticatedPattern(type);
    
    // Get type description
    const descriptions: Record<MBTIType, string> = {
      [MBTIType.INTJ]: 'The Architect - Strategic, innovative, and independent thinkers',
      [MBTIType.INTP]: 'The Thinker - Logical, analytical, and curious minds',
      [MBTIType.ENTJ]: 'The Commander - Natural leaders who are decisive and strategic',
      [MBTIType.ENTP]: 'The Debater - Creative, quick-witted innovators',
      [MBTIType.INFJ]: 'The Advocate - Insightful, empathetic idealists',
      [MBTIType.INFP]: 'The Mediator - Creative, authentic individuals',
      [MBTIType.ENFJ]: 'The Protagonist - Charismatic, inspiring leaders',
      [MBTIType.ENFP]: 'The Campaigner - Enthusiastic, creative free spirits',
      [MBTIType.ISTJ]: 'The Logistician - Practical, reliable, and methodical',
      [MBTIType.ISFJ]: 'The Protector - Warm, conscientious caregivers',
      [MBTIType.ESTJ]: 'The Executive - Organized, decisive administrators',
      [MBTIType.ESFJ]: 'The Consul - Caring, social harmony-seekers',
      [MBTIType.ISTP]: 'The Virtuoso - Practical problem-solvers',
      [MBTIType.ISFP]: 'The Adventurer - Gentle, artistic souls',
      [MBTIType.ESTP]: 'The Entrepreneur - Energetic, adaptable risk-takers',
      [MBTIType.ESFP]: 'The Entertainer - Spontaneous, enthusiastic performers'
    };
    
    const data: TypeResponseData = {
      timestamp: new Date().toISOString(),
      type,
      description: descriptions[type],
      responses: responses.map(r => ({ questionIndex: r.questionIndex, value: r.value || false })),
      questionTexts: questions.map(q => q.text)
    };
    
    const filename = `${type.toLowerCase()}_responses.json`;
    const filepath = path.join(DETERMINISTIC_DIR, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`  ✅ ${filename} created`);
  });

  // Create an index file for easy reference
  const indexData = {
    generated: new Date().toISOString(),
    description: 'Deterministic response patterns for all 16 MBTI types',
    files: allTypes.map(type => ({
      type,
      filename: `${type.toLowerCase()}_responses.json`,
      description: `Responses designed to produce ${type} classification`
    }))
  };
  
  fs.writeFileSync(
    path.join(DETERMINISTIC_DIR, 'index.json'), 
    JSON.stringify(indexData, null, 2)
  );
  
  console.log(`\n🎉 Generated ${allTypes.length} deterministic response files!`);
  console.log(`📁 Files saved to: ${DETERMINISTIC_DIR}`);
  console.log('💡 Use the updated quick_test.ts to test specific types');
}

// Run if executed directly
if (require.main === module) {
  generateDeterministicResponses();
}

import { Question, MBTITypeInfo } from '../types/mbti';

// Question ID Registry — IDs are stable across updates.
// When adding new questions, use the next available numeric ID or a prefixed ID.
// NEVER reuse or change an existing ID, as users may have exported results referencing them.
// Current IDs: 1-38 (cognitive), attn-1 (attention check), ei-1 to ei-3 (E/I orientation)
export const QUESTION_SCHEMA_VERSION = 2;

export const questions: Question[] = [
  // ===== Ni/Ne QUESTIONS (8 total: 4 preference, 4 order) =====

  // Tier 1 - High discrimination
  { 
    id: '1', 
    text: 'When brainstorming, how do you prefer to approach ideas?', 
    optionA: 'Explore many different possibilities and connections',
    optionB: 'Focus deeply on one compelling insight until it crystallizes',
    functionType: 'Ni/Ne',
    category: 'function-preference',
    discriminationTier: 1,
    consistencyPairId: 'nine-1'
  },
  // Tier 2, REVERSED
  { 
    id: '2', 
    text: 'How do you typically think about the future?', 
    optionA: 'Trust a clear inner vision of how things will unfold',
    optionB: 'Imagine many different scenarios and keep options open',
    functionType: 'Ni/Ne',
    category: 'function-preference',
    reversed: true,
    discriminationTier: 2
  },
  // Tier 2
  { 
    id: '37', 
    text: 'When exploring new concepts, you prefer to:', 
    optionA: 'See connections to many other ideas and discuss possibilities',
    optionB: 'Reflect on the deeper meaning before sharing your insights',
    functionType: 'Ni/Ne',
    category: 'function-preference',
    discriminationTier: 2
  },
  // Tier 2, REVERSED
  { 
    id: '38', 
    text: 'Your approach to creativity tends to be:', 
    optionA: 'Developing insights through quiet reflection and internal synthesis',
    optionB: 'Building ideas rapidly by bouncing them off others',
    functionType: 'Ni/Ne',
    category: 'function-preference',
    reversed: true,
    discriminationTier: 2
  },
  // Tier 3
  { 
    id: '9', 
    text: 'When facing a major life decision, what do you rely on most?', 
    optionA: 'Exploring all possibilities and brainstorming creative solutions',
    optionB: 'Deep reflection and trusting your inner knowing about the right path',
    functionType: 'Ni/Ne',
    category: 'function-order',
    discriminationTier: 3
  },
  // Tier 3, REVERSED
  { 
    id: '30', 
    text: 'What feels like your most developed mental process?', 
    optionA: 'Having deep insights and a clear sense of direction',
    optionB: 'Generating innovative ideas and seeing connections everywhere',
    functionType: 'Ni/Ne',
    category: 'function-order',
    reversed: true,
    discriminationTier: 3,
    consistencyPairId: 'nine-1'
  },
  // Tier 3
  { 
    id: '24', 
    text: 'What drives your decision-making process most strongly?', 
    optionA: 'Connecting dots between ideas and seeing future potential',
    optionB: 'Having a clear, focused vision of what will happen',
    functionType: 'Ni/Ne',
    category: 'function-order',
    discriminationTier: 3
  },
  // Tier 3, REVERSED
  { 
    id: '34', 
    text: 'When you\'re in your element, you tend to:', 
    optionA: 'Have crystal clear insights about what will work',
    optionB: 'Generate lots of ideas and see possibilities everywhere',
    functionType: 'Ni/Ne',
    category: 'function-order',
    reversed: true,
    discriminationTier: 3
  },

  // ===== Si/Se QUESTIONS (8 total: 4 preference, 4 order) =====

  // Tier 1 - High discrimination
  { 
    id: '3', 
    text: 'How do you prefer to respond to new situations?', 
    optionA: 'Engage directly and respond to what\'s happening in the moment',
    optionB: 'Compare the situation to past experiences and proven approaches',
    functionType: 'Si/Se',
    category: 'function-preference',
    discriminationTier: 1,
    consistencyPairId: 'sise-1'
  },
  // Tier 2, REVERSED
  { 
    id: '4', 
    text: 'When processing information, what do you focus on?', 
    optionA: 'How it relates to your personal history and established methods',
    optionB: 'What\'s happening right now in your immediate environment',
    functionType: 'Si/Se',
    category: 'function-preference',
    reversed: true,
    discriminationTier: 2
  },
  // Tier 2
  { 
    id: '18', 
    text: 'When learning something new, you prefer to:', 
    optionA: 'Jump right in and learn through hands-on experience',
    optionB: 'Study it carefully and relate it to things you already know',
    functionType: 'Si/Se',
    category: 'function-preference',
    discriminationTier: 2
  },
  // Tier 2, REVERSED
  { 
    id: '21', 
    text: 'In your ideal work environment, you would:', 
    optionA: 'Follow established routines and proven methods',
    optionB: 'Have variety and spontaneity in your daily tasks',
    functionType: 'Si/Se',
    category: 'function-preference',
    reversed: true,
    discriminationTier: 2
  },
  // Tier 3
  { 
    id: '22', 
    text: 'What feels like your core strength?', 
    optionA: 'Being present and adaptable to immediate circumstances',
    optionB: 'Learning from experience and maintaining consistent routines',
    functionType: 'Si/Se',
    category: 'function-order',
    discriminationTier: 3,
    consistencyPairId: 'sise-1'
  },
  // Tier 3, REVERSED
  { 
    id: '25', 
    text: 'Which describes your natural information processing style?', 
    optionA: 'Carefully comparing new information to what you already know',
    optionB: 'Quick to act on immediate sensory information',
    functionType: 'Si/Se',
    category: 'function-order',
    reversed: true,
    discriminationTier: 3
  },
  // Tier 3
  { 
    id: '28', 
    text: 'What represents your dominant way of understanding the world?', 
    optionA: 'Through immediate sensory engagement and real-time action',
    optionB: 'Through personal experience and proven methods',
    functionType: 'Si/Se',
    category: 'function-order',
    discriminationTier: 3
  },
  // Tier 3, REVERSED
  { 
    id: '32', 
    text: 'People would describe your strongest trait as:', 
    optionA: 'Being reliable and consistent in your approach',
    optionB: 'Being spontaneous and responsive to the moment',
    functionType: 'Si/Se',
    category: 'function-order',
    reversed: true,
    discriminationTier: 3
  },

  // ===== Ti/Te QUESTIONS (8 total: 4 preference, 4 order) =====

  // Tier 1 - High discrimination
  { 
    id: '5', 
    text: 'How do you prefer to approach problem-solving?', 
    optionA: 'Design efficient systems and organize resources to achieve results',
    optionB: 'Build a thorough internal understanding of how things work',
    functionType: 'Ti/Te',
    category: 'function-preference',
    discriminationTier: 1,
    consistencyPairId: 'tite-1'
  },
  // Tier 2, REVERSED
  { 
    id: '6', 
    text: 'When working on solutions, what do you prioritize?', 
    optionA: 'Developing a deep understanding of underlying principles',
    optionB: 'Achieving measurable results through organized execution',
    functionType: 'Ti/Te',
    category: 'function-preference',
    reversed: true,
    discriminationTier: 2
  },
  // Tier 2
  { 
    id: '13', 
    text: 'When analyzing a problem, what do you prioritize?', 
    optionA: 'Objective facts and measurable outcomes',
    optionB: 'Understanding the internal logical framework behind it',
    functionType: 'Ti/Te',
    category: 'function-preference',
    discriminationTier: 2
  },
  // Tier 2, REVERSED
  { 
    id: '19', 
    text: 'When someone proposes a new system or process, you first consider:', 
    optionA: 'Whether its internal logic is sound and consistent',
    optionB: 'Whether it will produce efficient, measurable improvements',
    functionType: 'Ti/Te',
    category: 'function-preference',
    reversed: true,
    discriminationTier: 2
  },
  // Tier 3
  { 
    id: '10', 
    text: 'When working with information, your first instinct is to:', 
    optionA: 'Organize it into actionable categories and clear hierarchies',
    optionB: 'Examine the internal logic and look for inconsistencies',
    functionType: 'Ti/Te',
    category: 'function-order',
    discriminationTier: 3
  },
  // Tier 3, REVERSED
  { 
    id: '12', 
    text: 'Your colleagues would say you excel at:', 
    optionA: 'Finding logical flaws and understanding complex systems',
    optionB: 'Creating efficient processes and driving measurable progress',
    functionType: 'Ti/Te',
    category: 'function-order',
    reversed: true,
    discriminationTier: 3
  },
  // Tier 3
  { 
    id: '31', 
    text: 'When working through complex problems, you naturally:', 
    optionA: 'Organize external resources and focus on measurable results',
    optionB: 'Analyze the internal logic until you understand the principles',
    functionType: 'Ti/Te',
    category: 'function-order',
    discriminationTier: 3,
    consistencyPairId: 'tite-1'
  },
  // Tier 3, REVERSED
  { 
    id: '35', 
    text: 'Others often rely on you for:', 
    optionA: 'Understanding complex concepts and finding logical flaws',
    optionB: 'Getting things done efficiently and systematically',
    functionType: 'Ti/Te',
    category: 'function-order',
    reversed: true,
    discriminationTier: 3
  },

  // ===== Fi/Fe QUESTIONS (8 total: 4 preference, 4 order) =====

  // Tier 1 - High discrimination
  { 
    id: '7', 
    text: 'When making decisions, what matters most to you?', 
    optionA: 'Maintaining harmony and ensuring everyone\'s voice is heard',
    optionB: 'Following your own moral compass and personal convictions',
    functionType: 'Fi/Fe',
    category: 'function-preference',
    discriminationTier: 1,
    consistencyPairId: 'fife-1'
  },
  // Tier 2, REVERSED
  { 
    id: '8', 
    text: 'How do you evaluate your choices?', 
    optionA: 'Whether it aligns with your core personal beliefs',
    optionB: 'Consider how it affects everyone involved',
    functionType: 'Fi/Fe',
    category: 'function-preference',
    reversed: true,
    discriminationTier: 2
  },
  // Tier 2
  { 
    id: '14', 
    text: 'In group settings, what feels more important?', 
    optionA: 'Maintaining group cohesion and considering everyone\'s perspective',
    optionB: 'Staying authentic to your personal values and beliefs',
    functionType: 'Fi/Fe',
    category: 'function-preference',
    discriminationTier: 2,
    consistencyPairId: 'fife-1'
  },
  // Tier 2, REVERSED
  { 
    id: '15', 
    text: 'When making important decisions, you tend to:', 
    optionA: 'Reflect internally on what feels right for your values',
    optionB: 'Seek input from others and consider the social impact',
    functionType: 'Fi/Fe',
    category: 'function-preference',
    reversed: true,
    discriminationTier: 2
  },
  // Tier 3
  { 
    id: '23', 
    text: 'When you\'re stressed, which do you default to?', 
    optionA: 'Trying to maintain group harmony and meet others\' needs',
    optionB: 'Staying authentic to your values, even if it\'s difficult',
    functionType: 'Fi/Fe',
    category: 'function-order',
    discriminationTier: 3
  },
  // Tier 3, REVERSED
  { 
    id: '27', 
    text: 'When making important choices, what feels most natural?', 
    optionA: 'Checking alignment with your core personal beliefs',
    optionB: 'Considering the emotional climate and impact on relationships',
    functionType: 'Fi/Fe',
    category: 'function-order',
    reversed: true,
    discriminationTier: 3
  },
  // Tier 3
  { 
    id: '29', 
    text: 'Which describes your primary source of motivation?', 
    optionA: 'Creating harmony and supporting others\' emotional well-being',
    optionB: 'Maintaining personal integrity and authentic self-expression',
    functionType: 'Fi/Fe',
    category: 'function-order',
    discriminationTier: 3
  },
  // Tier 3, REVERSED
  { 
    id: '33', 
    text: 'Your friends would say you\'re most likely to:', 
    optionA: 'Stand firm on what you believe is right',
    optionB: 'Put group needs before your own comfort',
    functionType: 'Fi/Fe',
    category: 'function-order',
    reversed: true,
    discriminationTier: 3
  },

  // ===== ATTENTION CHECK (1 question) =====
  { 
    id: 'attn-1', 
    text: 'Quality check — to confirm you\'re reading carefully, please select \'Slightly prefer A\'.', 
    optionA: 'I am reading each question carefully',
    optionB: 'I am selecting answers at random',
    category: 'attention-check',
    discriminationTier: 2,
    attentionCheckExpectedValue: 1
  },

  // ===== E/I ORIENTATION QUESTIONS (3 total) =====
  // These directly measure introversion vs extraversion independent of cognitive functions.
  // Used to disambiguate when top two functions form a valid dom/aux pair
  // with conflicting attitudes (e.g. Ne #1 + Ti #2 → ENTP or INTP?).
  // Positive effective score = extroverted, negative = introverted.
  {
    id: 'ei-1',
    text: 'After spending several hours socializing with a group, you typically:',
    optionA: 'Feel energized and ready for more interaction',
    optionB: 'Feel satisfied but need time alone to recharge',
    category: 'ei-orientation',
    discriminationTier: 1
  },
  {
    id: 'ei-2',
    text: 'When thinking through a complex problem, you naturally prefer to:',
    optionA: 'Talk it through with someone or think out loud',
    optionB: 'Work it out quietly in your own head first',
    category: 'ei-orientation',
    discriminationTier: 1
  },
  {
    id: 'ei-3',
    text: 'In general, where do you feel most "like yourself"?',
    optionA: 'Engaging with the outside world — people, activities, and conversation',
    optionB: 'In your inner world — reflecting, reading, or working independently',
    category: 'ei-orientation',
    reversed: true,
    discriminationTier: 1
  },
];

export const functionDescriptions: Record<string, string> = {
  'Ni': 'Introverted Intuition - Focuses on internal patterns, future insights, and singular visions',
  'Ne': 'Extroverted Intuition - Explores external possibilities, connections, and multiple potential outcomes',
  'Si': 'Introverted Sensing - Compares present experiences to past memories and established routines',
  'Se': 'Extroverted Sensing - Lives in the present moment, seeks immediate sensory experiences',
  'Ti': 'Introverted Thinking - Analyzes information internally, seeks logical consistency and understanding',
  'Te': 'Extroverted Thinking - Organizes external world efficiently, focuses on practical results',
  'Fi': 'Introverted Feeling - Maintains strong personal values and authentic inner harmony',
  'Fe': 'Extroverted Feeling - Considers group harmony and others\' emotional needs'
};

export const mbtiTypes: Record<string, MBTITypeInfo> = {
  'INTJ': { 
    functions: ['Ni', 'Te', 'Fi', 'Se'], 
    description: 'The Architect - Strategic, innovative, and independent thinkers who see the big picture and work systematically toward their vision.' 
  },
  'INTP': { 
    functions: ['Ti', 'Ne', 'Si', 'Fe'], 
    description: 'The Thinker - Logical, analytical, and curious minds who love exploring theoretical concepts and understanding how things work.' 
  },
  'ENTJ': { 
    functions: ['Te', 'Ni', 'Se', 'Fi'], 
    description: 'The Commander - Natural leaders who are decisive, strategic, and focused on achieving goals and organizing systems efficiently.' 
  },
  'ENTP': { 
    functions: ['Ne', 'Ti', 'Fe', 'Si'], 
    description: 'The Debater - Creative, quick-witted innovators who enjoy exploring ideas, debating concepts, and inspiring others.' 
  },
  'INFJ': { 
    functions: ['Ni', 'Fe', 'Ti', 'Se'], 
    description: 'The Advocate - Insightful, empathetic idealists who are driven to help others and make meaningful positive change.' 
  },
  'INFP': { 
    functions: ['Fi', 'Ne', 'Si', 'Te'], 
    description: 'The Mediator - Creative, authentic individuals who value personal growth, harmony, and staying true to their values.' 
  },
  'ENFJ': { 
    functions: ['Fe', 'Ni', 'Se', 'Ti'], 
    description: 'The Protagonist - Charismatic, inspiring leaders who are passionate about helping others reach their potential.' 
  },
  'ENFP': { 
    functions: ['Ne', 'Fi', 'Te', 'Si'], 
    description: 'The Campaigner - Enthusiastic, creative free spirits who see life as full of possibilities and connections.' 
  },
  'ISTJ': { 
    functions: ['Si', 'Te', 'Fi', 'Ne'], 
    description: 'The Logistician - Practical, reliable, and methodical individuals who value tradition, duty, and getting things done right.' 
  },
  'ISFJ': { 
    functions: ['Si', 'Fe', 'Ti', 'Ne'], 
    description: 'The Protector - Warm, conscientious caregivers who are dedicated to supporting and protecting those they care about.' 
  },
  'ESTJ': { 
    functions: ['Te', 'Si', 'Ne', 'Fi'], 
    description: 'The Executive - Organized, decisive administrators who excel at managing people and projects to achieve concrete results.' 
  },
  'ESFJ': { 
    functions: ['Fe', 'Si', 'Ne', 'Ti'], 
    description: 'The Consul - Caring, social harmony-seekers who are attentive to others\' needs and excel at bringing people together.' 
  },
  'ISTP': { 
    functions: ['Ti', 'Se', 'Ni', 'Fe'], 
    description: 'The Virtuoso - Practical problem-solvers who are adaptable, hands-on, and skilled at understanding how things work.' 
  },
  'ISFP': { 
    functions: ['Fi', 'Se', 'Ni', 'Te'], 
    description: 'The Adventurer - Gentle, artistic souls who are flexible, open-minded, and guided by their personal values.' 
  },
  'ESTP': { 
    functions: ['Se', 'Ti', 'Fe', 'Ni'], 
    description: 'The Entrepreneur - Energetic, adaptable risk-takers who live in the moment and excel at responding to immediate challenges.' 
  },
  'ESFP': { 
    functions: ['Se', 'Fi', 'Te', 'Ni'], 
    description: 'The Entertainer - Spontaneous, enthusiastic performers who love engaging with others and bringing joy to every situation.' 
  }
};

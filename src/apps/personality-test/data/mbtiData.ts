import { Question, MBTITypeInfo } from '../mbti';

export const questions: Question[] = [
  // Intuition Function Questions (Ni vs Ne)
  { 
    id: '1', 
    text: 'When brainstorming, how do you prefer to approach ideas?', 
    optionA: 'Explore many different possibilities and connections with others',
    optionB: 'Focus deeply on one compelling insight or vision',
    functionType: 'Ni/Ne',
    category: 'function-preference'
  },
  { 
    id: '2', 
    text: 'How do you typically envision the future?', 
    optionA: 'See multiple potential outcomes and love generating new possibilities',
    optionB: 'Have singular, focused visions about what will happen',
    functionType: 'Ni/Ne',
    category: 'function-preference'
  },
  
  // Sensing Function Questions (Si vs Se)
  { 
    id: '3', 
    text: 'How do you prefer to respond to situations?', 
    optionA: 'Live in the present moment and respond to immediate experiences',
    optionB: 'Compare current situations to past patterns and routines',
    functionType: 'Si/Se',
    category: 'function-preference'
  },
  { 
    id: '4', 
    text: 'When processing information, what do you focus on?', 
    optionA: 'What\'s happening right now in my environment',
    optionB: 'How it relates to my personal history and established methods',
    functionType: 'Si/Se',
    category: 'function-preference'
  },
  
  // Thinking Function Questions (Ti vs Te)
  { 
    id: '5', 
    text: 'How do you prefer to approach problem-solving?', 
    optionA: 'Organize and systematize the external world for efficiency',
    optionB: 'Analyze concepts internally for logical consistency',
    functionType: 'Ti/Te',
    category: 'function-preference'
  },
  { 
    id: '6', 
    text: 'When working on solutions, what do you prioritize?', 
    optionA: 'Practical results and external implementation',
    optionB: 'Understanding the underlying logical framework',
    functionType: 'Ti/Te',
    category: 'function-preference'
  },
  
  // Feeling Function Questions (Fi vs Fe)
  { 
    id: '7', 
    text: 'When making decisions, what matters most to you?', 
    optionA: 'Group harmony and others\' emotional needs',
    optionB: 'Staying true to my personal values and inner authenticity',
    functionType: 'Fi/Fe',
    category: 'function-preference'
  },
  { 
    id: '8', 
    text: 'How do you evaluate your choices?', 
    optionA: 'Consider how it affects everyone involved',
    optionB: 'Whether it aligns with my core personal beliefs',
    functionType: 'Fi/Fe',
    category: 'function-preference'
  },
  
  // Function Order/Strength Questions - More comprehensive
  { 
    id: '9', 
    text: 'When facing a major life decision, what do you rely on most?', 
    optionA: 'Exploring all possibilities and brainstorming creative solutions',
    optionB: 'Deep reflection and trusting your inner knowing about the right path',
    functionType: 'Ni/Ne',
    category: 'function-order'
  },
  { 
    id: '10', 
    text: 'What energizes you most in your daily life?', 
    optionA: 'Logical problem-solving and systematic analysis',
    optionB: 'Connecting with others and considering emotional impacts',
    functionType: 'Ti/Te',
    category: 'function-order'
  },
  { 
    id: '11', 
    text: 'Which best describes your natural approach to life?', 
    optionA: 'Intuition-driven, focusing on patterns and future possibilities',
    optionB: 'Practically-grounded, focusing on concrete facts and experiences',
    functionType: 'Ni/Ne',
    category: 'function-order'
  },
  { 
    id: '12', 
    text: 'When you\'re at your best, what comes most naturally?', 
    optionA: 'Strategic thinking and objective decision-making',
    optionB: 'Understanding people and creating harmony',
    functionType: 'Ti/Te',
    category: 'function-order'
  },
  
  // New comprehensive function ordering questions
  { 
    id: '22', 
    text: 'What feels like your core strength?', 
    optionA: 'Being present and adaptable to immediate circumstances',
    optionB: 'Learning from experience and maintaining consistent routines',
    functionType: 'Si/Se',
    category: 'function-order'
  },
  { 
    id: '23', 
    text: 'When you\'re stressed, which do you default to?', 
    optionA: 'Staying authentic to your values, even if it\'s difficult',
    optionB: 'Trying to maintain group harmony and meet others\' needs',
    functionType: 'Fi/Fe',
    category: 'function-order'
  },
  { 
    id: '24', 
    text: 'What drives your decision-making process most strongly?', 
    optionA: 'Connecting dots between ideas and seeing future potential',
    optionB: 'Having a clear, focused vision of what will happen',
    functionType: 'Ni/Ne',
    category: 'function-order'
  },
  { 
    id: '25', 
    text: 'Which describes your natural information processing style?', 
    optionA: 'Quick to act on immediate sensory information',
    optionB: 'Carefully comparing new info to established knowledge',
    functionType: 'Si/Se',
    category: 'function-order'
  },
  { 
    id: '26', 
    text: 'What comes most effortlessly to you?', 
    optionA: 'Implementing practical solutions in the external world',
    optionB: 'Understanding the logical structure behind concepts',
    functionType: 'Ti/Te',
    category: 'function-order'
  },
  { 
    id: '27', 
    text: 'When making important choices, what feels most natural?', 
    optionA: 'Considering the emotional climate and impact on relationships',
    optionB: 'Checking alignment with your core personal beliefs',
    functionType: 'Fi/Fe',
    category: 'function-order'
  },
  { 
    id: '28', 
    text: 'What represents your dominant way of understanding the world?', 
    optionA: 'Through immediate sensory engagement and real-time action',
    optionB: 'Through personal experience and proven methods',
    functionType: 'Si/Se',
    category: 'function-order'
  },
  { 
    id: '29', 
    text: 'Which describes your primary source of motivation?', 
    optionA: 'Creating harmony and supporting others\' emotional well-being',
    optionB: 'Maintaining personal integrity and authentic self-expression',
    functionType: 'Fi/Fe',
    category: 'function-order'
  },
  { 
    id: '30', 
    text: 'What feels like your most developed mental process?', 
    optionA: 'Generating innovative ideas and seeing connections everywhere',
    optionB: 'Having deep insights and a clear sense of direction',
    functionType: 'Ni/Ne',
    category: 'function-order'
  },
  { 
    id: '31', 
    text: 'When working through complex problems, you naturally:', 
    optionA: 'Organize external resources and focus on measurable results',
    optionB: 'Analyze the internal logic until you understand the principles',
    functionType: 'Ti/Te',
    category: 'function-order'
  },
  
  // Dominance pattern questions to better identify primary functions
  { 
    id: '32', 
    text: 'People would describe your strongest trait as:', 
    optionA: 'Being spontaneous and responsive to the moment',
    optionB: 'Being reliable and consistent in your approach',
    functionType: 'Si/Se',
    category: 'function-order'
  },
  { 
    id: '33', 
    text: 'Your friends would say you\'re most likely to:', 
    optionA: 'Put group needs before your own comfort',
    optionB: 'Stand firm on what you believe is right',
    functionType: 'Fi/Fe',
    category: 'function-order'
  },
  { 
    id: '34', 
    text: 'When you\'re in your element, you:', 
    optionA: 'Generate lots of ideas and see possibilities everywhere',
    optionB: 'Have crystal clear insights about what will work',
    functionType: 'Ni/Ne',
    category: 'function-order'
  },
  { 
    id: '35', 
    text: 'Others often rely on you for:', 
    optionA: 'Getting things done efficiently and systematically', 
    optionB: 'Understanding complex concepts and finding logical flaws',
    functionType: 'Ti/Te',
    category: 'function-order'
  },
  
  // Additional balanced questions for better T/F distinction
  { 
    id: '13', 
    text: 'When analyzing a problem, what do you prioritize?', 
    optionA: 'Objective facts and measurable outcomes',
    optionB: 'Understanding the personal framework behind it',
    functionType: 'Ti/Te',
    category: 'function-preference'
  },
  { 
    id: '14', 
    text: 'In group settings, what feels more important?', 
    optionA: 'Maintaining group cohesion and considering everyone\'s feelings',
    optionB: 'Staying authentic to my personal values and beliefs',
    functionType: 'Fi/Fe',
    category: 'function-preference'
  },
  { 
    id: '15', 
    text: 'When making important decisions, you tend to:', 
    optionA: 'Seek input from others and consider the social impact',
    optionB: 'Reflect internally on what feels right for your values',
    functionType: 'Fi/Fe',
    category: 'function-preference'
  },
  { 
    id: '16', 
    text: 'How do you approach conflict resolution?', 
    optionA: 'Focus on logical analysis and finding practical solutions',
    optionB: 'Consider everyone\'s emotional needs and find compromises',
    functionType: 'Ti/Te',
    category: 'function-preference'
  },
  { 
    id: '17', 
    text: 'What motivates you most in your work?', 
    optionA: 'Helping others and making a positive impact on people',
    optionB: 'Personal growth and staying true to my authentic self',
    functionType: 'Fi/Fe',
    category: 'function-preference'
  },
  { 
    id: '18', 
    text: 'When learning something new, you prefer to:', 
    optionA: 'Jump right in and learn through hands-on experience',
    optionB: 'Study it carefully and relate it to things you already know',
    functionType: 'Si/Se',
    category: 'function-preference'
  },
  { 
    id: '19', 
    text: 'How do you handle criticism?', 
    optionA: 'Analyze it objectively to see if it\'s logically valid',
    optionB: 'Consider how it affects relationships and feelings involved',
    functionType: 'Ti/Te',
    category: 'function-preference'
  },
  { 
    id: '20', 
    text: 'When expressing disagreement, you tend to:', 
    optionA: 'Share your feelings diplomatically to maintain harmony',
    optionB: 'Stand firm on your principles even if it creates tension',
    functionType: 'Fi/Fe',
    category: 'function-preference'
  },
  { 
    id: '21', 
    text: 'In your ideal work environment, you would:', 
    optionA: 'Have variety and spontaneity in your daily tasks',
    optionB: 'Follow established routines and proven methods',
    functionType: 'Si/Se',
    category: 'function-preference'
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

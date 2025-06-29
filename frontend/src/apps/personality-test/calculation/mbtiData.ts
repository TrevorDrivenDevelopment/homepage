import { CognitiveFunctionName, CognitiveFunctionType, MBTIType, MBTITypeInfo, Question, QuestionCategory } from '../types';

export const questions: Question[] = [
  // === INTUITION FUNCTION QUESTIONS (Ni vs Ne) - 8 questions total ===
  
  // Ni vs Ne - FUNCTION_PREFERENCE (4 questions)
  { 
    text: 'When coming up with solutions, you tend to:', 
    extroverted: 'Generate multiple creative alternatives and explore various approaches',
    introverted: 'Focus on one comprehensive solution that addresses the core issue',
    functionType: CognitiveFunctionType.INTUITION,
    category: QuestionCategory.FUNCTION_PREFERENCE
  },
  { 
    text: 'When planning ahead, you prefer to:', 
    extroverted: 'Keep multiple options open and adapt your approach as you learn more',
    introverted: 'Have a clear long-term vision and work steadily toward that specific goal',
    functionType: CognitiveFunctionType.INTUITION,
    category: QuestionCategory.FUNCTION_PREFERENCE
  },
  { 
    text: 'When exploring new concepts, you:', 
    extroverted: 'Immediately see connections to other ideas and want to discuss possibilities with others',
    introverted: 'Prefer to understand the deeper meaning and implications before sharing your insights',
    functionType: CognitiveFunctionType.INTUITION,
    category: QuestionCategory.FUNCTION_PREFERENCE
  },
  { 
    text: 'Your approach to creativity is:', 
    extroverted: 'Brainstorm rapidly with others and build on diverse input and feedback',
    introverted: 'Develop insights through quiet reflection and internal synthesis',
    functionType: CognitiveFunctionType.INTUITION,
    category: QuestionCategory.FUNCTION_PREFERENCE
  },
  
  // Ni vs Ne - FUNCTION_ORDER (4 questions)
  { 
    text: 'You feel most energized when:', 
    extroverted: 'Exploring new possibilities and connecting different ideas',
    introverted: 'Following your intuition about the right direction to take',
    functionType: CognitiveFunctionType.INTUITION,
    category: QuestionCategory.FUNCTION_ORDER
  },
  { 
    text: 'You naturally tend to:', 
    extroverted: 'Look for patterns and connections between different ideas',
    introverted: 'Have deep insights about underlying meanings and future outcomes',
    functionType: CognitiveFunctionType.INTUITION,
    category: QuestionCategory.FUNCTION_ORDER
  },
  { 
    text: 'You make decisions by:', 
    extroverted: 'Seeing connections and considering what could happen',
    introverted: 'Having a clear sense of what will work best',
    functionType: CognitiveFunctionType.INTUITION,
    category: QuestionCategory.FUNCTION_ORDER
  },
  { 
    text: 'Your strongest mental skill is:', 
    extroverted: 'Coming up with creative ideas and seeing possibilities',
    introverted: 'Having insights about what will happen or work best',
    functionType: CognitiveFunctionType.INTUITION,
    category: QuestionCategory.FUNCTION_ORDER
  },

  // === SENSING FUNCTION QUESTIONS (Si vs Se) - 8 questions total ===
  
  // Si vs Se - FUNCTION_PREFERENCE (4 questions)
  { 
    text: 'When making decisions, you rely most on:', 
    extroverted: 'What you can see, hear, and experience right now',
    introverted: 'What has worked well for you in similar situations before',
    functionType: CognitiveFunctionType.SENSING,
    category: QuestionCategory.FUNCTION_PREFERENCE
  },
  { 
    text: 'You learn best when you can:', 
    extroverted: 'Jump in and try things hands-on as you go',
    introverted: 'Build on what you already know step-by-step',
    functionType: CognitiveFunctionType.SENSING,
    category: QuestionCategory.FUNCTION_PREFERENCE
  },
  { 
    text: 'When starting a new project, you prefer to:', 
    extroverted: 'Dive in and figure it out through trial and error',
    introverted: 'Plan carefully based on methods that have worked before',
    functionType: CognitiveFunctionType.SENSING,
    category: QuestionCategory.FUNCTION_PREFERENCE
  },
  { 
    text: 'Your ideal work style involves:', 
    extroverted: 'Having variety and being able to respond to changing priorities',
    introverted: 'Having consistent routines and reliable, proven methods',
    functionType: CognitiveFunctionType.SENSING,
    category: QuestionCategory.FUNCTION_PREFERENCE
  },
  
  // Si vs Se - FUNCTION_ORDER (4 questions)
  { 
    text: 'You feel most capable when:', 
    extroverted: 'Responding quickly to what\'s happening around you',
    introverted: 'Using tried-and-true methods that you know work',
    functionType: CognitiveFunctionType.SENSING,
    category: QuestionCategory.FUNCTION_ORDER
  },
  { 
    text: 'You prefer to work with information that is:', 
    extroverted: 'Current, real, and actionable right now',
    introverted: 'Familiar and connects to your past experience',
    functionType: CognitiveFunctionType.SENSING,
    category: QuestionCategory.FUNCTION_ORDER
  },
  { 
    text: 'You understand the world best through:', 
    extroverted: 'Direct experience and hands-on interaction',
    introverted: 'Comparing new situations to what you\'ve learned before',
    functionType: CognitiveFunctionType.SENSING,
    category: QuestionCategory.FUNCTION_ORDER
  },
  { 
    text: 'Others would describe you as someone who:', 
    extroverted: 'Acts quickly and adapts well to changing situations',
    introverted: 'Is dependable and follows consistent, proven approaches',
    functionType: CognitiveFunctionType.SENSING,
    category: QuestionCategory.FUNCTION_ORDER
  },

  // === THINKING FUNCTION QUESTIONS (Ti vs Te) - 8 questions total ===
  
  // Ti vs Te - FUNCTION_PREFERENCE (4 questions)
  { 
    text: 'When solving problems, you focus on:', 
    extroverted: 'Getting results quickly and efficiently using proven methods',
    introverted: 'Understanding the underlying logic and principles first, even if it takes longer',
    functionType: CognitiveFunctionType.THINKING,
    category: QuestionCategory.FUNCTION_PREFERENCE
  },
  { 
    text: 'You feel most confident when:', 
    extroverted: 'You can organize people and resources to execute a clear plan',
    introverted: 'You can analyze a complex system until you completely understand how it works',
    functionType: CognitiveFunctionType.THINKING,
    category: QuestionCategory.FUNCTION_PREFERENCE
  },
  { 
    text: 'When evaluating ideas, you prioritize:', 
    extroverted: 'Whether it can be implemented effectively and will produce measurable results',
    introverted: 'Whether the logic is internally consistent and the reasoning is sound',
    functionType: CognitiveFunctionType.THINKING,
    category: QuestionCategory.FUNCTION_PREFERENCE
  },
  { 
    text: 'When there\'s disagreement in your group, you tend to:', 
    extroverted: 'Take charge and establish clear facts and action steps to resolve it',
    introverted: 'Withdraw to think through the logical flaws in each position',
    functionType: CognitiveFunctionType.THINKING,
    category: QuestionCategory.FUNCTION_PREFERENCE
  },
  
  // Ti vs Te - FUNCTION_ORDER (4 questions)
  { 
    text: 'People often come to you because you\'re good at:', 
    extroverted: 'Making decisions quickly and organizing systems to get results',
    introverted: 'Debugging complex problems and spotting logical inconsistencies',
    functionType: CognitiveFunctionType.THINKING,
    category: QuestionCategory.FUNCTION_ORDER
  },
  { 
    text: 'You\'re at your best when you can:', 
    extroverted: 'Lead a team and implement efficient systems and processes',
    introverted: 'Think deeply about abstract concepts without time pressure',
    functionType: CognitiveFunctionType.THINKING,
    category: QuestionCategory.FUNCTION_ORDER
  },
  { 
    text: 'You feel most useful when you\'re:', 
    extroverted: 'Taking charge of projects and making sure deadlines are met',
    introverted: 'Understanding complex theories and figuring out how things really work',
    functionType: CognitiveFunctionType.THINKING,
    category: QuestionCategory.FUNCTION_ORDER
  },
  { 
    text: 'People often ask for your help with:', 
    extroverted: 'Organizing projects, making plans, and managing deadlines', 
    introverted: 'Solving puzzles, understanding difficult concepts, and finding logical flaws',
    functionType: CognitiveFunctionType.THINKING,
    category: QuestionCategory.FUNCTION_ORDER
  },

  // === FEELING FUNCTION QUESTIONS (Fi vs Fe) - 8 questions total ===
  
  // Fi vs Fe - FUNCTION_PREFERENCE (4 questions)
  { 
    text: 'When helping others, you focus on:', 
    extroverted: 'Making sure everyone feels included and comfortable',
    introverted: 'Staying true to your deep emotional values and personal feelings',
    functionType: CognitiveFunctionType.FEELING,
    category: QuestionCategory.FUNCTION_PREFERENCE
  },
  { 
    text: 'You make your best decisions when you:', 
    extroverted: 'Consider how it will affect the people around you',
    introverted: 'Listen to your emotional instincts about what feels personally meaningful',
    functionType: CognitiveFunctionType.FEELING,
    category: QuestionCategory.FUNCTION_PREFERENCE
  },
  { 
    text: 'In group discussions, you care most about:', 
    extroverted: 'Making sure everyone feels heard and the group stays united',
    introverted: 'Being emotionally honest about your personal feelings and convictions',
    functionType: CognitiveFunctionType.FEELING,
    category: QuestionCategory.FUNCTION_PREFERENCE
  },
  { 
    text: 'When someone asks for advice, you:', 
    extroverted: 'Listen to their feelings and help them think through the impact on others',
    introverted: 'Share what you personally feel is morally right based on your heart',
    functionType: CognitiveFunctionType.FEELING,
    category: QuestionCategory.FUNCTION_PREFERENCE
  },
  
  // Fi vs Fe - FUNCTION_ORDER (4 questions)
  { 
    text: 'When stressed, you tend to:', 
    extroverted: 'Try to keep everyone happy and avoid conflict',
    introverted: 'Stick to your deep personal feelings even if others disagree',
    functionType: CognitiveFunctionType.FEELING,
    category: QuestionCategory.FUNCTION_ORDER
  },
  { 
    text: 'When making important choices, you prioritize:', 
    extroverted: 'How it will affect the mood and feelings of your group',
    introverted: 'Whether it aligns with what feels emotionally meaningful to you personally',
    functionType: CognitiveFunctionType.FEELING,
    category: QuestionCategory.FUNCTION_ORDER
  },
  { 
    text: 'What motivates you most is:', 
    extroverted: 'Helping others feel understood and supported',
    introverted: 'Staying true to your deepest feelings and what emotionally matters to you',
    functionType: CognitiveFunctionType.FEELING,
    category: QuestionCategory.FUNCTION_ORDER
  },
  { 
    text: 'Your friends rely on you to:', 
    extroverted: 'Consider everyone\'s needs and keep the group together',
    introverted: 'Stand up for what you feel is morally right, even when it\'s difficult',
    functionType: CognitiveFunctionType.FEELING,
    category: QuestionCategory.FUNCTION_ORDER
  },

  // === TRADITIONAL DICHOTOMY QUESTIONS - 8 questions total ===
  
  // extroversion vs Introversion - TRADITIONAL_DICHOTOMY (4 questions)
  { 
    text: 'After a long day, you prefer to recharge by:', 
    extroverted: 'Going out with friends or engaging in social activities',
    introverted: 'Spending quiet time alone or with one close person',
    functionType: CognitiveFunctionType.EXTROVERSION_INTROVERSION,
    category: QuestionCategory.TRADITIONAL_DICHOTOMY
  },
  { 
    text: 'When working on a project, you tend to:', 
    extroverted: 'Think out loud and discuss your ideas with others frequently',
    introverted: 'Work through ideas in your head before sharing them',
    functionType: CognitiveFunctionType.EXTROVERSION_INTROVERSION,
    category: QuestionCategory.TRADITIONAL_DICHOTOMY
  },
  { 
    text: 'At social gatherings, you typically:', 
    extroverted: 'Enjoy meeting new people and engaging in multiple conversations',
    introverted: 'Prefer deeper conversations with a few people you know well',
    functionType: CognitiveFunctionType.EXTROVERSION_INTROVERSION,
    category: QuestionCategory.TRADITIONAL_DICHOTOMY
  },
  { 
    text: 'Your communication style is usually:', 
    extroverted: 'Expressive and spontaneous - you share thoughts as they come to mind',
    introverted: 'More reserved and thoughtful - you consider your words carefully before speaking',
    functionType: CognitiveFunctionType.EXTROVERSION_INTROVERSION,
    category: QuestionCategory.TRADITIONAL_DICHOTOMY
  },
  
  // Judging vs Perceiving - TRADITIONAL_DICHOTOMY (4 questions)
  { 
    text: 'Your ideal work environment has:', 
    extroverted: 'Clear deadlines, structured schedules, and definite closure on projects',
    introverted: 'Flexible timelines, adaptable schedules, and freedom to explore different approaches',
    functionType: CognitiveFunctionType.JUDGING_PERCEIVING,
    category: QuestionCategory.TRADITIONAL_DICHOTOMY
  },
  { 
    text: 'When making plans for the weekend, you prefer to:', 
    extroverted: 'Decide in advance and stick to a clear schedule of activities',
    introverted: 'Keep options open and see what you feel like doing when the time comes',
    functionType: CognitiveFunctionType.JUDGING_PERCEIVING,
    category: QuestionCategory.TRADITIONAL_DICHOTOMY
  },
  { 
    text: 'Your approach to deadlines is typically:', 
    extroverted: 'Start early and work steadily toward completion well before the due date',
    introverted: 'Work best under pressure and often produce your best results close to the deadline',
    functionType: CognitiveFunctionType.JUDGING_PERCEIVING,
    category: QuestionCategory.TRADITIONAL_DICHOTOMY
  },
  { 
    text: 'You feel most comfortable when:', 
    extroverted: 'Decisions are made and you can move forward with a clear plan',
    introverted: 'Options remain open and you can adapt your approach as new information emerges',
    functionType: CognitiveFunctionType.JUDGING_PERCEIVING,
    category: QuestionCategory.TRADITIONAL_DICHOTOMY
  }
];

export const functionDescriptions: Record<CognitiveFunctionName, string> = {
  [CognitiveFunctionName.NI]: 'Introverted Intuition - Focuses on internal patterns, future insights, and singular visions',
  [CognitiveFunctionName.NE]: 'Extroverted Intuition - Explores external possibilities, connections, and multiple potential outcomes',
  [CognitiveFunctionName.SI]: 'Introverted Sensing - Compares present experiences to past memories and established routines',
  [CognitiveFunctionName.SE]: 'Extroverted Sensing - Lives in the present moment, seeks immediate sensory experiences',
  [CognitiveFunctionName.TI]: 'Introverted Thinking - Analyzes information internally, seeks logical consistency and understanding',
  [CognitiveFunctionName.TE]: 'Extroverted Thinking - Organizes external world efficiently, focuses on practical results',
  [CognitiveFunctionName.FI]: 'Introverted Feeling - Maintains strong personal values and authentic inner harmony',
  [CognitiveFunctionName.FE]: 'Extroverted Feeling - Considers group harmony and others\' emotional needs'
};

export const mbtiTypes: Record<MBTIType, MBTITypeInfo> = {
  [MBTIType.INTJ]: { 
    functions: [CognitiveFunctionName.NI, CognitiveFunctionName.TE, CognitiveFunctionName.FI, CognitiveFunctionName.SE], 
    description: 'The Architect - Strategic, innovative, and independent thinkers who see the big picture and work systematically toward their vision.' 
  },
  [MBTIType.INTP]: { 
    functions: [CognitiveFunctionName.TI, CognitiveFunctionName.NE, CognitiveFunctionName.SI, CognitiveFunctionName.FE], 
    description: 'The Thinker - Logical, analytical, and curious minds who love exploring theoretical concepts and understanding how things work.' 
  },
  [MBTIType.ENTJ]: { 
    functions: [CognitiveFunctionName.TE, CognitiveFunctionName.NI, CognitiveFunctionName.SE, CognitiveFunctionName.FI], 
    description: 'The Commander - Natural leaders who are decisive, strategic, and focused on achieving goals and organizing systems efficiently.' 
  },
  [MBTIType.ENTP]: { 
    functions: [CognitiveFunctionName.NE, CognitiveFunctionName.TI, CognitiveFunctionName.FE, CognitiveFunctionName.SI], 
    description: 'The Debater - Creative, quick-witted innovators who enjoy exploring ideas, debating concepts, and inspiring others.' 
  },
  [MBTIType.INFJ]: { 
    functions: [CognitiveFunctionName.NI, CognitiveFunctionName.FE, CognitiveFunctionName.TI, CognitiveFunctionName.SE], 
    description: 'The Advocate - Insightful, empathetic idealists who are driven to help others and make meaningful positive change.' 
  },
  [MBTIType.INFP]: { 
    functions: [CognitiveFunctionName.FI, CognitiveFunctionName.NE, CognitiveFunctionName.SI, CognitiveFunctionName.TE], 
    description: 'The Mediator - Creative, authentic individuals who value personal growth, harmony, and staying true to their values.' 
  },
  [MBTIType.ENFJ]: { 
    functions: [CognitiveFunctionName.FE, CognitiveFunctionName.NI, CognitiveFunctionName.SE, CognitiveFunctionName.TI], 
    description: 'The Protagonist - Charismatic, inspiring leaders who are passionate about helping others reach their potential.' 
  },
  [MBTIType.ENFP]: { 
    functions: [CognitiveFunctionName.NE, CognitiveFunctionName.FI, CognitiveFunctionName.TE, CognitiveFunctionName.SI], 
    description: 'The Campaigner - Enthusiastic, creative free spirits who see life as full of possibilities and connections.' 
  },
  [MBTIType.ISTJ]: { 
    functions: [CognitiveFunctionName.SI, CognitiveFunctionName.TE, CognitiveFunctionName.FI, CognitiveFunctionName.NE], 
    description: 'The Logistician - Practical, reliable, and methodical individuals who value tradition, duty, and getting things done right.' 
  },
  [MBTIType.ISFJ]: { 
    functions: [CognitiveFunctionName.SI, CognitiveFunctionName.FE, CognitiveFunctionName.TI, CognitiveFunctionName.NE], 
    description: 'The Protector - Warm, conscientious caregivers who are dedicated to supporting and protecting those they care about.' 
  },
  [MBTIType.ESTJ]: { 
    functions: [CognitiveFunctionName.TE, CognitiveFunctionName.SI, CognitiveFunctionName.NE, CognitiveFunctionName.FI], 
    description: 'The Executive - Organized, decisive administrators who excel at managing people and projects to achieve concrete results.' 
  },
  [MBTIType.ESFJ]: { 
    functions: [CognitiveFunctionName.FE, CognitiveFunctionName.SI, CognitiveFunctionName.NE, CognitiveFunctionName.TI], 
    description: 'The Consul - Caring, social harmony-seekers who are attentive to others\' needs and excel at bringing people together.' 
  },
  [MBTIType.ISTP]: { 
    functions: [CognitiveFunctionName.TI, CognitiveFunctionName.SE, CognitiveFunctionName.NI, CognitiveFunctionName.FE], 
    description: 'The Virtuoso - Practical problem-solvers who are adaptable, hands-on, and skilled at understanding how things work.' 
  },
  [MBTIType.ISFP]: { 
    functions: [CognitiveFunctionName.FI, CognitiveFunctionName.SE, CognitiveFunctionName.NI, CognitiveFunctionName.TE], 
    description: 'The Adventurer - Gentle, artistic souls who are flexible, open-minded, and guided by their personal values.' 
  },
  [MBTIType.ESTP]: { 
    functions: [CognitiveFunctionName.SE, CognitiveFunctionName.TI, CognitiveFunctionName.FE, CognitiveFunctionName.NI], 
    description: 'The Entrepreneur - Energetic, adaptable risk-takers who live in the moment and excel at responding to immediate challenges.' 
  },
  [MBTIType.ESFP]: { 
    functions: [CognitiveFunctionName.SE, CognitiveFunctionName.FI, CognitiveFunctionName.TE, CognitiveFunctionName.NI], 
    description: 'The Entertainer - Spontaneous, enthusiastic performers who love engaging with others and bringing joy to every situation.' 
  }
};

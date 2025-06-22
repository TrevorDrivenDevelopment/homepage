import { Question, QuestionCategory, CognitiveFunctionType } from '../types';
import { 
  QuestionQualityResults, 
  FunctionDistribution, 
  BiasIssue, 
  QuestionClarityScore 
} from './TestTypes';

/**
 * Analyzes question quality including bias detection, clarity, and distribution
 */
export class QuestionQualityAnalyzer {
  private questions: Question[];
  
  // Lists of potentially biased words
  private positiveWords = [
    'creative', 'innovative', 'flexible', 'spontaneous', 'exciting', 'dynamic',
    'efficient', 'organized', 'reliable', 'systematic', 'thorough', 'practical'
  ];
  
  private negativeWords = [
    'boring', 'rigid', 'chaotic', 'unpredictable', 'slow', 'disorganized',
    'cold', 'impersonal', 'overly', 'too much', 'excessive'
  ];

  constructor(questions: Question[]) {
    this.questions = questions;
  }

  /**
   * Analyze all aspects of question quality
   */
  analyzeQuestions(): QuestionQualityResults {
    const distribution = this.analyzeDistribution();
    const bias = this.analyzeBias();
    const clarity = this.analyzeClarity();
    const theoretical = this.analyzeTheoreticalCompliance();

    const overallScore = this.calculateOverallScore(distribution, bias, clarity, theoretical);

    return {
      distribution,
      bias,
      clarity,
      theoretical,
      overallScore
    };
  }

  /**
   * Analyze question distribution across function types and categories
   */
  private analyzeDistribution(): { passed: boolean; details: FunctionDistribution } {
    const distribution: FunctionDistribution = {
      intuition: 0,
      sensing: 0,
      thinking: 0,
      feeling: 0,
      extraversionIntroversion: 0,
      judgingPerceiving: 0,
      functionPreference: 0,
      functionOrder: 0,
      traditionalDichotomy: 0
    };

    this.questions.forEach(question => {
      // Count by function type
      switch (question.functionType) {
        case CognitiveFunctionType.INTUITION:
          distribution.intuition++;
          break;
        case CognitiveFunctionType.SENSING:
          distribution.sensing++;
          break;
        case CognitiveFunctionType.THINKING:
          distribution.thinking++;
          break;
        case CognitiveFunctionType.FEELING:
          distribution.feeling++;
          break;
        case CognitiveFunctionType.EXTROVERSION_INTROVERSION:
          distribution.extraversionIntroversion++;
          break;
        case CognitiveFunctionType.JUDGING_PERCEIVING:
          distribution.judgingPerceiving++;
          break;
      }

      // Count by category
      switch (question.category) {
        case QuestionCategory.FUNCTION_PREFERENCE:
          distribution.functionPreference++;
          break;
        case QuestionCategory.FUNCTION_ORDER:
          distribution.functionOrder++;
          break;
        case QuestionCategory.TRADITIONAL_DICHOTOMY:
          distribution.traditionalDichotomy++;
          break;
      }
    });

    // Check if distribution is balanced (8 questions per function type)
    const expectedPerFunction = 8;
    const functionCounts = [
      distribution.intuition,
      distribution.sensing,
      distribution.thinking,
      distribution.feeling
    ];

    const isBalanced = functionCounts.every(count => count === expectedPerFunction);
    const hasEqualCategories = distribution.functionPreference === distribution.functionOrder;

    return {
      passed: isBalanced && hasEqualCategories,
      details: distribution
    };
  }

  /**
   * Analyze potential bias in question wording
   */
  private analyzeBias(): { score: number; issues: BiasIssue[] } {
    const issues: BiasIssue[] = [];
    let totalScore = 0;

    this.questions.forEach((question, index) => {
      const questionIssues = this.analyzeQuestionBias(question, index);
      issues.push(...questionIssues);

      // Score based on number and severity of issues
      let questionScore = 100;
      questionIssues.forEach(issue => {
        switch (issue.severity) {
          case 'high':
            questionScore -= 30;
            break;
          case 'medium':
            questionScore -= 15;
            break;
          case 'low':
            questionScore -= 5;
            break;
        }
      });

      totalScore += Math.max(0, questionScore);
    });

    const averageScore = totalScore / this.questions.length;

    return {
      score: Math.round(averageScore),
      issues
    };
  }

  /**
   * Analyze individual question for bias
   */
  private analyzeQuestionBias(question: Question, index: number): BiasIssue[] {
    const issues: BiasIssue[] = [];
    const extrovertedText = question.extroverted.toLowerCase();
    const introvertedText = question.introverted.toLowerCase();

    // Check for loaded language
    const extrovertedPositive = this.positiveWords.filter(word => extrovertedText.includes(word));
    const extrovertedNegative = this.negativeWords.filter(word => extrovertedText.includes(word));
    const introvertedPositive = this.positiveWords.filter(word => introvertedText.includes(word));
    const introvertedNegative = this.negativeWords.filter(word => introvertedText.includes(word));

    if (extrovertedPositive.length > introvertedPositive.length + 1) {
      issues.push({
        questionIndex: index,
        type: 'loaded_language',
        severity: 'medium',
        description: `Extroverted option has more positive language: ${extrovertedPositive.join(', ')}`,
        suggestion: 'Balance positive language between options'
      });
    }

    if (extrovertedNegative.length > introvertedNegative.length + 1) {
      issues.push({
        questionIndex: index,
        type: 'loaded_language',
        severity: 'medium',
        description: `Extroverted option has more negative language: ${extrovertedNegative.join(', ')}`,
        suggestion: 'Remove or balance negative language'
      });
    }

    // Check for length disparity
    const lengthDiff = Math.abs(question.extroverted.length - question.introverted.length);
    if (lengthDiff > 20) {
      issues.push({
        questionIndex: index,
        type: 'length_disparity',
        severity: lengthDiff > 40 ? 'high' : 'medium',
        description: `Length difference of ${lengthDiff} characters`,
        suggestion: 'Balance option lengths to within 20 characters'
      });
    }

    // Check for complexity difference (word count)
    const extrovertedWords = question.extroverted.split(' ').length;
    const introvertedWords = question.introverted.split(' ').length;
    const wordDiff = Math.abs(extrovertedWords - introvertedWords);
    
    if (wordDiff > 3) {
      issues.push({
        questionIndex: index,
        type: 'complexity_difference',
        severity: wordDiff > 6 ? 'high' : 'medium',
        description: `Word count difference of ${wordDiff} words`,
        suggestion: 'Balance complexity between options'
      });
    }

    return issues;
  }

  /**
   * Analyze question clarity and readability
   */
  private analyzeClarity(): { averageScore: number; questionScores: QuestionClarityScore[] } {
    const questionScores: QuestionClarityScore[] = [];
    let totalScore = 0;

    this.questions.forEach((question, index) => {
      const score = this.analyzeQuestionClarity(question, index);
      questionScores.push(score);
      totalScore += score.score;
    });

    return {
      averageScore: totalScore / this.questions.length,
      questionScores
    };
  }

  /**
   * Analyze individual question clarity
   */
  private analyzeQuestionClarity(question: Question, index: number): QuestionClarityScore {
    const issues: string[] = [];
    let score = 10;

    // Check question text length (should be clear and concise)
    if (question.text.length > 100) {
      issues.push('Question text too long');
      score -= 1;
    }

    if (question.text.length < 20) {
      issues.push('Question text too short');
      score -= 1;
    }

    // Check option lengths (should be reasonable)
    const extrovertedLength = question.extroverted.length;
    const introvertedLength = question.introverted.length;

    if (extrovertedLength > 120 || introvertedLength > 120) {
      issues.push('Options too long');
      score -= 1;
    }

    if (extrovertedLength < 15 || introvertedLength < 15) {
      issues.push('Options too short');
      score -= 1;
    }

    // Check for unclear language
    const ambiguousWords = ['sometimes', 'usually', 'often', 'maybe', 'might'];
    const questionText = question.text.toLowerCase();
    
    ambiguousWords.forEach(word => {
      if (questionText.includes(word)) {
        issues.push(`Contains ambiguous word: ${word}`);
        score -= 0.5;
      }
    });

    // Calculate complexity (average words per sentence)
    const extrovertedWords = question.extroverted.split(' ').length;
    const introvertedWords = question.introverted.split(' ').length;
    const complexity = (extrovertedWords + introvertedWords) / 2;

    if (complexity > 15) {
      issues.push('Options too complex');
      score -= 1;
    }

    return {
      questionIndex: index,
      score: Math.max(0, score),
      issues,
      extrovertedLength,
      introvertedLength,
      complexity
    };
  }

  /**
   * Analyze compliance with MBTI theoretical principles
   */
  private analyzeTheoreticalCompliance(): { compliance: number; violations: string[] } {
    const violations: string[] = [];
    let compliance = 100;

    // Check that each cognitive function type has equal representation (8 questions each)
    const cognitiveFunctionCounts = {
      [CognitiveFunctionType.INTUITION]: 0,
      [CognitiveFunctionType.SENSING]: 0,
      [CognitiveFunctionType.THINKING]: 0,
      [CognitiveFunctionType.FEELING]: 0
    };

    // Check traditional dichotomy function counts (4 questions each)
    const dichotomyFunctionCounts = {
      [CognitiveFunctionType.EXTROVERSION_INTROVERSION]: 0,
      [CognitiveFunctionType.JUDGING_PERCEIVING]: 0
    };

    this.questions.forEach(question => {
      if (question.functionType in cognitiveFunctionCounts) {
        cognitiveFunctionCounts[question.functionType as keyof typeof cognitiveFunctionCounts]++;
      } else if (question.functionType in dichotomyFunctionCounts) {
        dichotomyFunctionCounts[question.functionType as keyof typeof dichotomyFunctionCounts]++;
      }
    });

    // Validate cognitive function counts (should be 8 each)
    const expectedCognitiveFunctionCount = 8;
    Object.entries(cognitiveFunctionCounts).forEach(([type, count]) => {
      if (count !== expectedCognitiveFunctionCount) {
        violations.push(`${type} function has ${count} questions, expected ${expectedCognitiveFunctionCount}`);
        compliance -= 10;
      }
    });

    // Validate dichotomy function counts (should be 4 each)
    const expectedDichotomyCount = 4;
    Object.entries(dichotomyFunctionCounts).forEach(([type, count]) => {
      if (count !== expectedDichotomyCount) {
        violations.push(`${type} function has ${count} questions, expected ${expectedDichotomyCount}`);
        compliance -= 10;
      }
    });

    // Check that categories are balanced
    const categoryCounts = {
      [QuestionCategory.FUNCTION_PREFERENCE]: 0,
      [QuestionCategory.FUNCTION_ORDER]: 0,
      [QuestionCategory.TRADITIONAL_DICHOTOMY]: 0
    };

    this.questions.forEach(question => {
      categoryCounts[question.category]++;
    });

    if (categoryCounts[QuestionCategory.FUNCTION_PREFERENCE] !== 
        categoryCounts[QuestionCategory.FUNCTION_ORDER]) {
      violations.push('Imbalanced function preference vs order questions');
      compliance -= 15;
    }

    return {
      compliance: Math.max(0, compliance),
      violations
    };
  }

  /**
   * Calculate overall question quality score
   */
  private calculateOverallScore(
    distribution: any,
    bias: any,
    clarity: any,
    theoretical: any
  ): number {
    const distributionScore = distribution.passed ? 100 : 70;
    const biasScore = bias.score;
    const clarityScore = (clarity.averageScore / 10) * 100;
    const theoreticalScore = theoretical.compliance;

    // Weighted average: 25% each category
    return Math.round(
      distributionScore * 0.25 + 
      biasScore * 0.25 + 
      clarityScore * 0.25 + 
      theoreticalScore * 0.25
    );
  }
}

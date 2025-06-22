import { Box, Button, Container, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MBTICalculatorFactory } from './calculation';
import { CalculationResult } from './calculation/interfaces';
import { questions, mbtiTypes } from './calculation/mbtiData';
import CurrentScores from './components/CurrentScores';
import FunctionStackEditor from './components/FunctionStackEditor';
import MBTIReference from './components/MBTIReference';
import QuestionCard from './components/QuestionCard';
import TopTypesDisplay from './components/TopTypesDisplay';
import { defaultGridColors, MBTI_STYLES } from './theme/mbtiTheme';
import { CognitiveFunction, CognitiveFunctionName, CognitiveFunctionType, FunctionScores, Response, TypeResult, MBTIType } from './types';

const QuestionSelector: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [functionStack, setFunctionStack] = useState<CognitiveFunction[]>([
    { introverted: CognitiveFunctionName.NI, extroverted: CognitiveFunctionName.NE, isExtroverted: false, isAnimating: false },
    { introverted: CognitiveFunctionName.SI, extroverted: CognitiveFunctionName.SE, isExtroverted: true, isAnimating: false },
    { introverted: CognitiveFunctionName.TI, extroverted: CognitiveFunctionName.TE, isExtroverted: false, isAnimating: false },
    { introverted: CognitiveFunctionName.FI, extroverted: CognitiveFunctionName.FE, isExtroverted: true, isAnimating: false },
  ]);

  // Initialize MBTI Calculator
  const calculator = useMemo(() => MBTICalculatorFactory.createAccurateCalculator(), []);

  const gridColors = defaultGridColors;

  // Function to calculate MBTI type from function stack
  const getTypeFromFunctionStack = useCallback((stack: CognitiveFunction[]): MBTIType | null => {
    // Get the actual function names from the stack
    const stackFunctions = stack.map(func => 
      func.isExtroverted ? func.extroverted : func.introverted
    );

    // Find the matching MBTI type
    for (const [type, info] of Object.entries(mbtiTypes)) {
      if (JSON.stringify(info.functions) === JSON.stringify(stackFunctions)) {
        return type as MBTIType;
      }
    }
    return null;
  }, []);

  // Calculate current MBTI result using the calculator
  const currentResult = useMemo((): CalculationResult | null => {
    if (responses.length === 0) return null;
    
    try {
      return calculator.calculate(responses);
    } catch (error) {
      return null;
    }
  }, [responses, calculator]);

  const getCurrentFunctionScores = useMemo((): FunctionScores => {
    if (!currentResult) {
      return {
        [CognitiveFunctionType.INTUITION]: 0,
        [CognitiveFunctionType.SENSING]: 0,
        [CognitiveFunctionType.THINKING]: 0,
        [CognitiveFunctionType.FEELING]: 0
      };
    }

    // Convert DetailedFunctionScores to FunctionScores format
    const detailedScores = currentResult.scores;
    return {
      [CognitiveFunctionType.INTUITION]: detailedScores.Ne - detailedScores.Ni,
      [CognitiveFunctionType.SENSING]: detailedScores.Se - detailedScores.Si,
      [CognitiveFunctionType.THINKING]: detailedScores.Te - detailedScores.Ti,
      [CognitiveFunctionType.FEELING]: detailedScores.Fe - detailedScores.Fi
    };
  }, [currentResult]);

  // Get top types from calculation result
  const topTypes = useMemo((): TypeResult[] => {
    if (!isComplete || !currentResult || !currentResult.alternativeTypes) return [];
    
    // Convert TypeMatchResult to TypeResult format
    return currentResult.alternativeTypes.slice(0, 3).map((matchResult: any, index: number) => ({
      type: matchResult.type,
      score: matchResult.score,
      match: index === 0 ? 'Primary Type' : `${Math.round(matchResult.confidence)}% match`
    }));
  }, [currentResult, isComplete]);

  // The current MBTI should be based on the current function stack (if edited) or quiz result
  const getCurrentMBTI = useMemo((): string => {
    if (!isComplete) return 'XXXX';
    
    // If test is complete, first try to get type from current function stack
    const typeFromStack = getTypeFromFunctionStack(functionStack);
    if (typeFromStack) {
      return typeFromStack;
    }
    
    // Fallback to quiz result if stack doesn't match any type
    if (currentResult) {
      return currentResult.type;
    }
    
    return 'XXXX';
  }, [currentResult, isComplete, functionStack, getTypeFromFunctionStack]);

  const updateFunctionStackFromScores = useCallback(() => {
    if (responses.length >= questions.length && currentResult) {
      setFunctionStack(currentResult.stack);
    }
  }, [responses, currentResult]);

  useEffect(() => {
    if (isComplete) {
      updateFunctionStackFromScores();
    }
  }, [isComplete, updateFunctionStackFromScores]);

  const handleResponse = (value: boolean | null) => {
    const newResponses = responses.filter(r => r.questionIndex !== currentQuestionIndex);
    newResponses.push({ questionIndex: currentQuestionIndex, value });
    
    setResponses(newResponses);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleToggleFunction = (index: number) => {
    const newStack = [...functionStack];
    newStack[index].isExtroverted = !newStack[index].isExtroverted;
    setFunctionStack(newStack);
    // Type will automatically update via getCurrentMBTI useMemo dependency on functionStack
  };

  const handleSwapFunctions = (index1: number, index2: number) => {
    const newStack = [...functionStack];
    
    // Add animation state
    newStack[index1].isAnimating = true;
    newStack[index2].isAnimating = true;
    setFunctionStack([...newStack]);
    
    // Perform the swap after a brief delay
    setTimeout(() => {
      [newStack[index1], newStack[index2]] = [newStack[index2], newStack[index1]];
      setFunctionStack([...newStack]);
      
      // Remove animation state after swap
      setTimeout(() => {
        newStack[index1].isAnimating = false;
        newStack[index2].isAnimating = false;
        setFunctionStack([...newStack]);
        // Type will automatically update via getCurrentMBTI useMemo dependency on functionStack
      }, 100);
    }, 150);
  };

  const resetTest = () => {
    setCurrentQuestionIndex(0);
    setResponses([]);
    setIsComplete(false);
    setFunctionStack([
      { introverted: CognitiveFunctionName.NI, extroverted: CognitiveFunctionName.NE, isExtroverted: false, isAnimating: false },
      { introverted: CognitiveFunctionName.SI, extroverted: CognitiveFunctionName.SE, isExtroverted: true, isAnimating: false },
      { introverted: CognitiveFunctionName.TI, extroverted: CognitiveFunctionName.TE, isExtroverted: false, isAnimating: false },
      { introverted: CognitiveFunctionName.FI, extroverted: CognitiveFunctionName.FE, isExtroverted: true, isAnimating: false },
    ]);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentMBTI = getCurrentMBTI;
  const functionScores = getCurrentFunctionScores;

  return (
    <Container className="App">
      <header className="App-header">
        <Typography variant="h5" component="h1" gutterBottom>
          Myers-Briggs Function Stack Explorer
        </Typography>
        <Link to="/" style={{ color: gridColors.linkColor, textDecoration: 'none' }}>
          ← Back to Home
        </Link>
      </header>

      <Box sx={{ mt: 3 }}>
        {!isComplete ? (
          <>
            <QuestionCard
              question={currentQuestion}
              onResponse={handleResponse}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              gridColors={gridColors}
            />
            
            {/* Show current scores if there are responses */}
            {responses.length > 0 && (
              <CurrentScores
                scores={functionScores}
                gridColors={gridColors}
                title="Current Function Preferences"
              />
            )}
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Your Type: {currentMBTI}
              </Typography>
              <Button 
                onClick={resetTest} 
                variant="outlined" 
                sx={MBTI_STYLES.outlinedButton}
              >
                Retake Test
              </Button>
            </Box>

            {/* Show final scores */}
            <CurrentScores
              scores={functionScores}
              gridColors={gridColors}
              title="Final Function Scores"
            />

            {/* Show top types */}
            {topTypes.length > 0 && (
              <TopTypesDisplay
                topTypes={topTypes}
                currentType={currentMBTI}
                gridColors={gridColors}
              />
            )}

            {/* Function Stack Editor */}
            <FunctionStackEditor
              functionStack={functionStack}
              onToggleFunction={handleToggleFunction}
              onSwapFunctions={handleSwapFunctions}
              gridColors={gridColors}
            />

            {/* MBTI Reference */}
            <MBTIReference
              currentType={currentMBTI}
              gridColors={gridColors}
            />
          </>
        )}
      </Box>
    </Container>
  );
};

export default QuestionSelector;

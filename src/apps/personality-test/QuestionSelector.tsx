import { Box, Button, Container, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { questions } from './data/mbtiData';
import { CognitiveFunction, CognitiveFunctionName, FunctionScores, Response } from './mbti';
import { calculateClosestTypes, calculateFunctionScores, calculateFunctionStackFromResponses, calculateMBTIFromStack } from './mbtiCalculations';
import { defaultGridColors, MBTI_STYLES } from './theme/mbtiTheme';

// Import new components
import CurrentScores from './components/CurrentScores';
import FunctionStackEditor from './components/FunctionStackEditor';
import MBTIReference from './components/MBTIReference';
import QuestionCard from './components/QuestionCard';
import TopTypesDisplay from './components/TopTypesDisplay';

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

  const gridColors = defaultGridColors;

  const getCurrentFunctionScores = useMemo((): FunctionScores => {
    return calculateFunctionScores(responses);
  }, [responses]);

  // Recalculate top types whenever the function stack or completion status changes
  const topTypes = useMemo(() => {
    return isComplete ? calculateClosestTypes(functionStack, responses, isComplete) : [];
  }, [functionStack, responses, isComplete]);

  // The current MBTI should always be the top-scoring type
  const getCurrentMBTI = useMemo((): string => {
    if (!isComplete) return 'XXXX';
    // If we have top types, use the first one as the current type
    if (topTypes.length > 0) {
      return topTypes[0].type;
    }
    // Fallback to stack calculation
    return calculateMBTIFromStack(functionStack);
  }, [functionStack, isComplete, topTypes]);

  const updateFunctionStackFromScores = useCallback(() => {
    if (responses.length >= questions.length) {
      const newStack = calculateFunctionStackFromResponses(responses);
      setFunctionStack(newStack);
    }
  }, [responses]);

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

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { Response, CognitiveFunction, FunctionScores } from './mbti';
import { questions } from './data/mbtiData';
import { calculateFunctionScores, calculateMBTIFromStack, calculateFunctionStackFromResponses, calculateClosestTypes } from './mbtiCalculations';

// Import new components
import QuestionCard from './components/QuestionCard';
import CurrentScores from './components/CurrentScores';
import FunctionStackEditor from './components/FunctionStackEditor';
import TopTypesDisplay from './components/TopTypesDisplay';
import MBTIReference from './components/MBTIReference';

const QuestionSelector: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [functionStack, setFunctionStack] = useState<CognitiveFunction[]>([
    { introverted: 'Ni', extroverted: 'Ne', isExtroverted: false, isAnimating: false },
    { introverted: 'Si', extroverted: 'Se', isExtroverted: true, isAnimating: false },
    { introverted: 'Ti', extroverted: 'Te', isExtroverted: false, isAnimating: false },
    { introverted: 'Fi', extroverted: 'Fe', isExtroverted: true, isAnimating: false },
  ]);

  const gridColors = {
    panel: '#4A6E8D',
    linkColor: '#7CE2FF',
    selectedPanel: '#5A7E9D',
  };

  const getCurrentFunctionScores = (): FunctionScores => {
    return calculateFunctionScores(responses);
  };

  const getCurrentMBTI = (): string => {
    return isComplete ? calculateMBTIFromStack(functionStack) : 'XXXX';
  };

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
    const currentQuestion = questions[currentQuestionIndex];
    const newResponses = responses.filter(r => r.questionId !== currentQuestion.id);
    newResponses.push({ questionId: currentQuestion.id, value });
    
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
      { introverted: 'Ni', extroverted: 'Ne', isExtroverted: false, isAnimating: false },
      { introverted: 'Si', extroverted: 'Se', isExtroverted: true, isAnimating: false },
      { introverted: 'Ti', extroverted: 'Te', isExtroverted: false, isAnimating: false },
      { introverted: 'Fi', extroverted: 'Fe', isExtroverted: true, isAnimating: false },
    ]);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentMBTI = getCurrentMBTI();
  const functionScores = getCurrentFunctionScores();
  const topTypes = isComplete ? calculateClosestTypes(functionStack, responses, isComplete) : [];

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
                sx={{ 
                  color: gridColors.linkColor, 
                  borderColor: gridColors.linkColor,
                  '&:hover': {
                    borderColor: gridColors.linkColor,
                    backgroundColor: 'rgba(124, 226, 255, 0.1)'
                  }
                }}
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

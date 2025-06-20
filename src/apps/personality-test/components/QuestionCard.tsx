import { Box, Button, Paper, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { Question } from '../mbti';
import { GridColors, MBTI_COLORS, MBTI_STYLES } from '../theme/mbtiTheme';

interface QuestionCardProps {
  question: Question;
  onResponse: (value: boolean | null) => void;
  questionNumber: number;
  totalQuestions: number;
  gridColors: GridColors;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onResponse,
  questionNumber,
  totalQuestions,
  gridColors
}) => {
  // Randomize which option appears first and gets which color
  const buttonLayout = useMemo(() => {
    const isExtrovertedFirst = Math.random() < 0.5;
    return {
      isExtrovertedFirst,
      firstColor: isExtrovertedFirst ? MBTI_COLORS.buttonGreen : MBTI_COLORS.buttonBlue,
      firstHoverColor: isExtrovertedFirst ? MBTI_COLORS.buttonGreenHover : MBTI_COLORS.buttonBlueHover,
      secondColor: isExtrovertedFirst ? MBTI_COLORS.buttonBlue : MBTI_COLORS.buttonGreen,
      secondHoverColor: isExtrovertedFirst ? MBTI_COLORS.buttonBlueHover : MBTI_COLORS.buttonGreenHover,
      firstText: isExtrovertedFirst ? question.extroverted : question.introverted,
      secondText: isExtrovertedFirst ? question.introverted : question.extroverted,
      firstValue: isExtrovertedFirst ? true : false,
      secondValue: isExtrovertedFirst ? false : true
    };
  }, [question.extroverted, question.introverted]);

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Question {questionNumber} of {totalQuestions}
      </Typography>
      
      <Paper sx={{ ...MBTI_STYLES.panel, mb: 3 }}>
        <Typography variant="h6" sx={{ 
          mb: 3, 
          textAlign: 'center',
          color: MBTI_COLORS.textPrimary,
          fontWeight: 'bold',
          fontSize: '1.3rem',
          lineHeight: 1.4
        }}>
          {question.text}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button
            variant="contained"
            onClick={() => onResponse(buttonLayout.firstValue)}
            sx={buttonLayout.isExtrovertedFirst ? MBTI_STYLES.questionButtonGreen : MBTI_STYLES.questionButtonBlue}
          >
            {buttonLayout.firstText}
          </Button>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: { xs: 'auto', sm: '100px' } }}>
            <Button
              variant="outlined"
              onClick={() => onResponse(null)}
              sx={{ 
                ...MBTI_STYLES.outlinedButton,
                minWidth: 'auto',
                px: 2,
                whiteSpace: 'nowrap'
              }}
            >
              I'm unsure
            </Button>
          </Box>
          
          <Button
            variant="contained"
            onClick={() => onResponse(buttonLayout.secondValue)}
            sx={buttonLayout.isExtrovertedFirst ? MBTI_STYLES.questionButtonBlue : MBTI_STYLES.questionButtonGreen}
          >
            {buttonLayout.secondText}
          </Button>
        </Box>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={MBTI_STYLES.secondaryText}>
            Choose the option that resonates more with you, or "I'm unsure" if you're unsure
          </Typography>
        </Box>
      </Paper>
    </>
  );
};

export default QuestionCard;

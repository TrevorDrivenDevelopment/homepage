import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Question } from '../mbti';

interface QuestionCardProps {
  question: Question;
  onResponse: (value: boolean | null) => void;
  questionNumber: number;
  totalQuestions: number;
  gridColors: {
    panel: string;
    linkColor: string;
    selectedPanel: string;
  };
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onResponse,
  questionNumber,
  totalQuestions,
  gridColors
}) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Question {questionNumber} of {totalQuestions}
      </Typography>
      
      <Paper sx={{ p: 3, bgcolor: gridColors.panel, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
          {question.text}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button
            variant="contained"
            onClick={() => onResponse(true)}
            sx={{ 
              bgcolor: '#4CAF50',
              '&:hover': { bgcolor: '#45a049' },
              flex: 1,
              maxWidth: { sm: '300px' },
              minHeight: '80px',
              p: 2,
              textAlign: 'center',
              whiteSpace: 'normal',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {question.optionA}
          </Button>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: { xs: 'auto', sm: '60px' } }}>
            <Button
              variant="outlined"
              onClick={() => onResponse(null)}
              sx={{ 
                color: gridColors.linkColor,
                borderColor: gridColors.linkColor,
                '&:hover': { 
                  borderColor: gridColors.linkColor,
                  backgroundColor: 'rgba(124, 226, 255, 0.1)'
                },
                minWidth: 'auto',
                px: 1
              }}
            >
              ?
            </Button>
          </Box>
          
          <Button
            variant="contained"
            onClick={() => onResponse(false)}
            sx={{ 
              bgcolor: '#2196F3',
              '&:hover': { bgcolor: '#1976D2' },
              flex: 1,
              maxWidth: { sm: '300px' },
              minHeight: '80px',
              p: 2,
              textAlign: 'center',
              whiteSpace: 'normal',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {question.optionB}
          </Button>
        </Box>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#B0BEC5' }}>
            Choose the option that resonates more with you, or "?" if you're unsure
          </Typography>
        </Box>
      </Paper>
    </>
  );
};

export default QuestionCard;

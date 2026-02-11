import { Component, For } from 'solid-js';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Box
} from '@suid/material';
import { Question } from '../types/mbti';

interface QuestionCardProps {
  question: Question;
  selectedValue: number | undefined; // undefined = unanswered
  onAnswer: (_value: number) => void;
  isOptional?: boolean; // Greyed out when dimension has sufficient confidence
}

const likertOptions = [
  { value: 2, label: 'Strongly A', shortLabel: 'SA' },
  { value: 1, label: 'Slightly A', shortLabel: 'A' },
  { value: 0, label: 'Neutral', shortLabel: '—' },
  { value: -1, label: 'Slightly B', shortLabel: 'B' },
  { value: -2, label: 'Strongly B', shortLabel: 'SB' },
];

const getLikertColor = (value: number, isSelected: boolean): string => {
  if (!isSelected) return '#1B3A57';
  switch (value) {
    case 2: return '#2e7d32';  // Deep green
    case 1: return '#66bb6a';  // Light green
    case 0: return '#757575';  // Grey
    case -1: return '#42a5f5'; // Light blue
    case -2: return '#1565c0'; // Deep blue
    default: return '#1B3A57';
  }
};

const QuestionCard: Component<QuestionCardProps> = (props) => {
  return (
    <Card sx={{ 
      mb: 2,
      backgroundColor: '#4A6E8D',
      border: '1px solid #4A6E8D',
      opacity: props.isOptional ? 0.65 : 1,
      transition: 'opacity 0.3s ease'
    }}>
      <CardContent>
        {/* Question text — no function type or category labels */}
        <Typography variant="h6" component="h3" sx={{ mb: 2, color: '#ffffff' }}>
          {props.question.text}
        </Typography>
        
        {/* Option A description */}
        <Typography variant="body2" sx={{ mb: 1, color: '#7CE2FF', fontWeight: 'bold' }}>
          A) {props.question.optionA}
        </Typography>
        
        {/* 5-point Likert scale */}
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 0.5, sm: 1 }, 
          justifyContent: 'center',
          my: 1.5,
          flexWrap: 'wrap'
        }}>
          <For each={likertOptions}>
            {(option) => {
              const isSelected = () => props.selectedValue === option.value;
              return (
                <Button
                  variant={isSelected() ? 'contained' : 'outlined'}
                  onClick={() => props.onAnswer(option.value)}
                  size="small"
                  sx={{ 
                    minWidth: { xs: '52px', sm: '80px' },
                    px: { xs: 0.5, sm: 1.5 },
                    py: 1,
                    textTransform: 'none',
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    backgroundColor: getLikertColor(option.value, isSelected()),
                    borderColor: isSelected() ? 'transparent' : '#7CE2FF',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: getLikertColor(option.value, true),
                      opacity: 0.85,
                      borderColor: '#ffffff'
                    }
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{option.label}</Box>
                  <Box sx={{ display: { xs: 'block', sm: 'none' } }}>{option.shortLabel}</Box>
                </Button>
              );
            }}
          </For>
        </Box>
        
        {/* Option B description */}
        <Typography variant="body2" sx={{ mt: 1, color: '#7CE2FF', fontWeight: 'bold' }}>
          B) {props.question.optionB}
        </Typography>

        {props.isOptional && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#ff9800', fontStyle: 'italic' }}>
            Optional — enough data collected for this dimension
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionCard;

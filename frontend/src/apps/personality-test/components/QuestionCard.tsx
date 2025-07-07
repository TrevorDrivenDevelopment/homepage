import { Component } from 'solid-js';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  ButtonGroup,
  Chip,
  Box
} from '@suid/material';
import { Question } from '../types/mbti';

interface QuestionCardProps {
  question: Question;
  selectedValue: boolean | null;
  onAnswer: (_value: boolean | null) => void;
}

const QuestionCard: Component<QuestionCardProps> = (props) => {
  const getButtonVariant = (option: boolean | null) => {
    return props.selectedValue === option ? 'contained' : 'outlined';
  };

  // Fixed colors to prevent changes when other questions are answered
  return (
    <Card sx={{ 
      mb: 2,
      backgroundColor: '#4A6E8D',
      border: '1px solid #4A6E8D'
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h3" sx={{ flex: 1, color: '#ffffff' }}>
            {props.question.text}
          </Typography>
          <Chip 
            label={props.question.functionType}
            size="small"
            variant="outlined"
            sx={{ 
              ml: 2,
              borderColor: '#7CE2FF',
              color: '#7CE2FF',
              backgroundColor: '#1B3A57'
            }}
          />
        </Box>
        
        <ButtonGroup 
          orientation="vertical" 
          variant="outlined" 
          fullWidth
          sx={{ gap: 1 }}
        >
          <Button
            variant={getButtonVariant(true)}
            onClick={() => props.onAnswer(true)}
            sx={{ 
              p: 2, 
              textAlign: 'left',
              justifyContent: 'flex-start',
              textTransform: 'none',
              backgroundColor: props.selectedValue === true ? '#4caf50' : '#1B3A57', // Green when selected
              borderColor: '#7CE2FF',
              color: props.selectedValue === true ? '#ffffff' : '#ffffff',
              '&:hover': {
                backgroundColor: props.selectedValue === true ? '#4caf50' : '#4A6E8D',
                borderColor: '#ffffff'
              }
            }}
          >
            <Typography variant="body1">
              A) {props.question.optionA}
            </Typography>
          </Button>
          
          <Button
            variant={getButtonVariant(null)}
            onClick={() => props.onAnswer(null)}
            sx={{ 
              p: 1, 
              textAlign: 'center',
              textTransform: 'none',
              backgroundColor: props.selectedValue === null ? '#ff9800' : '#1B3A57', // Orange when selected
              borderColor: '#7CE2FF',
              color: props.selectedValue === null ? '#1B3A57' : '#ffffff',
              '&:hover': {
                backgroundColor: props.selectedValue === null ? '#ff9800' : '#4A6E8D',
                borderColor: '#ffffff'
              }
            }}
          >
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              I'm unsure
            </Typography>
          </Button>
          
          <Button
            variant={getButtonVariant(false)}
            onClick={() => props.onAnswer(false)}
            sx={{ 
              p: 2, 
              textAlign: 'left',
              justifyContent: 'flex-start',
              textTransform: 'none',
              backgroundColor: props.selectedValue === false ? '#2196f3' : '#1B3A57', // Blue when selected
              borderColor: '#7CE2FF',
              color: props.selectedValue === false ? '#ffffff' : '#ffffff',
              '&:hover': {
                backgroundColor: props.selectedValue === false ? '#2196f3' : '#4A6E8D',
                borderColor: '#ffffff'
              }
            }}
          >
            <Typography variant="body1">
              B) {props.question.optionB}
            </Typography>
          </Button>
        </ButtonGroup>
        
        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#7CE2FF' }}>
          Category: {props.question.category}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;

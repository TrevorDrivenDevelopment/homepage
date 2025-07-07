import { Component, For } from 'solid-js';
import { 
  Card, 
  CardContent, 
  Typography, 
  LinearProgress, 
  Box, 
  Stack 
} from '@suid/material';
import { FunctionScores } from '../types/mbti';

interface CurrentScoresProps {
  scores: FunctionScores;
  enhancedScores: FunctionScores;
}

// Some things to consider -- Should there be Ni vs Si and Ne vs Se questions?
const functionNames = {
  'Ni/Ne': { name: 'Intuition', extroverted: 'Ne', introverted: 'Ni' },
  'Si/Se': { name: 'Sensing', extroverted: 'Se', introverted: 'Si' },
  'Ti/Te': { name: 'Thinking', extroverted: 'Te', introverted: 'Ti' },
  'Fi/Fe': { name: 'Feeling', extroverted: 'Fe', introverted: 'Fi' }
};

const functionColors = {
  'Ni': '#9c27b0', 'Ne': '#e91e63',
  'Si': '#795548', 'Se': '#ff9800', 
  'Ti': '#2196f3', 'Te': '#03a9f4',
  'Fi': '#4caf50', 'Fe': '#8bc34a'
};

const CurrentScores: Component<CurrentScoresProps> = (props) => {
  const getPreferenceText = (score: number, functionType: keyof FunctionScores) => {
    const functions = functionNames[functionType];
    if (score > 0) {
      return `${functions.extroverted} preference`;
    } else if (score < 0) {
      return `${functions.introverted} preference`;
    } else {
      return 'No clear preference';
    }
  };

  const getProgressValue = (score: number) => {
    const maxScore = 15; // Approximate max based on question count
    return Math.min(Math.abs(score) / maxScore * 100, 100);
  };

  const getProgressColor = (score: number, functionType: keyof FunctionScores) => {
    const functions = functionNames[functionType];
    const activeFunction = score > 0 ? functions.extroverted : functions.introverted;
    return functionColors[activeFunction as keyof typeof functionColors] || '#grey';
  };

  return (
    <Card sx={{
      backgroundColor: '#4A6E8D',
      border: '1px solid #4A6E8D',
      maxWidth: '100%'
    }}>
      <CardContent sx={{ padding: '16px !important' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', fontSize: '1.1rem' }}>
          Function Preferences
        </Typography>
        
        <Stack spacing={2}>
          <For each={Object.entries(props.scores) as [keyof FunctionScores, number][]}>
            {([functionType, score]) => (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ffffff', fontSize: '0.9rem' }}>
                    {functionNames[functionType].name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7CE2FF', fontSize: '0.8rem' }}>
                    {score > 0 ? '+' : ''}{score}
                  </Typography>
                </Box>
                
                <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: '#7CE2FF', fontSize: '0.75rem' }}>
                  {getPreferenceText(score, functionType)}
                </Typography>
                
                <LinearProgress
                  variant="determinate"
                  value={getProgressValue(score)}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#1B3A57',
                    '& .suid-linear-progress-bar': {
                      backgroundColor: getProgressColor(score, functionType),
                      borderRadius: 3
                    }
                  }}
                />
              </Box>
            )}
          </For>
        </Stack>
        
        <Typography variant="caption" sx={{ mt: 1.5, display: 'block', color: '#7CE2FF', fontSize: '0.7rem' }}>
          Positive scores indicate extroverted function preference, negative scores indicate introverted function preference.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CurrentScores;

import React from 'react';
import { Box, Typography } from '@mui/material';
import { FunctionScores } from '../mbti';

interface CurrentScoresProps {
  scores: FunctionScores;
  gridColors: {
    panel: string;
    linkColor: string;
    selectedPanel: string;
  };
  title: string;
}

const CurrentScores: React.FC<CurrentScoresProps> = ({ scores, gridColors, title }) => {
  return (
    <Box sx={{ mb: 3, p: 2, bgcolor: gridColors.selectedPanel, borderRadius: 2 }}>
      <Typography variant="body2" gutterBottom>
        <strong>{title}:</strong>
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {Object.entries(scores).map(([functionType, score]) => {
          const [introverted, extroverted] = functionType.split('/');
          const tendency = score > 0 ? `${extroverted} focused` : score < 0 ? `${introverted} focused` : 'Balanced';
          const strength = Math.abs(score);
          return (
            <Typography key={functionType} variant="body2" sx={{ color: '#B0BEC5' }}>
              <strong>{functionType}:</strong> {tendency} {strength > 0 && `(${strength})`}
            </Typography>
          );
        })}
      </Box>
    </Box>
  );
};

export default CurrentScores;

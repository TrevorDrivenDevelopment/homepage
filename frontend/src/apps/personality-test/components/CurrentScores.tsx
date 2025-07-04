import { Box, Typography } from '@mui/material';
import React from 'react';
import { CognitiveFunctionName, CognitiveFunctionType, FunctionScores } from '../types';
import { GridColors, MBTI_STYLES } from '../theme/mbtiTheme';

interface CurrentScoresProps {
  scores: FunctionScores;
  gridColors: GridColors;
  title: string;
}

// Function type display names - only for types used in FunctionScores
const functionTypeNames: Record<keyof FunctionScores, { name: string; extroverted: CognitiveFunctionName | string; introverted: CognitiveFunctionName | string }> = {
  [CognitiveFunctionType.INTUITION]: { name: 'Intuition', extroverted: CognitiveFunctionName.NE, introverted: CognitiveFunctionName.NI },
  [CognitiveFunctionType.SENSING]: { name: 'Sensing', extroverted: CognitiveFunctionName.SE, introverted: CognitiveFunctionName.SI },
  [CognitiveFunctionType.THINKING]: { name: 'Thinking', extroverted: CognitiveFunctionName.TE, introverted: CognitiveFunctionName.TI },
  [CognitiveFunctionType.FEELING]: { name: 'Feeling', extroverted: CognitiveFunctionName.FE, introverted: CognitiveFunctionName.FI }
};

const CurrentScores: React.FC<CurrentScoresProps> = ({ scores, gridColors, title }) => {
  return (
    <Box sx={{ mb: 3, ...MBTI_STYLES.panelSelected }}>
      <Typography variant="body2" gutterBottom>
        <strong>{title}:</strong>
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {Object.entries(scores).map(([functionType, score]) => {
          const typeInfo = functionTypeNames[functionType as keyof FunctionScores];
          
          const tendency = score > 0 ? `${typeInfo.extroverted} focused` : score < 0 ? `${typeInfo.introverted} focused` : 'Balanced';
          const strength = Math.abs(score);
          // Round to 2 decimal places to avoid floating point precision errors
          const roundedStrength = Math.round(strength * 100) / 100;
          return (
            <Typography key={functionType} variant="body2" sx={MBTI_STYLES.secondaryText}>
              <strong>{typeInfo.name}:</strong> {tendency} {roundedStrength > 0 && `(${roundedStrength})`}
            </Typography>
          );
        })}
      </Box>
    </Box>
  );
};

export default CurrentScores;

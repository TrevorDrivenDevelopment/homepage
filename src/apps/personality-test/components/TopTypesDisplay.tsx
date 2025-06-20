import { Box, Typography } from '@mui/material';
import React from 'react';
import { mbtiTypes } from '../data/mbtiData';
import { TypeResult } from '../mbti';
import { GridColors, MBTI_STYLES, getMatchBorderStyles } from '../theme/mbtiTheme';

interface TopTypesDisplayProps {
  topTypes: TypeResult[];
  currentType: string;
  gridColors: GridColors;
}

const TopTypesDisplay: React.FC<TopTypesDisplayProps> = ({ topTypes, currentType, gridColors }) => {
  return (
    <Box sx={{ mb: 3, ...MBTI_STYLES.panel }}>
      <Typography variant="h6" gutterBottom>
        Your Top 3 Closest Types
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {topTypes.map((typeResult, index) => {
          const typeInfo = mbtiTypes[typeResult.type];
          // The answer type is always the first one (index 0)
          const isMainType = index === 0;
          return (
            <Box
              key={typeResult.type}
              sx={{
                p: 2,
                borderRadius: 2,
                ...getMatchBorderStyles(isMainType),
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ color: isMainType ? gridColors.linkColor : 'inherit' }}>
                  #{index + 1}: {typeResult.type} {isMainType && '⭐'}
                </Typography>
                <Typography variant="body2" sx={MBTI_STYLES.secondaryText}>
                  {typeResult.match} (Score: {typeResult.score})
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Functions:</strong> {typeInfo.functions.join(' → ')}
              </Typography>
              <Typography variant="body2" sx={MBTI_STYLES.secondaryText}>
                {typeInfo.description}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default TopTypesDisplay;

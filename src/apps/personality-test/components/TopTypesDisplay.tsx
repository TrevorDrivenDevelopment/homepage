import React from 'react';
import { Box, Typography } from '@mui/material';
import { TypeResult } from '../mbti';
import { mbtiTypes } from '../data/mbtiData';

interface TopTypesDisplayProps {
  topTypes: TypeResult[];
  currentType: string;
  gridColors: {
    panel: string;
    linkColor: string;
    selectedPanel: string;
  };
}

const TopTypesDisplay: React.FC<TopTypesDisplayProps> = ({ topTypes, currentType, gridColors }) => {
  return (
    <Box sx={{ mb: 3, p: 3, bgcolor: gridColors.panel, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Your Top 3 Closest Types
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {topTypes.map((typeResult, index) => {
          const typeInfo = mbtiTypes[typeResult.type];
          const isMainType = typeResult.type === currentType;
          return (
            <Box
              key={typeResult.type}
              sx={{
                p: 2,
                border: `2px solid ${isMainType ? gridColors.linkColor : '#666'}`,
                borderRadius: 2,
                bgcolor: isMainType ? 'rgba(124, 226, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ color: isMainType ? gridColors.linkColor : 'inherit' }}>
                  #{index + 1}: {typeResult.type} {isMainType && '⭐'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#B0BEC5' }}>
                  {typeResult.match} (Score: {typeResult.score})
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Functions:</strong> {typeInfo.functions.join(' → ')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#B0BEC5' }}>
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

import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import React from 'react';
import { functionDescriptions, mbtiTypes } from '../calculation/mbtiData';
import { CognitiveFunctionName } from '../types';
import { GridColors, MBTI_STYLES, getTypeHighlightStyles } from '../theme/mbtiTheme';

interface MBTIReferenceProps {
  currentType: string;
  gridColors: GridColors;
}

const MBTIReference: React.FC<MBTIReferenceProps> = ({ currentType, gridColors }) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        MBTI Type Reference
      </Typography>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: 2, 
        alignItems: 'start', 
        '@media (max-width: 1200px)': { gridTemplateColumns: 'repeat(3, 1fr)' }, 
        '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' }, 
        '@media (max-width: 600px)': { gridTemplateColumns: '1fr' } 
      }}>
        {Object.entries(mbtiTypes).map(([type, info]) => (
          <Accordion key={type} sx={{ 
            ...MBTI_STYLES.panel,
            alignSelf: 'start',
            '&.Mui-expanded': {
              margin: 0,
              '&:before': {
                opacity: 1,
              },
            },
          }}>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon sx={{ color: gridColors.linkColor }} />}
              sx={{
                '&.Mui-expanded': {
                  minHeight: 48,
                },
                '& .MuiAccordionSummary-content': {
                  '&.Mui-expanded': {
                    margin: '12px 0',
                  },
                },
              }}
            >
              <Box>
                <Typography variant="h6" sx={getTypeHighlightStyles(type === currentType)}>
                  {type}
                  {type === currentType && ' ⭐'}
                </Typography>
                <Typography variant="body2" sx={MBTI_STYLES.secondaryText}>
                  {info.functions.join(' → ')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {info.description}
              </Typography>
              <Typography variant="body2" sx={MBTI_STYLES.secondaryText}>
                <strong>Function Stack:</strong>
              </Typography>
              <Box sx={{ mt: 1 }}>
                {info.functions.map((func: CognitiveFunctionName, index: number) => (
                  <Typography key={index} variant="body2" sx={{ ...MBTI_STYLES.secondaryText, ml: 1 }}>
                    {index + 1}. {func} - {functionDescriptions[func]?.split(' - ')[1] || func}
                  </Typography>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
};

export default MBTIReference;

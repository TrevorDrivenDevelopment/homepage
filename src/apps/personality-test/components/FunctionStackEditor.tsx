import { Box, Button, Paper, Switch, Typography } from '@mui/material';
import React from 'react';
import { functionDescriptions } from '../calculation/mbtiData';
import { useResponsiveInfo } from '../hooks/useResponsiveInfo';
import { CognitiveFunction } from '../types';
import { GridColors, MBTI_ANIMATIONS, MBTI_STYLES, getAnimatedStyles } from '../theme/mbtiTheme';
import InfoModal from './InfoModal';
import ResponsiveInfoIcon from './ResponsiveInfoIcon';

interface FunctionStackEditorProps {
  functionStack: CognitiveFunction[];
  onToggleFunction: (index: number) => void;
  onSwapFunctions: (index1: number, index2: number) => void;
  gridColors: GridColors;
}

const FunctionStackEditor: React.FC<FunctionStackEditorProps> = ({
  functionStack,
  onToggleFunction,
  onSwapFunctions,
  gridColors
}) => {
  const { isMobile, modalOpen, modalContent, showInfo, closeModal } = useResponsiveInfo();

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Function Stack:
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '400px', mx: 'auto', gap: 2 }}>
        {functionStack.map((func, index) => (
          <Paper key={index} sx={{ 
            p: 2, 
            width: '100%',
            position: 'relative',
            ...getAnimatedStyles(func.isAnimating || false),
          }}>
            {/* Up arrow on top left */}
            {index > 0 && (
              <Button 
                size="small"
                onClick={() => onSwapFunctions(index, index - 1)}
                sx={{ 
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  ...MBTI_STYLES.navigationArrow
                }}
                title="Move up"
              >
                ↑
              </Button>
            )}
            
            {/* Down arrow on bottom right */}
            {index < functionStack.length - 1 && (
              <Button 
                size="small"
                onClick={() => onSwapFunctions(index, index + 1)}
                sx={{ 
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  ...MBTI_STYLES.navigationArrow
                }}
                title="Move down"
              >
                ↓
              </Button>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6" sx={{ 
                transition: MBTI_ANIMATIONS.transition.default,
                opacity: func.isAnimating ? 0.7 : 1 
              }}>
                {index === 0 ? 'Dominant' : index === 1 ? 'Auxiliary' : index === 2 ? 'Tertiary' : 'Inferior'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ 
                  minWidth: '30px', 
                  textAlign: 'center',
                  transition: MBTI_ANIMATIONS.transition.default,
                  opacity: func.isAnimating ? 0.7 : 1 
                }}>
                  {func.introverted}
                </Typography>
                <ResponsiveInfoIcon
                  title={func.introverted}
                  description={functionDescriptions[func.introverted]}
                  color={gridColors.linkColor}
                  isMobile={isMobile}
                  onShowInfo={showInfo}
                />
              </Box>
              <Switch
                checked={func.isExtroverted}
                onChange={() => onToggleFunction(index)}
                sx={{
                  ...MBTI_STYLES.switchComponent,
                  transition: MBTI_ANIMATIONS.transition.default,
                  opacity: func.isAnimating ? 0.7 : 1
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ 
                  minWidth: '30px', 
                  textAlign: 'center',
                  transition: MBTI_ANIMATIONS.transition.default,
                  opacity: func.isAnimating ? 0.7 : 1 
                }}>
                  {func.extroverted}
                </Typography>
                <ResponsiveInfoIcon
                  title={func.extroverted}
                  description={functionDescriptions[func.extroverted]}
                  color={gridColors.linkColor}
                  isMobile={isMobile}
                  onShowInfo={showInfo}
                />
              </Box>
            </Box>
            
            <Typography variant="body2" sx={{ 
              textAlign: 'center', 
              mt: 1, 
              ...MBTI_STYLES.secondaryText,
              transition: MBTI_ANIMATIONS.transition.default,
              opacity: func.isAnimating ? 0.7 : 1 
            }}>
              {func.isExtroverted ? func.extroverted : func.introverted}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Box sx={{ mt: 3, ...MBTI_STYLES.panelSelected }}>
        <Typography variant="body1">
          <strong>Current Stack:</strong> {functionStack.map(f => f.isExtroverted ? f.extroverted : f.introverted).join(', ')}
        </Typography>
      </Box>

      <InfoModal
        open={modalOpen}
        title={modalContent.title}
        description={modalContent.description}
        onClose={closeModal}
      />
    </>
  );
};

export default FunctionStackEditor;

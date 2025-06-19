import React from 'react';
import { Box, Button, Paper, Switch, Typography } from '@mui/material';
import { CognitiveFunction } from '../mbti';
import { functionDescriptions } from '../data/mbtiData';
import { useResponsiveInfo } from '../hooks/useResponsiveInfo';
import InfoModal from './InfoModal';
import ResponsiveInfoIcon from './ResponsiveInfoIcon';

interface FunctionStackEditorProps {
  functionStack: CognitiveFunction[];
  onToggleFunction: (index: number) => void;
  onSwapFunctions: (index1: number, index2: number) => void;
  gridColors: {
    panel: string;
    linkColor: string;
    selectedPanel: string;
  };
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
            bgcolor: func.isAnimating ? '#5A8DB5' : gridColors.panel,
            width: '100%',
            position: 'relative',
            transition: 'all 0.3s ease-in-out',
            transform: func.isAnimating ? 'scale(1.02)' : 'scale(1)',
            boxShadow: func.isAnimating ? '0 8px 25px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.1)',
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
                  color: gridColors.linkColor,
                  minWidth: 'auto',
                  p: 0.5,
                  fontSize: '1.2rem',
                  height: '32px',
                  width: '32px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    backgroundColor: 'rgba(124, 226, 255, 0.1)'
                  }
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
                  color: gridColors.linkColor,
                  minWidth: 'auto',
                  p: 0.5,
                  fontSize: '1.2rem',
                  height: '32px',
                  width: '32px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    backgroundColor: 'rgba(124, 226, 255, 0.1)'
                  }
                }}
                title="Move down"
              >
                ↓
              </Button>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6" sx={{ 
                transition: 'all 0.3s ease',
                opacity: func.isAnimating ? 0.7 : 1 
              }}>
                Function {index + 1}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ 
                  minWidth: '30px', 
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
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
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: gridColors.linkColor,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: gridColors.linkColor,
                  },
                  transition: 'all 0.3s ease',
                  opacity: func.isAnimating ? 0.7 : 1
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ 
                  minWidth: '30px', 
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
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
              color: '#B0BEC5',
              transition: 'all 0.3s ease',
              opacity: func.isAnimating ? 0.7 : 1 
            }}>
              {func.isExtroverted ? func.extroverted : func.introverted}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: gridColors.selectedPanel, borderRadius: 2 }}>
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

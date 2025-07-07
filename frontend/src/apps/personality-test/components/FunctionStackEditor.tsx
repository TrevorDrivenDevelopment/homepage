import { Component, For } from 'solid-js';
import {
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  Stack,
  Box,
  Chip
} from '@suid/material';
import { CognitiveFunction } from '../types/mbti';

interface FunctionStackEditorProps {
  functionStack: CognitiveFunction[];
  onStackChange: (newStack: CognitiveFunction[]) => void;
}

const allFunctions = [
  'Ni', 'Ne', 'Si', 'Se', 'Ti', 'Te', 'Fi', 'Fe'
];

const functionColors: Record<string, string> = {
  'Ni': '#9c27b0', 'Ne': '#e91e63',
  'Si': '#795548', 'Se': '#ff9800',
  'Ti': '#2196f3', 'Te': '#03a9f4',
  'Fi': '#4caf50', 'Fe': '#8bc34a'
};

const FunctionStackEditor: Component<FunctionStackEditorProps> = (props) => {
  const updateFunction = (position: number, newFunction: string) => {
    const newStack = [...props.functionStack];
    const [introverted, extroverted] = newFunction.includes('i') 
      ? [newFunction, newFunction.replace('i', 'e')]
      : [newFunction.replace('e', 'i'), newFunction];
    
    newStack[position] = {
      introverted,
      extroverted,
      isExtroverted: newFunction.includes('e'),
      isAnimating: false
    };
    
    props.onStackChange(newStack);
  };

  const toggleOrientation = (position: number) => {
    const newStack = [...props.functionStack];
    newStack[position] = {
      ...newStack[position],
      isExtroverted: !newStack[position].isExtroverted
    };
    props.onStackChange(newStack);
  };

  const getActiveFunction = (func: CognitiveFunction): string => {
    return func.isExtroverted ? func.extroverted : func.introverted;
  };

  const positionLabels = ['Dominant', 'Auxiliary', 'Tertiary', 'Inferior'];

  return (
    <Card sx={{
      backgroundColor: '#4A6E8D',
      border: '1px solid #4A6E8D'
    }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
          Edit Function Stack
        </Typography>
        
        <Stack spacing={3}>
          <For each={props.functionStack}>
            {(func, index) => {
              const activeFunc = getActiveFunction(func);
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ minWidth: 80, fontWeight: 'bold' }}>
                    {positionLabels[index()]}:
                  </Typography>
                  
                  <Select
                    value={activeFunc}
                    onChange={(e) => updateFunction(index(), e.target.value as string)}
                    size="small"
                    sx={{ minWidth: 80 }}
                  >
                    <For each={allFunctions}>
                      {(funcName) => (
                        <MenuItem value={funcName}>
                          {funcName}
                        </MenuItem>
                      )}
                    </For>
                  </Select>
                  
                  <Chip
                    label={activeFunc}
                    sx={{
                      backgroundColor: functionColors[activeFunc],
                      color: 'white',
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleOrientation(index())}
                  />
                  
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Click to toggle orientation
                  </Typography>
                </Box>
              );
            }}
          </For>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FunctionStackEditor;

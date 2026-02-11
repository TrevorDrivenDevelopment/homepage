import { Component, For, Show } from 'solid-js';
import { 
  Card, 
  CardContent, 
  Typography, 
  LinearProgress, 
  Box, 
  Stack,
  Chip
} from '@suid/material';
import { FunctionScores } from '../types/mbti';
import { DimensionConfidence } from '../mbtiCalculations';
import { mbtiTypes } from '../data/mbtiData';

interface CurrentScoresProps {
  scores: FunctionScores;
  enhancedScores: FunctionScores;
  dimensionConfidence?: DimensionConfidence[];
  confidenceSufficient?: boolean;
  currentType?: string;
}

const functionNames: Record<string, { name: string; extroverted: string; introverted: string }> = {
  'Ni/Ne': { name: 'Intuition', extroverted: 'Ne', introverted: 'Ni' },
  'Si/Se': { name: 'Sensing', extroverted: 'Se', introverted: 'Si' },
  'Ti/Te': { name: 'Thinking', extroverted: 'Te', introverted: 'Ti' },
  'Fi/Fe': { name: 'Feeling', extroverted: 'Fe', introverted: 'Fi' }
};

// Map individual function names back to their dimension key
const functionToDimension: Record<string, keyof FunctionScores> = {
  'Ni': 'Ni/Ne', 'Ne': 'Ni/Ne',
  'Si': 'Si/Se', 'Se': 'Si/Se',
  'Ti': 'Ti/Te', 'Te': 'Ti/Te',
  'Fi': 'Fi/Fe', 'Fe': 'Fi/Fe'
};

const functionColors: Record<string, string> = {
  'Ni': '#9c27b0', 'Ne': '#e91e63',
  'Si': '#795548', 'Se': '#ff9800', 
  'Ti': '#2196f3', 'Te': '#03a9f4',
  'Fi': '#4caf50', 'Fe': '#8bc34a'
};

const clarityColors: Record<string, string> = {
  'Very clear': '#4caf50',
  'Clear': '#8bc34a',
  'Slight': '#ff9800',
  'Undifferentiated': '#f44336'
};

/** Get the theoretical function for a dimension from the matched MBTI type's stack */
const getTheoreticalFunction = (currentType: string, dimension: string): string | null => {
  const typeInfo = mbtiTypes[currentType];
  if (!typeInfo) return null;
  
  // Find which function from this dimension appears in the type's stack
  const fns = functionNames[dimension];
  if (!fns) return null;
  
  if (typeInfo.functions.includes(fns.extroverted)) return fns.extroverted;
  if (typeInfo.functions.includes(fns.introverted)) return fns.introverted;
  return null;
};

/** Get the stack position (1-4) of a function in a type's stack */
const getStackPosition = (currentType: string, funcName: string): number | null => {
  const typeInfo = mbtiTypes[currentType];
  if (!typeInfo) return null;
  const idx = typeInfo.functions.indexOf(funcName);
  return idx >= 0 ? idx + 1 : null;
};

const positionLabels: Record<number, string> = {
  1: 'Dominant',
  2: 'Auxiliary',
  3: 'Tertiary',
  4: 'Inferior'
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

  const getUserFunction = (score: number, functionType: keyof FunctionScores): string => {
    const functions = functionNames[functionType];
    return score >= 0 ? functions.extroverted : functions.introverted;
  };

  const getProgressValue = (score: number) => {
    const maxScore = 16; // 8 questions × max value 2
    return Math.min(Math.abs(score) / maxScore * 100, 100);
  };

  const getProgressColor = (score: number, functionType: keyof FunctionScores) => {
    const functions = functionNames[functionType];
    const activeFunction = score > 0 ? functions.extroverted : functions.introverted;
    return functionColors[activeFunction] || '#grey';
  };

  const getDimensionConf = (dim: string) => {
    return props.dimensionConfidence?.find(d => d.dimension === dim);
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

        {/* Sufficient confidence banner */}
        <Show when={props.confidenceSufficient}>
          <Box sx={{ 
            mb: 2, p: 1, 
            backgroundColor: 'rgba(76, 175, 80, 0.15)', 
            borderRadius: 1, 
            border: '1px solid #4caf50' 
          }}>
            <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
              ✓ Sufficient data — results are reliable. Remaining questions are optional.
            </Typography>
          </Box>
        </Show>
        
        <Stack spacing={2}>
          <For each={Object.entries(props.scores) as [keyof FunctionScores, number][]}>
            {([functionType, score]) => {
              const conf = () => getDimensionConf(functionType);
              const userFunc = () => getUserFunction(score, functionType);
              const theoreticalFunc = () => props.currentType && props.currentType !== 'XXXX' 
                ? getTheoreticalFunction(props.currentType, functionType) 
                : null;
              const hasDiscrepancy = () => theoreticalFunc() !== null && theoreticalFunc() !== userFunc();
              const stackPos = () => theoreticalFunc() ? getStackPosition(props.currentType!, theoreticalFunc()!) : null;
              
              return (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ffffff', fontSize: '0.9rem' }}>
                      {functionNames[functionType].name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ color: '#7CE2FF', fontSize: '0.8rem' }}>
                        {score > 0 ? '+' : ''}{score}
                      </Typography>
                      <Show when={conf()}>
                        <Chip 
                          label={`${conf()!.label} (${conf()!.clarity}%)`}
                          size="small"
                          sx={{ 
                            fontSize: '0.6rem', 
                            height: '20px',
                            backgroundColor: 'transparent',
                            borderColor: clarityColors[conf()!.label] || '#7CE2FF',
                            color: clarityColors[conf()!.label] || '#7CE2FF',
                            border: '1px solid'
                          }}
                        />
                      </Show>
                    </Box>
                  </Box>
                  
                  {/* User's measured preference */}
                  <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: '#7CE2FF', fontSize: '0.75rem' }}>
                    {getPreferenceText(score, functionType)}
                    {conf() && ` · ${conf()!.answeredCount} questions answered`}
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

                  {/* Theoretical expectation from matched type */}
                  <Show when={theoreticalFunc()}>
                    <Box sx={{ 
                      mt: 0.5, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5 
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: hasDiscrepancy() ? '#ffb74d' : 'rgba(255,255,255,0.5)', 
                        fontSize: '0.7rem' 
                      }}>
                        {hasDiscrepancy() ? '⚠' : '✓'} {props.currentType} expects{' '}
                        <span style={{ 
                          color: functionColors[theoreticalFunc()!] || '#7CE2FF',
                          "font-weight": 'bold' 
                        }}>
                          {theoreticalFunc()}
                        </span>
                        {stackPos() && ` (${positionLabels[stackPos()!]})`}
                        {hasDiscrepancy() && ` — your answers suggest ${userFunc()}`}
                      </Typography>
                    </Box>
                  </Show>
                </Box>
              );
            }}
          </For>
        </Stack>
        
        <Typography variant="caption" sx={{ mt: 1.5, display: 'block', color: '#7CE2FF', fontSize: '0.7rem' }}>
          Positive scores indicate extroverted function preference, negative scores indicate introverted function preference.
          Clarity % shows how decisive your preference is for each dimension.
        </Typography>

        <Show when={props.currentType && props.currentType !== 'XXXX'}>
          <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontStyle: 'italic' }}>
            ⚠ markers show where your measured preference differs from the theoretical {props.currentType} stack.
            This is common for tertiary/inferior functions, where theory predicts the opposite of conscious preference.
          </Typography>
        </Show>
      </CardContent>
    </Card>
  );
};

export default CurrentScores;

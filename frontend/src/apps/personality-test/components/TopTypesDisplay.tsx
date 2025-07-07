import { Component, For } from 'solid-js';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Box, 
  Stack, 
  LinearProgress 
} from '@suid/material';
import { TypeResult } from '../types/mbti';
import { mbtiTypes } from '../data/mbtiData';

interface TopTypesDisplayProps {
  topTypes: TypeResult[];
  currentType: string;
  isComplete: boolean;
}

const getMatchColor = (match: string) => {
  switch (match.toLowerCase()) {
    case 'excellent match': return 'success';
    case 'very good match': return 'info';
    case 'good match': return 'primary';
    case 'partial match': return 'warning';
    default: return 'default';
  }
};

const TopTypesDisplay: Component<TopTypesDisplayProps> = (props) => {
  return (
    <Card sx={{
      backgroundColor: '#4A6E8D',
      border: '1px solid #4A6E8D'
    }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
          {props.isComplete ? 'Final Results' : 'Current Best Matches'}
        </Typography>
        
        <Stack spacing={2}>
          <For each={props.topTypes}>
            {(typeResult, index) => {
              const typeInfo = mbtiTypes[typeResult.type];
              const isCurrentType = typeResult.type === props.currentType;
              
              return (
                <Box 
                  sx={{ 
                    p: 2, 
                    border: 1, 
                    borderColor: isCurrentType ? '#7CE2FF' : '#4A6E8D',
                    borderRadius: 1,
                    backgroundColor: isCurrentType ? '#1B3A57' : '#1B3A57'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                        #{index() + 1}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                        {typeResult.type}
                      </Typography>
                      {isCurrentType && (
                        <Chip 
                          label="Current Type" 
                          size="small" 
                          variant="filled"
                          sx={{
                            backgroundColor: '#7CE2FF',
                            color: '#1B3A57'
                          }}
                        />
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                        Score: {typeResult.score}
                      </Typography>
                      <Chip 
                        label={typeResult.match}
                        size="small"
                        color={getMatchColor(typeResult.match)}
                        variant="outlined"
                        sx={{
                          borderColor: '#7CE2FF',
                          color: '#7CE2FF'
                        }}
                      />
                    </Box>
                  </Box>
                  
                  {typeInfo && (
                    <>
                      <Typography variant="body2" sx={{ mb: 1, color: '#7CE2FF' }}>
                        {typeInfo.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ mr: 1, color: '#ffffff' }}>
                          Function Stack:
                        </Typography>
                        <For each={typeInfo.functions}>
                          {(func, funcIndex) => (
                            <Chip 
                              label={func}
                              size="small"
                              variant={funcIndex() === 0 ? 'filled' : 'outlined'}
                              sx={{ 
                                fontSize: '0.7rem',
                                backgroundColor: funcIndex() === 0 ? '#7CE2FF' : 'transparent',
                                color: funcIndex() === 0 ? '#1B3A57' : '#7CE2FF',
                                borderColor: '#7CE2FF'
                              }}
                            />
                          )}
                        </For>
                      </Box>
                    </>
                  )}
                  
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(typeResult.score, 100)}
                    sx={{
                      mt: 1,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#4A6E8D',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#7CE2FF'
                      }
                    }}
                  />
                </Box>
              );
            }}
          </For>
        </Stack>
        
        {!props.isComplete && (
          <Typography variant="caption" sx={{ mt: 2, display: 'block', color: '#7CE2FF' }}>
            Complete all questions for final results and more accurate type matching.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default TopTypesDisplay;

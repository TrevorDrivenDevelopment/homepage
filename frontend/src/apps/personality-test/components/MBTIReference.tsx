import { Component, createSignal, For, Show } from 'solid-js';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Chip,
  Box,
  Grid
} from '@suid/material';
import { functionDescriptions, mbtiTypes } from '../data/mbtiData';

interface MBTIReferenceProps {
  currentType: () => string;
  gridColors: Record<string, string>;
}

const MBTIReference: Component<MBTIReferenceProps> = (props) => {
  const [expandedFunctions, setExpandedFunctions] = createSignal(false);
  const [expandedTypes, setExpandedTypes] = createSignal(false);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#ffffff' }}>
        MBTI Reference
      </Typography>
      
      {/* Cognitive Functions Reference */}
      <Card sx={{ 
        mb: 2,
        backgroundColor: '#4A6E8D',
        border: '1px solid #4A6E8D'
      }}>
        <CardContent>
          <Button 
            onClick={() => setExpandedFunctions(!expandedFunctions())}
            variant="text"
            fullWidth
            sx={{ 
              justifyContent: 'flex-start', 
              mb: 1,
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#1B3A57'
              }
            }}
          >
            <Typography variant="h6" sx={{ color: '#ffffff' }}>
              Cognitive Functions {expandedFunctions() ? '▼' : '▶'}
            </Typography>
          </Button>
          
          <Show when={expandedFunctions()}>
            <Grid container spacing={2}>
              <For each={Object.entries(functionDescriptions)}>
                {([funcName, description]) => (
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined" sx={{
                      backgroundColor: '#1B3A57',
                      borderColor: '#4A6E8D'
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                          <Chip 
                            label={funcName}
                            size="small"
                            sx={{ 
                              mr: 1,
                              backgroundColor: '#7CE2FF',
                              color: '#1B3A57'
                            }}
                          />
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#7CE2FF' }}>
                          {description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </For>
            </Grid>
          </Show>
        </CardContent>
      </Card>

      {/* All MBTI Types Reference */}
      <Card sx={{
        backgroundColor: '#4A6E8D',
        border: '1px solid #4A6E8D'
      }}>
        <CardContent>
          <Button 
            onClick={() => setExpandedTypes(!expandedTypes())}
            variant="text"
            fullWidth
            sx={{ 
              justifyContent: 'flex-start', 
              mb: 1,
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#1B3A57'
              }
            }}
          >
            <Typography variant="h6" sx={{ color: '#ffffff' }}>
              All 16 MBTI Types {expandedTypes() ? '▼' : '▶'}
            </Typography>
          </Button>
          
          <Show when={expandedTypes()}>
            <Grid container spacing={2}>
              <For each={Object.entries(mbtiTypes)}>
                {([typeName, typeInfo]) => {
                  return (
                    <Grid item xs={12} sm={6} md={4}>
                      <Card 
                        variant={typeName === props.currentType() ? "outlined" : "elevation"}
                        sx={{ 
                          height: '100%',
                          border: 2,
                          borderColor: typeName === props.currentType() ? '#7CE2FF' : '#4A6E8D',
                          backgroundColor: '#1B3A57'
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                              {typeName}
                            </Typography>
                            <Show when={typeName === props.currentType()}>
                              <Chip 
                                label="Your Type" 
                                size="small" 
                                sx={{ 
                                  ml: 1,
                                  backgroundColor: '#7CE2FF',
                                  color: '#1B3A57'
                                }}
                              />
                            </Show>
                          </Box>
                          
                          <Typography variant="body2" sx={{ mb: 2, color: '#7CE2FF' }}>
                            {typeInfo.description}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ mr: 1, fontWeight: 'bold', color: '#ffffff' }}>
                              Stack:
                            </Typography>
                            <For each={typeInfo.functions}>
                              {(func, index) => (
                                <Chip 
                                  label={func}
                                  size="small"
                                  variant={index() === 0 ? 'filled' : 'outlined'}
                                  sx={{ 
                                    fontSize: '0.7rem',
                                    backgroundColor: index() === 0 ? '#7CE2FF' : 'transparent',
                                    color: index() === 0 ? '#1B3A57' : '#7CE2FF',
                                    borderColor: '#7CE2FF'
                                  }}
                                />
                              )}
                            </For>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                }}
              </For>
            </Grid>
          </Show>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MBTIReference;

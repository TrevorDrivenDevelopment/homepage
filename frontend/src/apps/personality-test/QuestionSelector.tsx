import { Component, For, Show } from 'solid-js';
import { createTheme, ThemeProvider } from '@suid/material/styles';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  LinearProgress, 
  Box,
  Stack,
  Grid,
  useMediaQuery,
  useTheme
} from '@suid/material';
import QuestionCard from './components/QuestionCard';
import CurrentScores from './components/CurrentScores';
import TopTypesDisplay from './components/TopTypesDisplay';
import FunctionStackEditor from './components/FunctionStackEditor';
import MBTIReference from './components/MBTIReference';
import { usePersonalityTest } from './hooks/usePersonalityTest';

interface QuestionSelectorProps {
  onNavigate?: (_page: string) => void;
}

const QuestionSelector: Component<QuestionSelectorProps> = (props) => {
  // Create dark theme to match the homepage
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#7CE2FF',
      },
      secondary: {
        main: '#4A6E8D',
      },
      background: {
        default: '#1B3A57',
        paper: '#4A6E8D',
      },
      text: {
        primary: '#ffffff',
        secondary: '#7CE2FF',
      },
    },
  });

  const {
    responses,
    functionStack,
    showEditStack,
    functionScores,
    enhancedFunctionScores,
    currentType,
    closestTypes,
    isTestComplete,
    progressPercentage,
    updateResponse,
    updateFunctionStack,
    resetTest,
    toggleEditStack,
    questions
  } = usePersonalityTest();

  const theme = useTheme();
  const isDesktop = useMediaQuery(() => theme.breakpoints.up('md'));

  // Function to handle question answers without scrolling
  const handleQuestionAnswer = (questionId: string, value: boolean | null) => {
    // Store current scroll position
    const currentScrollY = window.scrollY;
    
    updateResponse(questionId, value);
    
    // Restore scroll position after state update
    requestAnimationFrame(() => {
      window.scrollTo(0, currentScrollY);
    });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div style={{ 
        "background-color": "#1B3A57",
        color: "#ffffff",
        "min-height": "100vh",
        padding: "20px 0"
      }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Show when={props.onNavigate}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Button 
                variant="text" 
                onClick={() => props.onNavigate?.('applications')}
                sx={{ color: '#7CE2FF', textDecoration: 'underline' }}
              >
                ← Back to Applications
              </Button>
            </Box>
          </Show>
          
          <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ color: '#ffffff' }}>
            MBTI Personality Test
          </Typography>
          
          <Typography variant="h6" component="p" align="center" sx={{ mb: 4, color: '#7CE2FF' }}>
            Based on Cognitive Functions Theory
          </Typography>

          {/* Progress Bar */}
          <Card sx={{ mb: 4, backgroundColor: '#4A6E8D', border: '1px solid #4A6E8D' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                Progress: {progressPercentage()}% Complete
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={progressPercentage()} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: '#1B3A57',
                  '& .suid-linear-progress-bar': {
                    backgroundColor: '#7CE2FF'
                  }
                }}
              />
              <Typography variant="body2" sx={{ mt: 1, color: '#7CE2FF' }}>
                {responses().filter(r => r.value !== null).length} of {questions.length} questions answered
              </Typography>
            </CardContent>
          </Card>

          {/* Main Content with Responsive Layout */}
          <Grid container spacing={3}>
            {/* Main Content */}
            <Grid item xs={12} md={8}>
              {/* Control Buttons - only show when there are responses */}
              <Show when={responses().length > 0}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
                  <Button 
                    variant="outlined" 
                    onClick={toggleEditStack}
                    color={showEditStack() ? 'secondary' : 'primary'}
                    sx={{
                      borderColor: showEditStack() ? '#4A6E8D' : '#7CE2FF',
                      color: showEditStack() ? '#4A6E8D' : '#7CE2FF',
                      '&:hover': {
                        backgroundColor: '#4A6E8D',
                        color: '#ffffff'
                      }
                    }}
                  >
                    {showEditStack() ? 'Use Calculated Stack' : 'Edit Function Stack'}
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={resetTest}
                    sx={{
                      borderColor: '#ff6b6b',
                      color: '#ff6b6b',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        borderColor: '#ffffff'
                      }
                    }}
                  >
                    Reset Test
                  </Button>
                </Box>
              </Show>

              {/* Questions */}
              <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#ffffff' }}>
                Questions
              </Typography>
              
              <Stack spacing={3} sx={{ mb: 4 }}>
                <For each={questions}>
                  {(question) => {
                    const response = () => responses().find(r => r.questionId === question.id);
                    return (
                      <QuestionCard
                        question={question}
                        selectedValue={response()?.value ?? null}
                        onAnswer={(value) => handleQuestionAnswer(question.id, value)}
                      />
                    );
                  }}
                </For>
              </Stack>

              {/* Mobile/Tablet sections - only show when not desktop */}
              <Show when={!isDesktop() && responses().length > 0}>
                <Stack spacing={3} sx={{ mb: 4 }}>
                  <TopTypesDisplay 
                    topTypes={closestTypes()}
                    currentType={currentType()}
                    isComplete={isTestComplete()}
                  />
                  
                  <Show when={showEditStack()}>
                    <FunctionStackEditor 
                      functionStack={functionStack()}
                      onStackChange={updateFunctionStack}
                    />
                  </Show>
                  
                  <CurrentScores 
                    scores={functionScores()}
                    enhancedScores={enhancedFunctionScores()}
                  />
                </Stack>
              </Show>

              {/* Reference */}
              <MBTIReference 
                currentType={currentType}
                gridColors={{}}
              />
            </Grid>

            {/* Sticky Sidebar - only show on desktop */}
            <Show when={isDesktop()}>
              <Grid item md={4}>
                <Box
                  sx={{
                    position: 'sticky',
                    top: '20px',
                    maxHeight: 'calc(100vh - 40px)',
                    overflowY: 'auto'
                  }}
                >
                  <Show when={responses().length > 0}>
                    <Stack spacing={3}>
                      {/* Current Best Matches in sidebar */}
                      <TopTypesDisplay 
                        topTypes={closestTypes()}
                        currentType={currentType()}
                        isComplete={isTestComplete()}
                      />
                      
                      {/* Function Stack Editor in sidebar when active */}
                      <Show when={showEditStack()}>
                        <FunctionStackEditor 
                          functionStack={functionStack()}
                          onStackChange={updateFunctionStack}
                        />
                      </Show>
                      
                      {/* Function Preferences in sidebar */}
                      <CurrentScores 
                        scores={functionScores()}
                        enhancedScores={enhancedFunctionScores()}
                      />
                    </Stack>
                  </Show>
                </Box>
              </Grid>
            </Show>
          </Grid>
        </Container>
      </div>
    </ThemeProvider>
  );
};

export default QuestionSelector;

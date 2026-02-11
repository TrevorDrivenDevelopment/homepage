import { Component, For, Show, createSignal } from 'solid-js';
import { A } from '@solidjs/router';
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
  useTheme,
  Alert
} from '@suid/material';
import QuestionCard from './components/QuestionCard';
import CurrentScores from './components/CurrentScores';
import TopTypesDisplay from './components/TopTypesDisplay';
import FunctionStackEditor from './components/FunctionStackEditor';
import MBTIReference from './components/MBTIReference';
import { usePersonalityTest } from './hooks/usePersonalityTest';

const QuestionSelector: Component = () => {
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
    dimensionConfidence,
    confidenceSufficient,
    consistency,
    attentionCheck,
    updateResponse,
    updateFunctionStack,
    resetTest,
    toggleEditStack,
    exportResults,
    importResults,
    questions
  } = usePersonalityTest();

  const [importMessage, setImportMessage] = createSignal<{ text: string; severity: 'success' | 'error' } | null>(null);

  const theme = useTheme();
  const isDesktop = useMediaQuery(() => theme.breakpoints.up('md'));

  // Function to handle question answers without scrolling
  const handleQuestionAnswer = (questionId: string, value: number) => {
    // Store current scroll position
    const currentScrollY = window.scrollY;
    
    updateResponse(questionId, value);
    
    // Restore scroll position after state update
    requestAnimationFrame(() => {
      window.scrollTo(0, currentScrollY);
    });
  };

  // Check if a question's dimension has sufficient confidence (for adaptive "optional" marking)
  const isQuestionOptional = (question: typeof questions[0]): boolean => {
    if (!question.functionType || question.category === 'attention-check' || question.category === 'ei-orientation') return false;
    const conf = dimensionConfidence();
    const dimConf = conf.find(d => d.dimension === question.functionType);
    return dimConf?.sufficient === true && (question.discriminationTier || 0) >= 3;
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
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <A 
              href="/applications"
              style={{ color: '#7CE2FF', "text-decoration": 'underline', "font-size": '14px' }}
            >
              ← Back to Applications
            </A>
          </Box>
          
          <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ color: '#ffffff' }}>
            MBTI Personality Test
          </Typography>
          
          <Typography variant="h6" component="p" align="center" sx={{ mb: 2, color: '#7CE2FF' }}>
            Based on Cognitive Functions Theory
          </Typography>

          {/* Empirical validity disclaimer */}
          <Box sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
            <Typography variant="body2" align="center" sx={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', fontSize: '0.8rem' }}>
              This test is based on Jungian cognitive function theory. While widely used for self-reflection, 
              the MBTI framework has limited empirical validation compared to models like the Big Five. 
              Results should be viewed as a starting point for self-understanding, not a definitive classification.
            </Typography>
          </Box>

          {/* Import status message */}
          <Show when={importMessage()}>
            <Box sx={{ maxWidth: 700, mx: 'auto', mb: 3 }}>
              <Alert 
                severity={importMessage()!.severity}
                sx={{ 
                  backgroundColor: importMessage()!.severity === 'success' 
                    ? 'rgba(76, 175, 80, 0.15)' 
                    : 'rgba(244, 67, 54, 0.15)',
                  color: importMessage()!.severity === 'success' ? '#66bb6a' : '#ef5350'
                }}
              >
                {importMessage()!.text}
              </Alert>
            </Box>
          </Show>

          {/* Attention check warning */}
          <Show when={attentionCheck().checked && !attentionCheck().passed}>
            <Box sx={{ maxWidth: 700, mx: 'auto', mb: 3 }}>
              <Alert severity="warning" sx={{ backgroundColor: 'rgba(255, 152, 0, 0.15)', color: '#ff9800' }}>
                Attention check failed — please read each question carefully for accurate results.
              </Alert>
            </Box>
          </Show>

          {/* Consistency warning */}
          <Show when={consistency().results.length > 0 && consistency().overallScore < 50}>
            <Box sx={{ maxWidth: 700, mx: 'auto', mb: 3 }}>
              <Alert severity="info" sx={{ backgroundColor: 'rgba(33, 150, 243, 0.15)', color: '#42a5f5' }}>
                Some of your answers appear inconsistent ({consistency().overallScore}% consistency). 
                This is normal — consider revisiting questions where you felt unsure.
              </Alert>
            </Box>
          </Show>

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
                {responses().length} of {questions.length} questions answered
                {confidenceSufficient() && ' — results are reliable, remaining questions are optional'}
              </Typography>
            </CardContent>
          </Card>

          {/* Main Content with Responsive Layout */}
          <Grid container spacing={3}>
            {/* Main Content */}
            <Grid item xs={12} md={8}>
              {/* Import button - always visible */}
              <Show when={responses().length === 0}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setImportMessage(null);
                      importResults()
                        .then(({ imported, skipped, total }) => {
                          const msg = skipped > 0
                            ? `Imported ${imported} of ${total} responses (${skipped} skipped — questions no longer exist).`
                            : `Imported ${imported} responses successfully.`;
                          setImportMessage({ text: msg, severity: 'success' });
                          setTimeout(() => setImportMessage(null), 8000);
                        })
                        .catch((err: Error) => {
                          if (err.message !== 'Import cancelled') {
                            setImportMessage({ text: err.message, severity: 'error' });
                            setTimeout(() => setImportMessage(null), 8000);
                          }
                        });
                    }}
                    sx={{
                      borderColor: '#42a5f5',
                      color: '#42a5f5',
                      '&:hover': {
                        backgroundColor: 'rgba(66, 165, 245, 0.1)',
                        borderColor: '#ffffff'
                      }
                    }}
                  >
                    Import Previous Results (JSON)
                  </Button>
                </Box>
              </Show>

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
                    onClick={exportResults}
                    sx={{
                      borderColor: '#4caf50',
                      color: '#4caf50',
                      '&:hover': {
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderColor: '#ffffff'
                      }
                    }}
                  >
                    Export Results (JSON)
                  </Button>

                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setImportMessage(null);
                      importResults()
                        .then(({ imported, skipped, total }) => {
                          const msg = skipped > 0
                            ? `Imported ${imported} of ${total} responses (${skipped} skipped — questions no longer exist).`
                            : `Imported ${imported} responses successfully.`;
                          setImportMessage({ text: msg, severity: 'success' });
                          setTimeout(() => setImportMessage(null), 8000);
                        })
                        .catch((err: Error) => {
                          if (err.message !== 'Import cancelled') {
                            setImportMessage({ text: err.message, severity: 'error' });
                            setTimeout(() => setImportMessage(null), 8000);
                          }
                        });
                    }}
                    sx={{
                      borderColor: '#42a5f5',
                      color: '#42a5f5',
                      '&:hover': {
                        backgroundColor: 'rgba(66, 165, 245, 0.1)',
                        borderColor: '#ffffff'
                      }
                    }}
                  >
                    Import Results (JSON)
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
              
              <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.6)' }}>
                For each question, indicate how strongly you prefer option A or option B.
                Questions are presented in adaptive order — the most informative questions appear first.
              </Typography>
              
              <Stack spacing={3} sx={{ mb: 4 }}>
                <For each={questions}>
                  {(question) => {
                    const response = () => responses().find(r => r.questionId === question.id);
                    return (
                      <QuestionCard
                        question={question}
                        selectedValue={response()?.value}
                        onAnswer={(value) => handleQuestionAnswer(question.id, value)}
                        isOptional={isQuestionOptional(question)}
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
                    dimensionConfidence={dimensionConfidence()}
                    confidenceSufficient={confidenceSufficient()}
                    currentType={currentType()}
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
                        dimensionConfidence={dimensionConfidence()}
                        confidenceSufficient={confidenceSufficient()}
                        currentType={currentType()}
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

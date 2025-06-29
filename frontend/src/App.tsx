import { Box, Container, Link, Typography } from '@mui/material';
import { BrowserRouter, Route, Link as RouterLink, Routes } from 'react-router-dom';
import './App.css';
import PersonalApplications from './apps/PersonalApplications';
import QuestionSelector from './apps/personality-test/QuestionSelector';
import OptionsCalculator from './apps/options-calculator';
import { defaultGridColors } from './apps/personality-test/theme/mbtiTheme';
import { getAssetPath } from './utils/assetPath';

interface GridItem {
  title: string;
  icon: string;
  linkText: string;
  linkUrl: string;
  description: string;
  isInternal?: boolean;
}

const gridItems: GridItem[] = [
  {
    title: 'My YouTube Channel',
    icon: '/static/youtube.png',
    linkText: 'YouTube channel',
    linkUrl: 'https://www.youtube.com/@TrevorDrivenDevelopment',
    description: 'Watch software education videos on my'
  },
  {
    title: 'My LinkedIn Profile',
    icon: '/static/linkedin.png',
    linkText: 'LinkedIn',
    linkUrl: 'https://linkedin.com/in/trevortiernan',
    description: 'Connect with me on'
  },
  {
    title: 'My Resume',
    icon: '/static/resume.png',
    linkText: 'resume',
    linkUrl: '/static/resume.pdf',
    description: 'Download my'
  },
  {
    title: 'My GitHub',
    icon: '/static/github.png',
    linkText: 'projects',
    linkUrl: 'https://github.com/orgs/TrevorDrivenDevelopment/repositories',
    description: 'Check out some of my'
  },
  {
    title: 'Side projects',
    icon: '/static/github.png',
    linkText: 'side projects live',
    linkUrl: '/applications',
    description: 'See my',
    isInternal: true
  }
];

const HomePage = () => {
  const gridColors = defaultGridColors;

  const GridItemComponent = ({ item }: { item: GridItem }) => (
    <Box 
      className="Grid-box" 
      sx={{ 
        textAlign: 'left', 
        bgcolor: gridColors.panel, 
        p: 2, 
        borderRadius: 2, 
        height: 'auto',
        minHeight: '100px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography variant="h6" component="h2" gutterBottom style={{ display: 'flex', alignItems: 'center' }}>
        <img src={getAssetPath(item.icon)} alt={item.title} style={{ width: '30px', marginRight: '8px' }} />
        {item.title}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {item.description}{' '}
        {item.isInternal ? (
          <Link component={RouterLink} to={item.linkUrl} sx={{color: gridColors.linkColor}}>
            {item.linkText}
          </Link>
        ) : (
          <Link sx={{color: gridColors.linkColor}} href={item.linkUrl} target="_blank" rel="noopener noreferrer">
            {item.linkText}
          </Link>
        )}
      </Typography>
    </Box>
  );

  return (
    <Container className="App">
      <header className="App-header">
        <Typography variant="h5" component="h1" gutterBottom>
          Trevor Driven Development
        </Typography>
      </header>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {gridItems.map((item, index) => (
          <Box key={index} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
            <GridItemComponent item={item} />
          </Box>
        ))}
      </Box>
    </Container>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/applications" element={<PersonalApplications />} />
        <Route path="/questions" element={<QuestionSelector />} />
        <Route path="/options-calculator" element={<OptionsCalculator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

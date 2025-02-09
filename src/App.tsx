import { Container, Typography, Link, Box, Grid } from '@mui/material';
import './App.css';
import { getAssetPath } from './utils/assetPath';
import React from "react";

interface GridItem {
  title: string;
  icon: string;
  linkText: string;
  linkUrl: string;
  description: string;
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
    linkUrl: 'https://github.com/trevordrivendevelopment',
    description: 'Check out some of my'
  }
];

const App = () => {
  const gridColors = {
    panel: '#4A6E8D',
    linkColor: '#7CE2FF',
  };

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
        <Link sx={{color: gridColors.linkColor}} href={item.linkUrl} target="_blank" rel="noopener noreferrer">
          {item.linkText}
        </Link>
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

      <Grid container spacing={2}>
        {gridItems.map((item, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <GridItemComponent item={item} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default App;
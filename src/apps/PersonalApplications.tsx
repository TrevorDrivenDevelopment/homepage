import React from 'react';
import { Container, Typography, Link, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { getAssetPath } from '../utils/assetPath';

interface ApplicationItem {
  title: string;
  icon: string;
  linkText: string;
  linkUrl: string;
  description: string;
}

const applications: ApplicationItem[] = [
  {
    title: '16 personalities test',
    icon: '/static/github.png',
    linkText: 'MBTI test',
    linkUrl: '/questions',
    description: 'Explore your personality with the',
  },
];

const PersonalApplications: React.FC = () => {
  const gridColors = {
    panel: '#4A6E8D',
    linkColor: '#7CE2FF',
  };

  const ApplicationItemComponent = ({ item }: { item: ApplicationItem }) => (
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
        <Link component={RouterLink} to={item.linkUrl} sx={{color: gridColors.linkColor}}>
          {item.linkText}
        </Link>
      </Typography>
    </Box>
  );

  return (
    <Container className="App">
      <header className="App-header">
        <Typography variant="h5" component="h1" gutterBottom>
          My Tools & Applications
        </Typography>
        <Link component={RouterLink} to="/" style={{ color: gridColors.linkColor, textDecoration: 'none' }}>
          ← Back to Home
        </Link>
      </header>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {applications.map((item, index) => (
          <Box key={index} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
            <ApplicationItemComponent item={item} />
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default PersonalApplications;

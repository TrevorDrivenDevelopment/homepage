import { Box, Container, Link, Typography } from '@mui/material';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getAssetPath } from '../utils/assetPath';
import { defaultGridColors } from './personality-test/theme/mbtiTheme';

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
  {
    title: 'Options Calculator',
    icon: '/static/github.png',
    linkText: 'Options Calculator',
    linkUrl: '/options-calculator',
    description: 'Calculate potential gains and losses for stock options with the',
  },
];

const PersonalApplications: React.FC = () => {
  const gridColors = defaultGridColors;

  interface ApplicationItemComponentProps {
    item: ApplicationItem;
    gridColors: typeof defaultGridColors;
  }

  const ApplicationItemComponent: React.FC<ApplicationItemComponentProps> = ({ item, gridColors }) => (
    <Box
      sx={{
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
        <Link component={RouterLink} to={item.linkUrl} sx={{ color: gridColors.linkColor }}>
          {item.linkText}
        </Link>
      </Typography>
    </Box>
  );

  return (
    <Container className="App">
      <header className="App-header">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {applications.map((item, index) => (
            <Box key={index} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <ApplicationItemComponent item={item} gridColors={gridColors} />
            </Box>
          ))}
        </Box>
      </header>
    </Container>
  );
};

export default PersonalApplications;

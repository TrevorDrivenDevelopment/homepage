import { Container, Typography, Link, Box, Grid2 } from '@mui/material';
import linkedInlogo from './static/linkedin.png';
import githubLogo from './static/github.png';
import youtubeLogo from './static/youtube.png';
import resumeLogo from './static/resume.png';
import './App.css';
import { FC } from "react";

const App : FC  = () => {
  return (
    <Container className="App">
      <header className="App-header">
        <Typography variant="h5" component="h1" gutterBottom>
          Trevor Driven Development
        </Typography>
      </header>

      <Grid2 container spacing={2}>
        <Grid2 size={6}>
          <Box className="Grid2-box" sx={{ textAlign: 'left' }}>
            <Typography variant="h6" component="h2" gutterBottom style={{ display: 'flex', alignItems: 'center' }}>
              <img src={youtubeLogo} alt="YouTube" style={{ width: '30px', marginRight: '8px' }} />
              My YouTube Channel
            </Typography>
            <Typography variant="body1" gutterBottom>
              Watch software education videos on my <Link href="https://www.youtube.com/@TrevorDrivenDevelopment" target="_blank" rel="noopener noreferrer">YouTube channel</Link>.
            </Typography>
          </Box>
        </Grid2>

        <Grid2 size={6}>
          <Box className="Grid2-box" sx={{ textAlign: 'left' }}>
            <Typography variant="h6" component="h2" gutterBottom style={{ display: 'flex', alignItems: 'center' }}>
              <img src={resumeLogo} alt="Resume" style={{ width: '30px', marginRight: '8px' }} />
              My Resume
            </Typography>
            <Typography variant="body1" gutterBottom>
              Download my <Link href="/static/resume.pdf" target="_blank" rel="noopener noreferrer">resume</Link>
            </Typography>
          </Box>
        </Grid2>

        <Grid2 size={6}>
          <Box className="Grid2-box" sx={{ textAlign: 'left' }}>
            <Typography variant="h6" component="h2" gutterBottom style={{ display: 'flex', alignItems: 'center' }}>
              <img src={linkedInlogo} alt="LinkedIn" style={{ width: '30px', marginRight: '8px' }} />
              My LinkedIn Profile
            </Typography>
            <Typography>
              Connect with me on <Link href="https://linkedin.com/in/trevortiernan" target="_blank" rel="noopener noreferrer">LinkedIn</Link>
            </Typography>
          </Box>
        </Grid2>

        <Grid2 size={6}>
          <Box className="Grid2-box" sx={{ textAlign: 'left' }}>
            <Typography variant="h6" component="h2" gutterBottom style={{ display: 'flex', alignItems: 'center' }}>
              <img src={githubLogo} alt="GitHub" style={{ width: '30px', marginRight: '8px' }} />
              My GitHub
            </Typography>
            <Typography variant="body1" gutterBottom>
              Check out some of my projects.
            </Typography>
          </Box>
        </Grid2>
      </Grid2>
    </Container>
  );
}

export default App;
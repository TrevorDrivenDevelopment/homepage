import { For, createSignal, createEffect, createMemo } from 'solid-js';
import PersonalApplications from './apps/PersonalApplications';
import LiveOptionsCalculator from './apps/options-calculator/LiveOptionsCalculator';
import QuestionSelector from './apps/personality-test/QuestionSelector';

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

// eslint-disable-next-line no-unused-vars
const GridItemComponent = (props: { item: GridItem; onNavigate: (url: string, isInternal: boolean) => void }) => {
  const panelColor = '#4A6E8D';
  const linkColor = '#7CE2FF';
  
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    console.log('Click detected:', props.item.linkText, 'isInternal:', props.item.isInternal);
    if (props.item.isInternal) {
      props.onNavigate(props.item.linkUrl, true);
    } else {
      props.onNavigate(props.item.linkUrl, false);
    }
  };
  
  return (
    <div 
      style={{ 
        "text-align": 'left', 
        "background-color": panelColor, 
        padding: '16px',
        "border-radius": '8px',
        height: 'auto',
        "min-height": '100px',
        display: 'flex',
        "flex-direction": 'column'
      }}
    >
      <h2 style={{ display: 'flex', "align-items": 'center', margin: '0 0 16px 0' }}>
        <img src={props.item.icon} alt={props.item.title} style={{ width: '30px', "margin-right": '8px' }} />
        {props.item.title}
      </h2>
      <p style={{ margin: '0' }}>
        {props.item.description}{' '}
        <span 
          style={{ color: linkColor, cursor: 'pointer', "text-decoration": 'underline' }} 
          onClick={handleClick}>
          {props.item.linkText}
        </span>
      </p>
    </div>
  );
};

const App = () => {
  const [currentPage, setCurrentPage] = createSignal('home');

  // Debug effect to track page changes
  createEffect(() => {
    console.log('🔄 Page changed to:', currentPage());
  });

  // Create a memo to force reactivity
  const page = createMemo(() => currentPage());

  // Handle internal navigation from grid items
  const handleNavigation = (url: string, isInternal: boolean) => {
    console.log('handleNavigation called:', { url, isInternal });
    if (isInternal) {
      if (url === '/applications') {
        setCurrentPage('applications');
      }
    } else {
      console.log('Opening external URL:', url);
      window.open(url, '_blank', 'noopener noreferrer');
    }
  };

  // Handle navigation between apps
  const handleAppNavigation = (page: string) => {
    console.log('App navigation to:', page);
    setCurrentPage(page);
  };

  return (
    <div style={{ 
      "background-color": '#1B3A57',
      "min-height": '100vh',
      padding: '0'
    }}>
      <div style={{
        "max-width": '1200px', 
        margin: '0 auto', 
        padding: '20px'
      }}>
        {/* Page content */}
        {(() => {
          const currentPageValue = page();
          console.log('Rendering page:', currentPageValue);
          
          switch (currentPageValue) {
            case 'home':
              return (
                <div>
                  <header>
                    <h1 style={{ color: '#ffffff', "text-align": 'center' }}>
                      Trevor Driven Development
                    </h1>
                  </header>

                  <div style={{ display: 'flex', "flex-wrap": 'wrap', gap: '16px' }}>
                    <For each={gridItems}>{(item) => (
                      <div style={{ flex: '1 1 calc(50% - 8px)', "min-width": '300px' }}>
                        <GridItemComponent item={item} onNavigate={handleNavigation} />
                      </div>
                    )}</For>
                  </div>
                </div>
              );
              
            case 'applications':
              return <PersonalApplications onNavigate={handleAppNavigation} />;
              
            case 'personality-test':
              return <QuestionSelector onNavigate={handleAppNavigation} />;
              
            case 'options-calculator':
              return <LiveOptionsCalculator onNavigate={handleAppNavigation} />;
              
            default:
              return <div style={{ color: 'red' }}>Unknown page: {currentPageValue}</div>;
          }
        })()}
      </div>
    </div>
  );
}

export default App;

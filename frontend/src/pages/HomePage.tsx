import { For } from 'solid-js';
import { A } from '@solidjs/router';

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

const GridItemComponent = (props: { item: GridItem }) => {
  const panelColor = '#4A6E8D';
  const linkColor = '#7CE2FF';

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
        {props.item.isInternal ? (
          <A 
            href={props.item.linkUrl}
            style={{ color: linkColor, cursor: 'pointer', "text-decoration": 'underline' }}
          >
            {props.item.linkText}
          </A>
        ) : (
          <a 
            href={props.item.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: linkColor, cursor: 'pointer', "text-decoration": 'underline' }}
          >
            {props.item.linkText}
          </a>
        )}
      </p>
    </div>
  );
};

const HomePage = () => {
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
            <GridItemComponent item={item} />
          </div>
        )}</For>
      </div>
    </div>
  );
};

export default HomePage;

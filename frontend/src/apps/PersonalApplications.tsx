import { For } from 'solid-js';

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

/* eslint-disable @typescript-eslint/no-unused-vars */
interface PersonalApplicationsProps {
  onNavigate: (page: string) => void;
}

const PersonalApplications = (props: PersonalApplicationsProps) => {
  const panelColor = '#4A6E8D';
  const linkColor = '#7CE2FF';

  const ApplicationItemComponent = (itemProps: { item: ApplicationItem; onNavigate: PersonalApplicationsProps['onNavigate'] }) => (
    <div
      style={{
        display: 'flex',
        "flex-direction": 'column',
        padding: '16px',
        "background-color": panelColor,
        "border-radius": '8px',
        "min-height": '100px'
      }}
    >
      <h2 style={{ display: 'flex', "align-items": 'center', margin: '0 0 16px 0' }}>
        <img src={itemProps.item.icon} alt={itemProps.item.title} style={{ width: '30px', "margin-right": '8px' }} />
        {itemProps.item.title}
      </h2>
      <p style={{ margin: '0' }}>
        {itemProps.item.description}{' '}
        <span 
          onClick={() => {
            console.log('Application clicked, navigating to:', itemProps.item.linkUrl);
            if (itemProps.item.linkUrl === '/questions') {
              itemProps.onNavigate('personality-test');
            } else if (itemProps.item.linkUrl === '/options-calculator') {
              itemProps.onNavigate('options-calculator');
            }
          }}
          style={{ color: linkColor, cursor: 'pointer', "text-decoration": 'underline' }}
        >
          {itemProps.item.linkText}
        </span>
      </p>
    </div>
  );

  return (
    <div style={{ color: '#ffffff' }}>
      <header>
        <h1 style={{ color: '#ffffff', "text-align": 'center', "margin-bottom": '40px' }}>
          Personal Applications
        </h1>
      </header>
      
      <div style={{ display: 'flex', "flex-wrap": 'wrap', gap: '16px' }}>
        <For each={applications}>{(item) => (
          <div style={{ flex: '1 1 calc(50% - 8px)', "min-width": '300px' }}>
            <ApplicationItemComponent item={item} onNavigate={props.onNavigate} />
          </div>
        )}</For>
      </div>
      
      <div style={{ "margin-top": '40px', "text-align": 'center' }}>
        <span 
          onClick={() => props.onNavigate('home')}
          style={{ color: linkColor, cursor: 'pointer', "text-decoration": 'underline' }}
        >
          ← Back to Home
        </span>
      </div>
    </div>
  );
};

export default PersonalApplications;

import { For } from 'solid-js';
import { A } from '@solidjs/router';

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
    linkUrl: '/personality-test',
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

const ApplicationItemComponent = (itemProps: { item: ApplicationItem }) => {
  const panelColor = '#4A6E8D';
  const linkColor = '#7CE2FF';

  return (
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
        <A 
          href={itemProps.item.linkUrl}
          style={{ color: linkColor, cursor: 'pointer', "text-decoration": 'underline' }}
        >
          {itemProps.item.linkText}
        </A>
      </p>
    </div>
  );
};

const PersonalApplications = () => {
  const linkColor = '#7CE2FF';

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
            <ApplicationItemComponent item={item} />
          </div>
        )}</For>
      </div>
      
      <div style={{ "margin-top": '40px', "text-align": 'center' }}>
        <A 
          href="/"
          style={{ color: linkColor, cursor: 'pointer', "text-decoration": 'underline' }}
        >
          ← Back to Home
        </A>
      </div>
    </div>
  );
};

export default PersonalApplications;

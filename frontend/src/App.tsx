import type { RouteSectionProps } from '@solidjs/router';

const App = (props: RouteSectionProps) => {
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
        {props.children}
      </div>
    </div>
  );
}

export default App;

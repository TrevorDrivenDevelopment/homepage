import { Show } from 'solid-js';
import { MBTI_COLORS } from '../theme/mbtiTheme';

interface ResponsiveInfoIconProps {
  title: string;
  description: string;
  color?: string;
  isMobile: boolean;
  onShowInfo?: (title: string, description: string) => void;
}

const ResponsiveInfoIcon = (props: ResponsiveInfoIconProps) => {
  const color = () => props.color || MBTI_COLORS.primary;
  
  const handleClick = () => {
    if (props.isMobile && props.onShowInfo) {
      props.onShowInfo(props.title, props.description);
    }
  };

  return (
    <Show 
      when={props.isMobile}
      fallback={
        <button 
          title={props.description}
          style={{ 
            background: "none",
            border: "none",
            padding: "2px",
            color: color(),
            cursor: "pointer",
            display: "inline-flex",
            "align-items": "center",
            "justify-content": "center",
            "border-radius": "50%",
            "min-width": "auto"
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </button>
      }
    >
      <button 
        onClick={handleClick}
        style={{ 
          background: "none",
          border: "none",
          padding: "2px",
          color: color(),
          cursor: "pointer",
          display: "inline-flex",
          "align-items": "center",
          "justify-content": "center",
          "border-radius": "50%",
          "min-width": "auto"
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      </button>
    </Show>
  );
};

export default ResponsiveInfoIcon;
